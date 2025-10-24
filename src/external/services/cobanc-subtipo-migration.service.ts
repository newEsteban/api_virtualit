import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TblEstadosNew } from "../entities/tbl-estados-new.entity";
import { TblTiposNew } from "../entities/tbl-tipos-new.entity";
import { Subtipo } from "../../subtipo/entities/subtipo.entity";
import { Tipo } from "../../tipo/entities/tipo.entity";
import { MigrateSubtipoDto } from "../dtos/local-general.dto";
import { TipoService } from "../../tipo/tipo.service";

@Injectable()
export class CobancSubtipoMigrationService {
    private readonly logger = new Logger(CobancSubtipoMigrationService.name);

    constructor(
        @InjectRepository(TblEstadosNew, 'newSistemasConnection')
        private readonly tblEstadosNewRepository: Repository<TblEstadosNew>,

        @InjectRepository(TblTiposNew, 'newSistemasConnection')
        private readonly tblTiposNewRepository: Repository<TblTiposNew>,

        @InjectRepository(Subtipo)
        private readonly estadoLocalRepository: Repository<Subtipo>,

        private readonly tipoService: TipoService,
    ) {}

    async updateOrCreateSubtiposAndTipos( request: MigrateSubtipoDto ) {
        const { subtipo_id, tipo_id } = request;

        if (!subtipo_id && !tipo_id) {
            this.logger.warn('No se proporcionaron IDs de subtipo o tipo');
            return;
        }

        if (subtipo_id) {
            this.migrateSubtipo(subtipo_id);
        }

    }

    private async migrateSubtipo(subtipoId: number) {
        const subtipoCobanc = await this.tblEstadosNewRepository.findOne({ 
            where: { id_subtipo: subtipoId } 
        });

        if (!subtipoCobanc) {
            this.logger.warn(`Subtipo con ID ${subtipoId} no encontrado en gestion_coban`);
            return null;
        }

        // 🔍 Validar que el tipo existe antes de crear/actualizar el subtipo
        let tipo = await this.tipoService.findOneIdCobanc(subtipoCobanc.id_tipo, false);

        if (!tipo) {
           this.logger.log(`Tipo con ID ${subtipoCobanc.id_tipo} no existe. Creando tipo...`);
           tipo = await this.migrateTipo(subtipoCobanc.id_tipo);
        }

        this.logger.log(`✅ Tipo con ID ${tipo.id} existe. Procediendo con la migración del subtipo...`);
        
        let subtipoLocal = await this.estadoLocalRepository.findOne({ 
            where: { subtipo_conbanc_id: subtipoId } 
        });

        if (subtipoLocal) {
            this.logger.log(`Actualizando subtipo local con ID ${subtipoId}`);
            subtipoLocal.nombre = subtipoCobanc.descripcion;
            subtipoLocal.tipo_id = tipo.id;
        } else {
            this.logger.log(`Creando nuevo subtipo local con ID ${subtipoId}`);
            subtipoLocal = this.estadoLocalRepository.create({
                subtipo_conbanc_id: subtipoCobanc.id_subtipo, // 🔑 Campo obligatorio
                nombre: subtipoCobanc.descripcion,
                tipo_id: tipo.id,
            });
        }

        this.logger.debug('Datos del subtipo a guardar:', subtipoLocal);

        return this.estadoLocalRepository.save(subtipoLocal);
    }

    private async migrateTipo(tipoId: number) {
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
        const newTipo = await this.tipoService.create({
            tipo_cobanc_id: tipoCobanc.id_tipo,
            nombre: tipoCobanc.nombre,
            descripcion: tipoCobanc.descripcion,
        });

        this.logger.log(`Tipo con ID ${tipoCobanc.id_tipo} creado exitosamente.`);
        
        return newTipo
    }
}