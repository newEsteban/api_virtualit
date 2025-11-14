import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubtipoDto } from './dto/create-subtipo.dto';
import { UpdateSubtipoDto } from './dto/update-subtipo.dto';
import { Subtipo } from './entities/subtipo.entity';
import { Tipo } from '../tipo/entities/tipo.entity';
import { TblEstadosNew } from 'src/external/entities/tbl-estados-new.entity';

/**
 * Servicio de Subtipos
 *
 * Maneja toda la lógica de negocio relacionada con los subtipos.
 */
@Injectable()
export class SubtipoService {
    private readonly logger = new Logger(SubtipoService.name);

    constructor(
        @InjectRepository(Subtipo)
        private readonly subtipoRepository: Repository<Subtipo>,
        @InjectRepository(Tipo)
        private readonly tipoRepository: Repository<Tipo>,
    ) { }

    /**
     * Crea un nuevo subtipo
     *
     * @param createSubtipoDto - Datos del subtipo a crear
     * @returns Subtipo creado con su tipo relacionado
     */
    async create(createSubtipoDto: CreateSubtipoDto): Promise<Subtipo> {
        try {
            this.logger.log(`Creando subtipo: ${createSubtipoDto.nombre}`);

            // Verificar que el tipo existe
            const tipo = await this.tipoRepository.findOne({
                where: { id: createSubtipoDto.tipo_id },
            });

            if (!tipo) {
                throw new NotFoundException(
                    `Tipo con ID ${createSubtipoDto.tipo_id} no encontrado`,
                );
            }

            const subtipo = this.subtipoRepository.create(createSubtipoDto);
            return await this.subtipoRepository.save(subtipo);
        } catch (error) {
            this.logger.error(`Error al crear subtipo: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error al crear el subtipo');
        }
    }

    /**
     * Obtiene todos los subtipos con su tipo relacionado
     *
     * @returns Array de subtipos con su tipo
     */
    async findAll(): Promise<Subtipo[]> {
        this.logger.log('Obteniendo todos los subtipos');

        return await this.subtipoRepository.find({
            relations: ['tipo'],
            order: {
                id: 'ASC',
            },
        });
    }

    /**
     * Busca un subtipo por ID
     *
     * @param id - ID del subtipo
     * @returns Subtipo encontrado con su tipo
     */
    async findOne(id: number): Promise<Subtipo> {
        this.logger.log(`Buscando subtipo con ID: ${id}`);

        const subtipo = await this.subtipoRepository.findOne({
            where: { id },
            relations: ['tipo'],
        });

        if (!subtipo) {
            throw new NotFoundException(`Subtipo con ID ${id} no encontrado`);
        }

        return subtipo;
    }

    /**
     * Obtiene todos los subtipos de un tipo específico
     *
     * @param tipoId - ID del tipo
     * @returns Array de subtipos del tipo
     */
    async findByTipo(tipoId: number): Promise<Subtipo[]> {
        this.logger.log(`Obteniendo subtipos del tipo ID: ${tipoId}`);

        return await this.subtipoRepository.find({
            where: { tipo_id: tipoId },
            relations: ['tipo'],
            order: {
                id: 'ASC',
            },
        });
    }

    async getIdsByTipo(tipoId: number): Promise<number[]> {
        this.logger.log(`Obteniendo IDs de subtipos del tipo ID: ${tipoId}`);

        const subtipos = await this.subtipoRepository.find({
            where: { tipo_id: tipoId },
            select: ['subtipo_conbanc_id'],
        });
        
        return subtipos.map((subtipo) => subtipo.subtipo_conbanc_id);
    }

    /**
     * Actualiza un subtipo
     *
     * @param id - ID del subtipo a actualizar
     * @param updateSubtipoDto - Datos de actualización
     * @returns Subtipo actualizado
     */
    async update(
        id: number,
        updateSubtipoDto: UpdateSubtipoDto,
    ): Promise<Subtipo> {
        this.logger.log(`Actualizando subtipo con ID: ${id}`);

        const subtipo = await this.findOne(id);

        // Si se actualiza el tipo_id, verificar que existe
        if (
            updateSubtipoDto.tipo_id &&
            updateSubtipoDto.tipo_id !== subtipo.tipo_id
        ) {
            const tipo = await this.tipoRepository.findOne({
                where: { id: updateSubtipoDto.tipo_id },
            });

            if (!tipo) {
                throw new NotFoundException(
                    `Tipo con ID ${updateSubtipoDto.tipo_id} no encontrado`,
                );
            }
        }

        Object.assign(subtipo, updateSubtipoDto);

        try {
            return await this.subtipoRepository.save(subtipo);
        } catch (error) {
            this.logger.error(`Error al actualizar subtipo: ${error.message}`);
            throw new BadRequestException('Error al actualizar el subtipo');
        }
    }

    /**
     * Elimina un subtipo (soft delete)
     *
     * @param id - ID del subtipo a eliminar
     * @returns Mensaje de confirmación
     */
    async remove(id: number): Promise<{ message: string }> {
        this.logger.log(`Eliminando subtipo con ID: ${id}`);

        const subtipo = await this.findOne(id);

        await this.subtipoRepository.softDelete(id);

        return { message: `Subtipo ${subtipo.nombre} eliminado correctamente` };
    }

	async createBySubtipoCobanc(subtipoCobanc: TblEstadosNew, tipoId: number): Promise<Subtipo> {
		try {
			this.logger.log(`Creando subtipo desde CobancSubtipos: ${subtipoCobanc.descripcion}`);
			const subtipo = this.subtipoRepository.create({
				nombre: subtipoCobanc.descripcion,
				subtipo_conbanc_id: subtipoCobanc.id_subtipo,
				tipo_id: tipoId,
			});

			return await this.subtipoRepository.save(subtipo);

		} catch (error) {
			this.logger.error(`Error al crear subtipo desde SubtipoCobanc: ${error.message}`);
			throw new BadRequestException('Error al crear el subtipo desde SubtipoCobanc');
		}
	}
}
