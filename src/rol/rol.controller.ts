import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AssignPermisosDto } from './dto/assign-permisos.dto';
import { Rol } from './entities/rol.entity';

/**
 * Controlador de Roles
 * 
 * Maneja todas las operaciones REST relacionadas con roles:
 * - CRUD básico de roles
 * - Gestión de permisos de roles
 */
@Controller('roles')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  /**
   * Crea un nuevo rol
   * 
   * @param createRolDto - Datos del rol a crear
   * @returns Rol creado con sus permisos
   */
  @Post()
  async create(@Body() createRolDto: CreateRolDto): Promise<Rol> {
    return await this.rolService.create(createRolDto);
  }

  /**
   * Obtiene todos los roles con sus permisos
   * 
   * @returns Array de roles con sus permisos
   */
  @Get()
  async findAll(): Promise<Rol[]> {
    return await this.rolService.findAll();
  }

  /**
   * Obtiene un rol específico por ID
   * 
   * @param id - ID del rol
   * @returns Rol con sus permisos y usuarios
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Rol> {
    return await this.rolService.findOne(id);
  }

  /**
   * Actualiza un rol existente
   * 
   * @param id - ID del rol a actualizar
   * @param updateRolDto - Datos de actualización
   * @returns Rol actualizado
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRolDto: UpdateRolDto
  ): Promise<Rol> {
    return await this.rolService.update(id, updateRolDto);
  }

  /**
   * Asigna permisos a un rol
   * 
   * @param id - ID del rol
   * @param assignPermisosDto - Permisos a asignar
   * @returns Rol con permisos actualizados
   */
  @Patch(':id/permisos')
  async assignPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermisosDto: AssignPermisosDto
  ): Promise<Rol> {
    return await this.rolService.assignPermisos(id, assignPermisosDto);
  }

  /**
   * Remueve permisos específicos de un rol
   * 
   * @param id - ID del rol
   * @param body - Objeto con array de IDs de permisos a remover
   * @returns Rol con permisos actualizados
   */
  @Delete(':id/permisos')
  async removePermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permisoIds: number[] }
  ): Promise<Rol> {
    return await this.rolService.removePermisos(id, body.permisoIds);
  }

  /**
   * Elimina un rol (soft delete)
   * 
   * @param id - ID del rol a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.rolService.remove(id);
  }
}
