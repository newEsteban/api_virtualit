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
import { TipoService } from './tipo.service';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { Tipo } from './entities/tipo.entity';
import {
  RequireRead,
  RequireCreate,
  RequireUpdate,
  RequireDelete
} from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

/**
 * Controlador de Tipos
 * 
 * Maneja todas las operaciones REST relacionadas con tipos.
 * Todos los endpoints requieren autenticación JWT y permisos específicos.
 */
@Controller('tipos')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TipoController {
  constructor(private readonly tipoService: TipoService) { }

  /**
   * Obtiene todos los tipos con sus subtipos
   * 
   * @returns Array de tipos
   */
  @Get()
  @RequireRead('tipo')
  async findAll(): Promise<Tipo[]> {
    return await this.tipoService.findAll();
  }

  /**
   * Obtiene un tipo específico por ID
   * 
   * @param id - ID del tipo
   * @returns Tipo con sus subtipos
   */
  @Get(':id')
  @RequireRead('tipo')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Tipo> {
    return await this.tipoService.findOne(id);
  }

  /**
   * Crea un nuevo tipo
   * 
   * @param createTipoDto - Datos del tipo a crear
   * @returns Tipo creado
   */
  @Post()
  @RequireCreate('tipo')
  async create(@Body() createTipoDto: CreateTipoDto): Promise<Tipo> {
    return await this.tipoService.create(createTipoDto);
  }

  /**
   * Actualiza un tipo existente
   * 
   * @param id - ID del tipo a actualizar
   * @param updateTipoDto - Datos de actualización
   * @returns Tipo actualizado
   */
  @Put(':id')
  @RequireUpdate('tipo')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoDto: UpdateTipoDto
  ): Promise<Tipo> {
    return await this.tipoService.update(id, updateTipoDto);
  }

  /**
   * Elimina un tipo (soft delete)
   * 
   * @param id - ID del tipo a eliminar
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @RequireDelete('tipo')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.tipoService.remove(id);
  }
}
