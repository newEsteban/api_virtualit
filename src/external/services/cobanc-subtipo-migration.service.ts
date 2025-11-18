import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TblEstadosNew } from "../entities/tbl-estados-new.entity";
import { TblTiposNew } from "../entities/tbl-tipos-new.entity";
import { Subtipo } from "../../subtipo/entities/subtipo.entity";
import { Tipo } from "../../tipo/entities/tipo.entity";
import { MigrateEstadoDto, MigrateSubtipoDto } from "../dtos/local-general.dto";
import { TipoService } from "../../tipo/tipo.service";
import { SubtipoService } from "../../subtipo/subtipo.service";

 

@Injectable()
export class CobancSubtipoMigrationService {
    private readonly logger = new Logger(CobancSubtipoMigrationService.name);

    constructor(
        @InjectRepository(TblEstadosNew, 'newSistemasConnection')
        private readonly tblEstadosNewRepository: Repository<TblEstadosNew>,

        @InjectRepository(TblTiposNew, 'newSistemasConnection')
        private readonly tblTiposNewRepository: Repository<TblTiposNew>,

        private readonly tipoService: TipoService,
        private readonly subtipoService: SubtipoService,
    ) {}

    /**
     * Verifica si un estado/subtipo ya existe localmente buscando por `subtipo_conbanc_id`.
     * Acepta tanto un número (estado_id) como un `MigrateEstadoDto`.
     * @param estadoOrDto - `estado_id` o `MigrateEstadoDto`
     * @returns Promise<boolean> - true si existe, false si no
     */
    async checkEstadoExists(estadoOrDto: number | MigrateEstadoDto): Promise<boolean> {
        const estadoId = typeof estadoOrDto === 'number' ? estadoOrDto : estadoOrDto.estado_id;

        this.logger.log(`Verificando existencia de subtipo con subtipo_conbanc_id: ${estadoId}`);

        const subtipo = await this.subtipoService.findBySubtipoCobancId(estadoId);
        
        if (!subtipo) {
            this.logger.log(`El subtipo no existe se procedera a crearlo por medio del tipo id: ${estadoId}`);
        }

        return subtipo !== null;
    }

    async getSubTipoByCobancId(subtipoCobancId: number): Promise<TblEstadosNew | null> {
        const subtipo = await this.tblEstadosNewRepository.findOne({ where: { id_subtipo: subtipoCobancId } });
        return subtipo ?? null;
    }


    public async migrateSubtipos(request : MigrateSubtipoDto) {
        const { tipo_id } = request;

        let tipo = await this.tipoService.findOneIdCobanc(tipo_id, false);

        if (!tipo) {
           this.logger.log(`Tipo con ID ${tipo_id} no existe. Creando tipo...`);
           tipo = await this.migrateTipo(tipo_id);
        }

        this.logger.log(`✅ Tipo con ID ${tipo.id} existe. Procediendo con la migración del subtipo...`);

        await this.validationAndMigrationSubtipo(tipo);

        return {
            message: `Migración de subtipos para el tipo con ID ${tipo.id} completada.`,
        };
    }

    private async migrateTipo(tipoId: number): Promise<Tipo> {
        //si no exite el tipo, lo creamos en base al tipoCobanc
        const tipoCobanc = await this.tblTiposNewRepository.findOne({
            where: { id_tipo: tipoId }
        });

        //validamos si no existe el tipoCobanc
        if (!tipoCobanc) {
            this.logger.warn(`Tipo con ID ${tipoId} no encontrado en gestion_coban`);
            throw new Error(`Tipo con ID ${tipoId} no encontrado en gestion_coban`);
        }

        this.logger.log(`Creando tipo con ID ${tipoId} antes de migrar el subtipo...`);
        const tipo = await this.tipoService.create({
            tipo_cobanc_id: tipoCobanc.id_tipo,
            nombre: tipoCobanc.nombre,
            descripcion: tipoCobanc.descripcion,
        });

        this.logger.log(`Tipo con ID ${tipoCobanc.id_tipo} creado exitosamente.`);
        
        return tipo
    }

    /**
     * Valida y migra los subtipos asociados a un tipo específico.
     * 
     * Esta función realiza las siguientes operaciones:
     * 1. Obtiene todos los subtipos de Cobanc asociados al tipo_cobanc_id del tipo local.
     * 2. Compara con los subtipos ya existentes en el sistema local para identificar cuáles faltan por migrar.
     * 3. Si hay subtipos nuevos, los crea en paralelo usando Promise.allSettled para manejar errores individualmente.
     * 4. Registra logs para cada subtipo migrado exitosamente o con error.
     * 
     * @param tipo - El tipo local para el cual se van a validar y migrar los subtipos.
     * @returns Promise<void> - No retorna valor, pero registra el progreso y errores en los logs.
     */
    private async validationAndMigrationSubtipo(tipo: Tipo) {

        this.logger.log(`Validando y migrando subtipos para el tipo con ID ${tipo.id}`);

        let newSubtipos = await this.tblEstadosNewRepository.find({
            where: { id_tipo: tipo.tipo_cobanc_id },
        });

        const subtipoCobancIds = newSubtipos.map(subtipo => subtipo.id_subtipo);
        const subtipoIds =  await this.subtipoService.getIdsByTipo(tipo.id);

        //validamos cuales subtipos faltan por migrar
        const subtipoIdsToMigrate = subtipoCobancIds.filter(id => !subtipoIds.includes(id));
        if(subtipoIdsToMigrate.length === 0) {
            this.logger.log(`No hay nuevos subtipos para migrar para el tipo con ID ${tipo.id}`);
            return;
        }

        this.logger.log(`Se encontraron ${subtipoIdsToMigrate.length} nuevos subtipos para migrar para el tipo con ID ${tipo.id}`);

        newSubtipos = newSubtipos.filter(subtipo => subtipoIdsToMigrate.includes(subtipo.id_subtipo));

        const results = await Promise.allSettled(
            newSubtipos.map(subtipoConbanc =>
                this.subtipoService.createBySubtipoCobanc(subtipoConbanc, tipo.id)
            )
        );

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.logger.error(`Error en subtipo ${newSubtipos[index].id_subtipo}: ${result.reason}`);
            } else {
                this.logger.log(`Subtipo ${newSubtipos[index].id_subtipo} migrado exitosamente`);
            }
        });
        this.logger.log(`Migración de subtipos para el tipo con ID ${tipo.id} completada.`);
    }
}