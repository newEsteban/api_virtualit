import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TblComentariosTicket } from '../entities/tbl-comentarios-ticket.entity';
import { UtlUsuarios } from '../entities/utl-usuarios.entity';
import { Comentario } from '../../comentario/entities/comentario.entity';
import { ComentarioService } from '../../comentario/comentario.service';
import { CreateComentarioDto } from '../../comentario/dto/create-comentario.dto';

/**
 * Servicio para migrar comentarios desde la tabla externa tbl_comentarios_ticket
 * a la entidad local Comentario.
 */
@Injectable()
export class CobancComentarioMigrationService {
    private readonly logger = new Logger(CobancComentarioMigrationService.name);

    constructor(
        @Optional()
        @InjectRepository(TblComentariosTicket, 'newSistemasConnection')
        private readonly tblComentariosTicketRepo: Repository<TblComentariosTicket>,

        @Optional()
        @InjectRepository(UtlUsuarios, 'newSistemasConnection')
        private readonly utlUsuariosRepo: Repository<UtlUsuarios>,

        @InjectRepository(Comentario)
        private readonly comentarioRepository: Repository<Comentario>,

        private readonly comentarioService: ComentarioService,
    ) {}

    /**
     * Busca un comentario local por su comentario_cobanc_id
     */
    async findByComentarioCobancId(comentarioCobancId: number): Promise<Comentario | null> {
        return this.comentarioRepository.findOne({
            where: { comentario_cobanc_id: comentarioCobancId },
        });
    }

    /**
     * Migra un comentario individual desde Cobanc a la entidad local.
     * 
     * @param comentarioCobanc - Registro de TblComentariosTicket
     * @param associatedEntity - Entidad local a la que se asociará el comentario (debe tener getKey() y getType())
     * @param usuarioId - ID del usuario local al que se asignará el comentario (opcional)
     * @returns El comentario local creado o existente
     */
    async migrateComentario(
        comentarioCobanc: TblComentariosTicket,
        associatedEntity: { getKey: () => number | string | null; getType: () => string },
        usuarioId?: string,
    ): Promise<Comentario> {
        // Verificar si ya existe
        const existing = await this.findByComentarioCobancId(comentarioCobanc.id);
        if (existing) {
            this.logger.log(`Comentario Cobanc ID ${comentarioCobanc.id} ya existe como local ID ${existing.id}`);
            return existing;
        }

        // Obtener nombre del usuario desde utl_usuarios
        let usuarioNombre = `Usuario Cobanc ${comentarioCobanc.id_usuario}`;
        if (this.utlUsuariosRepo) {
            try {
                const usuario = await this.utlUsuariosRepo.findOne({
                    where: { id: comentarioCobanc.id_usuario }
                });
                if (usuario && usuario.nombre) {
                    usuarioNombre = usuario.nombre;
                }
            } catch (error) {
                this.logger.warn(`No se pudo obtener usuario ID ${comentarioCobanc.id_usuario}: ${error.message}`);
            }
        }

        try {
            // Obtener commentable_id y commentable_type desde la entidad local usando funciones polimórficas
            const commentableId = associatedEntity.getKey();
            const commentableType = associatedEntity.getType();

            if (!commentableId) {
                throw new Error('La entidad asociada no tiene un ID válido');
            }

            // Crear comentario con la asociación correcta desde el inicio
            const comentarioLocal = this.comentarioRepository.create({
                comentario: comentarioCobanc.comentario,
                commentable_id: commentableId as number,
                commentable_type: commentableType,
                comentario_cobanc_id: comentarioCobanc.id,
                usuario_nombre: usuarioNombre,
            });

            const savedComentario = await this.comentarioRepository.save(comentarioLocal);

            this.logger.log(
                `Comentario Cobanc ID ${comentarioCobanc.id} migrado → local ID ${savedComentario.id} ` +
                `(asociado a ${commentableType}#${commentableId})`
            );
            return savedComentario;
        } catch (error) {
            this.logger.error(`Error migrando comentario Cobanc ID ${comentarioCobanc.id}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Migra múltiples comentarios por sus IDs de Cobanc.
     * 
     * @param comentarioCobancIds - Array de IDs de comentarios en Cobanc
     * @param associatedEntity - Entidad local a la que se asociarán los comentarios
     * @param usuarioId - ID del usuario local para asignar (opcional)
     * @returns Array de comentarios locales creados/existentes
     */
    async migrateComentarios(
        comentarioCobancIds: number[],
        associatedEntity: { getKey: () => number | string | null; getType: () => string },
        usuarioId?: string,
    ): Promise<Comentario[]> {
        if (!this.tblComentariosTicketRepo) {
            this.logger.warn('TblComentariosTicket repository no disponible; omitiendo migración de comentarios.');
            return [];
        }

        if (!comentarioCobancIds || comentarioCobancIds.length === 0) {
            return [];
        }

        try {
            const comentariosCobanc = await this.tblComentariosTicketRepo
                .createQueryBuilder('c')
                .where('c.id IN (:...ids)', { ids: comentarioCobancIds })
                .getMany();

            const results = await Promise.allSettled(
                comentariosCobanc.map((comentarioCobanc) =>
                    this.migrateComentario(comentarioCobanc, associatedEntity, usuarioId),
                ),
            );

            const migrated: Comentario[] = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    migrated.push(result.value);
                } else {
                    this.logger.error(
                        `Error migrando comentario Cobanc ID ${comentariosCobanc[index]?.id}: ${result.reason}`,
                    );
                }
            });

            this.logger.log(`Migrados ${migrated.length} de ${comentarioCobancIds.length} comentarios.`);
            return migrated;
        } catch (error) {
            this.logger.error(`Error al consultar comentarios en Cobanc: ${error.message}`);
            return [];
        }
    }

    /**
     * Migra todos los comentarios asociados a un commentable_id y commentable_type específicos.
     * 
     * @param commentableType - Tipo de la entidad en Cobanc (ej: 'App\\Sistema\\TicketNew\\TicketNew')
     * @param commentableId - ID de la entidad en Cobanc
     * @param associatedEntity - Entidad local a la que se asociarán los comentarios
     * @param usuarioId - Usuario local al que asignar los comentarios (opcional)
     * @returns Array de comentarios locales
     */
    async migrateComentariosByCommentable(
        commentableType: string,
        commentableId: number,
        associatedEntity: { getKey: () => number | string | null; getType: () => string },
        usuarioId?: string,
    ): Promise<Comentario[]> {
        if (!this.tblComentariosTicketRepo) {
            this.logger.warn('TblComentariosTicket repository no disponible.');
            return [];
        }

        try {
            const comentariosCobanc = await this.tblComentariosTicketRepo
                .createQueryBuilder('c')
                .where('c.comentable_type = :type', { type: commentableType })
                .andWhere('c.comentable_id = :id', { id: commentableId })
                .orderBy('c.created_at', 'ASC')
                .getMany();

            if (comentariosCobanc.length === 0) {
                this.logger.log(`No se encontraron comentarios para ${commentableType}#${commentableId}`);
                return [];
            }

            this.logger.log(`Migrando ${comentariosCobanc.length} comentarios de ${commentableType}#${commentableId}...`);

            const results = await Promise.allSettled(
                comentariosCobanc.map((comentarioCobanc) =>
                    this.migrateComentario(comentarioCobanc, associatedEntity, usuarioId),
                ),
            );

            const migrated: Comentario[] = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    migrated.push(result.value);
                } else {
                    this.logger.error(
                        `Error migrando comentario ${comentariosCobanc[index]?.id}: ${result.reason}`,
                    );
                }
            });

            this.logger.log(`Migrados ${migrated.length} de ${comentariosCobanc.length} comentarios.`);
            return migrated;
        } catch (error) {
            this.logger.error(`Error al migrar comentarios: ${error.message}`);
            return [];
        }
    }
}
