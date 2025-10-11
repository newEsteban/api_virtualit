import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { Permiso } from './entities/permiso.entity';

/**
 * Servicio para gestionar permisos del sistema
 * 
 * Proporciona métodos para crear, consultar, actualizar y eliminar permisos.
 * Los permisos definen acciones específicas que pueden ser asignadas a roles.
 */
@Injectable()
export class PermisoService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  /**
   * Crea un nuevo permiso en el sistema
   * 
   * @param createPermisoDto - Datos del permiso a crear
   * @returns Permiso creado
   * @throws ConflictException si ya existe un permiso con el mismo nombre
   */
  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermiso = await this.permisoRepository.findOne({
      where: { name: createPermisoDto.name }
    });

    if (existingPermiso) {
      throw new ConflictException(`Ya existe un permiso con el nombre: ${createPermisoDto.name}`);
    }

    const permiso = this.permisoRepository.create(createPermisoDto);
    return await this.permisoRepository.save(permiso);
  }

  /**
   * Obtiene todos los permisos activos
   * 
   * @returns Array de permisos
   */
  async findAll(): Promise<Permiso[]> {
    return await this.permisoRepository.find({
      where: { isActive: true },
      order: { resource: 'ASC', action: 'ASC' }
    });
  }

  /**
   * Obtiene un permiso por su ID
   * 
   * @param id - ID del permiso
   * @returns Permiso encontrado
   * @throws NotFoundException si no se encuentra el permiso
   */
  async findOne(id: number): Promise<Permiso> {
    const permiso = await this.permisoRepository.findOne({
      where: { id },
      relations: ['roles']
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permiso;
  }

  /**
   * Busca permisos por recurso y acción
   * 
   * @param resource - Recurso del permiso
   * @param action - Acción del permiso (opcional)
   * @returns Array de permisos que coinciden
   */
  async findByResourceAndAction(resource: string, action?: string): Promise<Permiso[]> {
    const query = this.permisoRepository.createQueryBuilder('permiso')
      .where('permiso.resource = :resource', { resource })
      .andWhere('permiso.isActive = :isActive', { isActive: true });

    if (action) {
      query.andWhere('permiso.action = :action', { action });
    }

    return await query.getMany();
  }

  /**
   * Actualiza un permiso existente
   * 
   * @param id - ID del permiso a actualizar
   * @param updatePermisoDto - Datos de actualización
   * @returns Permiso actualizado
   * @throws NotFoundException si no se encuentra el permiso
   * @throws ConflictException si el nuevo nombre ya existe
   */
  async update(id: number, updatePermisoDto: UpdatePermisoDto): Promise<Permiso> {
    const permiso = await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (updatePermisoDto.name && updatePermisoDto.name !== permiso.name) {
      const existingPermiso = await this.permisoRepository.findOne({
        where: { name: updatePermisoDto.name }
      });

      if (existingPermiso) {
        throw new ConflictException(`Ya existe un permiso con el nombre: ${updatePermisoDto.name}`);
      }
    }

    await this.permisoRepository.update(id, updatePermisoDto);
    return await this.findOne(id);
  }

  /**
   * Elimina un permiso (soft delete)
   * 
   * @param id - ID del permiso a eliminar
   * @returns Resultado de la eliminación
   * @throws NotFoundException si no se encuentra el permiso
   */
  async remove(id: number): Promise<{ message: string }> {
    const permiso = await this.findOne(id);
    await this.permisoRepository.softDelete(id);
    
    return { message: `Permiso ${permiso.name} eliminado correctamente` };
  }

  /**
   * Obtiene permisos por IDs
   * Útil para validar la existencia de permisos al asignarlos a roles
   * 
   * @param ids - Array de IDs de permisos
   * @returns Array de permisos encontrados
   */
  async findByIds(ids: number[]): Promise<Permiso[]> {
    return await this.permisoRepository
      .createQueryBuilder('permiso')
      .where('permiso.id IN (:...ids)', { ids })
      .andWhere('permiso.isActive = :isActive', { isActive: true })
      .getMany();
  }
}
