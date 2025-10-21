import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TblEstadosNew } from "../entities/tbl-estados-new.entity";
import { Subtipo } from "../../subtipo/entities/subtipo.entity";
import { MigrateSubtipoDto } from "../dtos/local-general.dto";

@Injectable()
export class CobancSubtipoMigrationService {
    private readonly logger = new Logger(CobancSubtipoMigrationService.name);

    constructor(
        @InjectRepository(TblEstadosNew, 'newSistemasConnection')
        private readonly tblEstadosNewRepository: Repository<TblEstadosNew>,
        
        @InjectRepository(Subtipo)
        private readonly estadoLocalRepository: Repository<Subtipo>,
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
        const subtipoCobanc = await this.tblEstadosNewRepository.findOne({ where: { id_subtipo: subtipoId } });

        if (!subtipoCobanc) {
            this.logger.warn(`Subtipo con ID ${subtipoId} no encontrado en gestion_coban`);
            return null;
        }
        
        let subtipoLocal = await this.estadoLocalRepository.findOne({ where: { id: subtipoId } });
        if (subtipoLocal) {
            this.logger.log(`Actualizando subtipo local con ID ${subtipoId}`);
            subtipoLocal.nombre = subtipoCobanc.descripcion;
            subtipoLocal.tipo_id = subtipoCobanc.id_tipo;

        } else {
            this.logger.log(`Creando nuevo subtipo local con ID ${subtipoId}`);
            subtipoLocal = this.estadoLocalRepository.create({
                id: subtipoCobanc.id_subtipo,
                nombre: subtipoCobanc.descripcion,
                tipo_id: subtipoCobanc.id_tipo,
            });
        }

        return this.estadoLocalRepository.save(subtipoLocal);
    }
}