import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AssignPermisosDto } from './dto/assign-permisos.dto';
import { Rol } from './entities/rol.entity';
import { PermisoService } from '../permiso/permiso.service';

/**
 * Servicio para gestionar roles del sistema
 * 
 * Proporciona métodos para crear, consultar, actualizar y eliminar roles,
 * así como para gestionar la asignación de permisos a roles.
 */
@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    private readonly permisoService: PermisoService,
  ) {}

  /**
   * Crea un nuevo rol en el sistema
   * 
   * @param createRolDto - Datos del rol a crear
   * @returns Rol creado con sus permisos asignados
   * @throws ConflictException si ya existe un rol con el mismo nombre
   * @throws BadRequestException si algunos permisos no existen
   */
  async create(createRolDto: CreateRolDto): Promise<Rol> {
    // Verificar si ya existe un rol con el mismo nombre
    const existingRol = await this.rolRepository.findOne({
      where: { name: createRolDto.name }
    });

    if (existingRol) {
      throw new ConflictException(`Ya existe un rol con el nombre: ${createRolDto.name}`);
    }

    // Crear el rol
    const rol = this.rolRepository.create({
      name: createRolDto.name,
      description: createRolDto.description,
      priority: createRolDto.priority || 1000,
      isActive: createRolDto.isActive ?? true,
    });

    // Guardar el rol
    const savedRol = await this.rolRepository.save(rol);

    // Asignar permisos si se proporcionaron
    if (createRolDto.permisoIds && createRolDto.permisoIds.length > 0) {
      await this.assignPermisos(savedRol.id, { permisoIds: createRolDto.permisoIds });
      return await this.findOne(savedRol.id);
    }

    return savedRol;
  }

  /**
   * Obtiene todos los roles activos
   * 
   * @returns Array de roles con sus permisos
   */
  async findAll(): Promise<Rol[]> {
    return await this.rolRepository.find({
      where: { isActive: true },
      relations: ['permisos'],
      order: { priority: 'ASC', name: 'ASC' }
    });
  }

  /**
   * Obtiene un rol por su ID
   * 
   * @param id - ID del rol
   * @returns Rol encontrado con sus permisos y usuarios
   * @throws NotFoundException si no se encuentra el rol
   */
  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({
      where: { id },
      relations: ['permisos', 'users']
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  /**
   * Busca roles por nombre
   * 
   * @param name - Nombre del rol a buscar
   * @returns Rol encontrado o null
   */
  async findByName(name: string): Promise<Rol | null> {
    return await this.rolRepository.findOne({
      where: { name, isActive: true },
      relations: ['permisos']
    });
  }

  /**
   * Actualiza un rol existente
   * 
   * @param id - ID del rol a actualizar
   * @param updateRolDto - Datos de actualización
   * @returns Rol actualizado
   * @throws NotFoundException si no se encuentra el rol
   * @throws ConflictException si el nuevo nombre ya existe
   */
  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    // Verificar que no sea un rol del sistema
    if (rol.isSystem) {
      throw new BadRequestException('No se puede modificar un rol del sistema');
    }

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (updateRolDto.name && updateRolDto.name !== rol.name) {
      const existingRol = await this.rolRepository.findOne({
        where: { name: updateRolDto.name }
      });

      if (existingRol) {
        throw new ConflictException(`Ya existe un rol con el nombre: ${updateRolDto.name}`);
      }
    }

    await this.rolRepository.update(id, updateRolDto);
    return await this.findOne(id);
  }

  /**
   * Elimina un rol (soft delete)
   * 
   * @param id - ID del rol a eliminar
   * @returns Resultado de la eliminación
   * @throws NotFoundException si no se encuentra el rol
   * @throws BadRequestException si es un rol del sistema
   */
  async remove(id: number): Promise<{ message: string }> {
    const rol = await this.findOne(id);

    if (rol.isSystem) {
      throw new BadRequestException('No se puede eliminar un rol del sistema');
    }

    await this.rolRepository.softDelete(id);
    
    return { message: `Rol ${rol.name} eliminado correctamente` };
  }

  /**
   * Asigna permisos a un rol
   * 
   * @param rolId - ID del rol
   * @param assignPermisosDto - Permisos a asignar
   * @returns Rol con los permisos actualizados
   * @throws NotFoundException si no se encuentra el rol
   * @throws BadRequestException si algunos permisos no existen
   */
  async assignPermisos(rolId: number, assignPermisosDto: AssignPermisosDto): Promise<Rol> {
    const rol = await this.findOne(rolId);

    // Verificar que todos los permisos existan
    const permisos = await this.permisoService.findByIds(assignPermisosDto.permisoIds);
    
    if (permisos.length !== assignPermisosDto.permisoIds.length) {
      const foundIds = permisos.map(p => p.id);
      const notFoundIds = assignPermisosDto.permisoIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Permisos no encontrados: ${notFoundIds.join(', ')}`);
    }

    // Asignar los permisos al rol
    rol.permisos = permisos;
    await this.rolRepository.save(rol);

    return await this.findOne(rolId);
  }

  /**
   * Remueve permisos de un rol
   * 
   * @param rolId - ID del rol
   * @param permisoIds - IDs de permisos a remover
   * @returns Rol con los permisos actualizados
   */
  async removePermisos(rolId: number, permisoIds: number[]): Promise<Rol> {
    const rol = await this.findOne(rolId);

    // Filtrar los permisos que no están en la lista a remover
    rol.permisos = rol.permisos.filter(permiso => !permisoIds.includes(permiso.id));
    await this.rolRepository.save(rol);

    return await this.findOne(rolId);
  }

  /**
   * Obtiene roles por IDs
   * Útil para validar la existencia de roles al asignarlos a usuarios
   * 
   * @param ids - Array de IDs de roles
   * @returns Array de roles encontrados
   */
  async findByIds(ids: number[]): Promise<Rol[]> {
    return await this.rolRepository
      .createQueryBuilder('rol')
      .where('rol.id IN (:...ids)', { ids })
      .andWhere('rol.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('rol.permisos', 'permisos')
      .getMany();
  }
}
