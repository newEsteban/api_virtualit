import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { PermisoService } from './permiso.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { Permiso } from './entities/permiso.entity';

/**
 * Controlador de Permisos
 * 
 * Maneja todas las operaciones REST relacionadas con permisos:
 * - CRUD básico de permisos
 * - Búsqueda de permisos por recurso y acción
 */
@Controller('permisos')
export class PermisoController {
  constructor(private readonly permisoService: PermisoService) {}

  /**
   * Crea un nuevo permiso
   * 
   * @param createPermisoDto - Datos del permiso a crear
   * @returns Permiso creado
   */
  @Post()
  async create(@Body() createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    return await this.permisoService.create(createPermisoDto);
  }

  /**
   * Obtiene todos los permisos activos
   * 
   * @param resource - Filtro opcional por recurso
   * @param action - Filtro opcional por acción
   * @returns Array de permisos
   */
  @Get()
  async findAll(
    @Query('resource') resource?: string,
    @Query('action') action?: string
  ): Promise<Permiso[]> {
    if (resource) {
      return await this.permisoService.findByResourceAndAction(resource, action);
    }
    return await this.permisoService.findAll();
  }

  /**
   * Obtiene un permiso específico por ID
   * 
   * @param id - ID del permiso
   * @returns Permiso con sus roles asociados
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Permiso> {
    return await this.permisoService.findOne(id);
  }

  /**
   * Actualiza un permiso existente
   * 
   * @param id - ID del permiso a actualizar
   * @param updatePermisoDto - Datos de actualización
   * @returns Permiso actualizado
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePermisoDto: UpdatePermisoDto
  ): Promise<Permiso> {
    return await this.permisoService.update(id, updatePermisoDto);
  }

  /**
   * Elimina un permiso (soft delete)
   * 
   * @param id - ID del permiso a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.permisoService.remove(id);
  }
}
