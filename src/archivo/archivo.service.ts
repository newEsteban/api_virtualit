import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import { UpdateArchivoDto } from './dto/update-archivo.dto';
import { Archivo } from './entities/archivo.entity';

/**
 * Servicio de Archivos
 * 
 * Maneja toda la lógica de negocio relacionada con archivos polimórficos.
 * Los archivos pueden asociarse a diferentes tipos de recursos.
 */
@Injectable()
export class ArchivoService {
  private readonly logger = new Logger(ArchivoService.name);

  constructor(
    @InjectRepository(Archivo)
    private readonly archivoRepository: Repository<Archivo>,
  ) { }

  /**
   * Crea un nuevo archivo
   * 
   * @param createArchivoDto - Datos del archivo a crear
   * @returns Archivo creado
   */
  async create(createArchivoDto: CreateArchivoDto): Promise<Archivo> {
    try {
      this.logger.log(`Creando archivo: ${createArchivoDto.display_name} para ${createArchivoDto.archivable_type}:${createArchivoDto.archivable_id}`);

      const archivo = this.archivoRepository.create(createArchivoDto);
      return await this.archivoRepository.save(archivo);
    } catch (error) {
      this.logger.error(`Error al crear archivo: ${error.message}`);
      throw new BadRequestException('Error al crear el archivo');
    }
  }

  /**
   * Obtiene todos los archivos
   * 
   * @returns Array de archivos
   */
  async findAll(): Promise<Archivo[]> {
    this.logger.log('Obteniendo todos los archivos');

    return await this.archivoRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  /**
   * Busca un archivo por ID
   * 
   * @param id - ID del archivo
   * @returns Archivo encontrado
   */
  async findOne(id: number): Promise<Archivo> {
    this.logger.log(`Buscando archivo con ID: ${id}`);

    const archivo = await this.archivoRepository.findOne({
      where: { id },
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo con ID ${id} no encontrado`);
    }

    return archivo;
  }

  /**
   * Obtiene todos los archivos de un recurso específico
   * 
   * @param moduloType - Tipo de módulo (ej: 'User', 'Tipo', 'Subtipo')
   * @param moduloId - ID del recurso
   * @returns Array de archivos del recurso
   */
  async findByModulo(moduloType: string, moduloId: number): Promise<Archivo[]> {
    this.logger.log(`Obteniendo archivos de ${moduloType}:${moduloId}`);

    return await this.archivoRepository.find({
      where: {
        archivable_type: moduloType,
        archivable_id: moduloId
      },
      order: {
        id: 'ASC',
      },
    });
  }

  /**
   * Obtiene todos los archivos por tipo de módulo
   * 
   * @param moduloType - Tipo de módulo
   * @returns Array de archivos del tipo de módulo
   */
  async findByModuloType(moduloType: string): Promise<Archivo[]> {
    this.logger.log(`Obteniendo archivos de tipo: ${moduloType}`);

    return await this.archivoRepository.find({
      where: { archivable_type: moduloType },
      order: {
        id: 'ASC',
      },
    });
  }

  /**
   * Obtiene archivos por archivo_new_id
   * 
   * @param archivoNewId - ID de referencia del archivo
   * @returns Array de archivos con ese archivo_new_id
   */
  async findByArchivoNewId(archivoNewId: number): Promise<Archivo[]> {
    this.logger.log(`Obteniendo archivos con archivo_new_id: ${archivoNewId}`);

    return await this.archivoRepository.find({
      where: { archivo_new_id: archivoNewId },
      order: {
        id: 'ASC',
      },
    });
  }

  /**
   * Obtiene archivos por múltiples archivo_new_ids
   * 
   * @param archivoNewIds - Array de IDs de referencia de archivos
   * @returns Array de archivos que coincidan con los IDs proporcionados
   */
  async findByArchivoNewIds(archivoNewIds: number[]): Promise<Archivo[]> {
    this.logger.log(`Obteniendo archivos con archivo_new_ids: ${archivoNewIds.join(', ')}`);

    if (archivoNewIds.length === 0) {
      return [];
    }

    return await this.archivoRepository
      .createQueryBuilder('archivo')
      .where('archivo.archivo_new_id IN (:...ids)', { ids: archivoNewIds })
      .orderBy('archivo.id', 'ASC')
      .getMany();
  }

  /**
   * Actualiza un archivo
   * 
   * @param id - ID del archivo a actualizar
   * @param updateArchivoDto - Datos de actualización
   * @returns Archivo actualizado
   */
  async update(id: number, updateArchivoDto: UpdateArchivoDto): Promise<Archivo> {
    this.logger.log(`Actualizando archivo con ID: ${id}`);

    const archivo = await this.findOne(id);

    Object.assign(archivo, updateArchivoDto);

    try {
      return await this.archivoRepository.save(archivo);
    } catch (error) {
      this.logger.error(`Error al actualizar archivo: ${error.message}`);
      throw new BadRequestException('Error al actualizar el archivo');
    }
  }

  /**
   * Elimina un archivo (soft delete)
   * 
   * @param id - ID del archivo a eliminar
   * @returns Mensaje de confirmación
   */
  async remove(id: number): Promise<{ message: string }> {
    this.logger.log(`Eliminando archivo con ID: ${id}`);

    const archivo = await this.findOne(id);

    await this.archivoRepository.softDelete(id);

    return { message: `Archivo ${archivo.display_name} eliminado correctamente` };
  }
}
