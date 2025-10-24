import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { Tipo } from './entities/tipo.entity';

/**
 * Servicio de Tipos
 * 
 * Maneja toda la lógica de negocio relacionada con los tipos.
 */
@Injectable()
export class TipoService {
  private readonly logger = new Logger(TipoService.name);

  constructor(
    @InjectRepository(Tipo)
    private readonly tipoRepository: Repository<Tipo>,
  ) { }

  /**
   * Crea un nuevo tipo
   * 
   * @param createTipoDto - Datos del tipo a crear
   * @returns Tipo creado con sus relaciones
   */
  async create(createTipoDto: CreateTipoDto): Promise<Tipo> {
    try {
      this.logger.log(`Creando tipo: ${createTipoDto.nombre}`);

      const tipo = this.tipoRepository.create(createTipoDto);
      return await this.tipoRepository.save(tipo);
    } catch (error) {
      this.logger.error(`Error al crear tipo: ${error.message}`);
      throw new BadRequestException('Error al crear el tipo');
    }
  }

  /**
   * Obtiene todos los tipos con sus subtipos
   * 
   * @returns Array de tipos con sus subtipos
   */
  async findAll(): Promise<Tipo[]> {
    this.logger.log('Obteniendo todos los tipos');

    return await this.tipoRepository.find({
      relations: ['subtipos'],
      order: {
        id: 'ASC',
      },
    });
  }

  /**
   * Busca un tipo por ID
   * 
   * @param id - ID del tipo
   * @param isCallLocal - Si es true, retorna null en lugar de lanzar error
   * @returns Tipo encontrado con sus subtipos o null si isCallLocal es true
   */
  async findOne(id: number, isCallLocal: boolean = false): Promise<Tipo | null> {
    this.logger.log(`Buscando tipo con ID: ${id}`);

    const tipo = await this.tipoRepository.findOne({
      where: { id },
      relations: ['subtipos'],
    });

    if (!tipo && !isCallLocal) {
      throw new NotFoundException(`Tipo con ID ${id} no encontrado`);
    }

    return tipo;
  }

  /**
   * Busca un tipo por tipo_cobanc_id
   * 
   * @param tipo_cobanc_id - ID del tipo en Cobanc
   * @param throwError - Si es true, lanza error cuando no encuentra. Si es false, retorna null
   * @returns Tipo encontrado o null
   */
  async findOneIdCobanc(tipo_cobanc_id: number, throwError: boolean = true): Promise<Tipo | null> {
    this.logger.log(`Buscando tipo con tipo_cobanc_id: ${tipo_cobanc_id}`);

    const tipo = await this.tipoRepository.findOne({
      where: { tipo_cobanc_id }
    });

    if (!tipo && throwError) {
      throw new NotFoundException(`Tipo con tipo_cobanc_id ${tipo_cobanc_id} no encontrado`);
    }

    return tipo;
  }

  /**
   * Actualiza un tipo
   * 
   * @param id - ID del tipo a actualizar
   * @param updateTipoDto - Datos de actualización
   * @returns Tipo actualizado
   */
  async update(id: number, updateTipoDto: UpdateTipoDto): Promise<Tipo> {
    this.logger.log(`Actualizando tipo con ID: ${id}`);

    const tipo = await this.findOne(id);

    if (!tipo) {
      throw new NotFoundException(`Tipo con ID ${id} no encontrado`);
    }

    Object.assign(tipo, updateTipoDto);

    try {
      return await this.tipoRepository.save(tipo);
    } catch (error) {
      this.logger.error(`Error al actualizar tipo: ${error.message}`);
      throw new BadRequestException('Error al actualizar el tipo');
    }
  }

  /**
   * Elimina un tipo (soft delete)
   * 
   * @param id - ID del tipo a eliminar
   * @returns Mensaje de confirmación
   */
  async remove(id: number): Promise<{ message: string }> {
    this.logger.log(`Eliminando tipo con ID: ${id}`);

    const tipo = await this.findOne(id);

    if (!tipo) {
      throw new NotFoundException(`Tipo con ID ${id} no encontrado`);
    }

    await this.tipoRepository.softDelete(id);

    return { message: `Tipo ${tipo.nombre} eliminado correctamente` };
  }
}
