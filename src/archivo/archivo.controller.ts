import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArchivoService } from './archivo.service';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import { UpdateArchivoDto } from './dto/update-archivo.dto';
import { Archivo } from './entities/archivo.entity';
import {
  RequireRead,
  RequireCreate,
  RequireUpdate,
  RequireDelete
} from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

/**
 * Controlador de Archivos
 * 
 * Maneja todas las operaciones REST relacionadas con archivos polimórficos.
 * Todos los endpoints requieren autenticación JWT y permisos específicos.
 */
@Controller('archivos')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) { }

  /**
   * Obtiene todos los archivos o filtra por parámetros
   * 
   * @param moduloType - (Opcional) Tipo de módulo para filtrar
   * @param moduloId - (Opcional) ID del módulo para filtrar
   * @param archivoNewId - (Opcional) archivo_new_id para filtrar
   * @returns Array de archivos
   */
  @Get()
  @RequireRead('archivo')
  async findAll(
    @Query('moduloType') moduloType?: string,
    @Query('moduloId') moduloId?: number,
    @Query('archivoNewId') archivoNewId?: number,
  ): Promise<Archivo[]> {
    // Si se especifica archivo_new_id
    if (archivoNewId) {
      return await this.archivoService.findByArchivoNewId(+archivoNewId);
    }

    // Si se especifican ambos parámetros de módulo
    if (moduloType && moduloId) {
      return await this.archivoService.findByModulo(moduloType, +moduloId);
    }

    // Si solo se especifica el tipo de módulo
    if (moduloType) {
      return await this.archivoService.findByModuloType(moduloType);
    }

    // Si no hay filtros, devolver todos
    return await this.archivoService.findAll();
  }

  /**
   * Obtiene un archivo específico por ID
   * 
   * @param id - ID del archivo
   * @returns Archivo encontrado
   */
  @Get(':id')
  @RequireRead('archivo')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Archivo> {
    return await this.archivoService.findOne(id);
  }

  /**
   * Obtiene todos los archivos de un recurso específico
   * 
   * @param moduloType - Tipo de módulo
   * @param moduloId - ID del recurso
   * @returns Array de archivos del recurso
   */
  @Get('modulo/:moduloType/:moduloId')
  @RequireRead('archivo')
  async findByModulo(
    @Param('moduloType') moduloType: string,
    @Param('moduloId', ParseIntPipe) moduloId: number
  ): Promise<Archivo[]> {
    return await this.archivoService.findByModulo(moduloType, moduloId);
  }

  /**
   * Crea un nuevo archivo
   * 
   * @param createArchivoDto - Datos del archivo a crear
   * @returns Archivo creado
   */
  @Post()
  @RequireCreate('archivo')
  async create(@Body() createArchivoDto: CreateArchivoDto): Promise<Archivo> {
    return await this.archivoService.create(createArchivoDto);
  }

  /**
   * Actualiza un archivo existente
   * 
   * @param id - ID del archivo a actualizar
   * @param updateArchivoDto - Datos de actualización
   * @returns Archivo actualizado
   */
  @Put(':id')
  @RequireUpdate('archivo')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArchivoDto: UpdateArchivoDto
  ): Promise<Archivo> {
    return await this.archivoService.update(id, updateArchivoDto);
  }

  /**
   * Elimina un archivo (soft delete)
   * 
   * @param id - ID del archivo a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @RequireDelete('archivo')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.archivoService.remove(id);
  }
}
