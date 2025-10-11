import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubtipoService } from './subtipo.service';
import { CreateSubtipoDto } from './dto/create-subtipo.dto';
import { UpdateSubtipoDto } from './dto/update-subtipo.dto';
import { Subtipo } from './entities/subtipo.entity';
import {
  RequireRead,
  RequireCreate,
  RequireUpdate,
  RequireDelete
} from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

/**
 * Controlador de Subtipos
 * 
 * Maneja todas las operaciones REST relacionadas con subtipos.
 * Todos los endpoints requieren autenticación JWT y permisos específicos.
 */
@Controller('subtipos')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SubtipoController {
  constructor(private readonly subtipoService: SubtipoService) { }

  /**
   * Obtiene todos los subtipos con su tipo relacionado
   * 
   * @returns Array de subtipos
   */
  @Get()
  @RequireRead('subtipo')
  async findAll(): Promise<Subtipo[]> {
    return await this.subtipoService.findAll();
  }

  /**
   * Obtiene un subtipo específico por ID
   * 
   * @param id - ID del subtipo
   * @returns Subtipo con su tipo
   */
  @Get(':id')
  @RequireRead('subtipo')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Subtipo> {
    return await this.subtipoService.findOne(id);
  }

  /**
   * Obtiene todos los subtipos de un tipo específico
   * 
   * @param tipoId - ID del tipo
   * @returns Array de subtipos del tipo
   */
  @Get('tipo/:tipoId')
  @RequireRead('subtipo')
  async findByTipo(@Param('tipoId', ParseIntPipe) tipoId: number): Promise<Subtipo[]> {
    return await this.subtipoService.findByTipo(tipoId);
  }

  /**
   * Crea un nuevo subtipo
   * 
   * @param createSubtipoDto - Datos del subtipo a crear
   * @returns Subtipo creado
   */
  @Post()
  @RequireCreate('subtipo')
  async create(@Body() createSubtipoDto: CreateSubtipoDto): Promise<Subtipo> {
    return await this.subtipoService.create(createSubtipoDto);
  }

  /**
   * Actualiza un subtipo existente
   * 
   * @param id - ID del subtipo a actualizar
   * @param updateSubtipoDto - Datos de actualización
   * @returns Subtipo actualizado
   */
  @Put(':id')
  @RequireUpdate('subtipo')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubtipoDto: UpdateSubtipoDto
  ): Promise<Subtipo> {
    return await this.subtipoService.update(id, updateSubtipoDto);
  }

  /**
   * Elimina un subtipo (soft delete)
   * 
   * @param id - ID del subtipo a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @RequireDelete('subtipo')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.subtipoService.remove(id);
  }
}
