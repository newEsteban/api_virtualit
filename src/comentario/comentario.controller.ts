import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireRead, RequireCreate, RequireUpdate, RequireDelete, CurrentUser } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

/**
 * Controlador para gestionar comentarios polimórficos
 * 
 * Todos los endpoints requieren autenticación JWT y permisos específicos:
 * - comentario:read - Para consultar comentarios
 * - comentario:create - Para crear comentarios
 * - comentario:update - Para actualizar comentarios
 * - comentario:delete - Para eliminar comentarios
 */
@Controller('comentarios')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) { }

  /**
   * Crear un nuevo comentario
   * POST /api/comentarios
   * Requiere permiso: comentario:create
   */
  @Post()
  @RequireCreate('comentario')
  create(
    @Body() createComentarioDto: CreateComentarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.comentarioService.create(createComentarioDto, user.id);
  }

  /**
   * Obtener todos los comentarios
   * GET /api/comentarios
   * Requiere permiso: comentario:read
   */
  @Get()
  @RequireRead('comentario')
  findAll() {
    return this.comentarioService.findAll();
  }

  /**
   * Obtener comentarios por tipo y ID de entidad
   * GET /api/comentarios/commentable/:type/:id
   * Requiere permiso: comentario:read
   * 
   * @example GET /api/comentarios/commentable/Ticket/1
   */
  @Get('commentable/:type/:id')
  @RequireRead('comentario')
  findByCommentable(
    @Param('type') commentableType: string,
    @Param('id', ParseIntPipe) commentableId: number,
  ) {
    return this.comentarioService.findByCommentable(commentableType, commentableId);
  }

  /**
   * Obtener todos los comentarios de un usuario
   * GET /api/comentarios/user/:userId
   * Requiere permiso: comentario:read
   */
  @Get('user/:userId')
  @RequireRead('comentario')
  findByUser(@Param('userId') userId: string) {
    return this.comentarioService.findByUser(userId);
  }

  /**
   * Obtener un comentario por ID
   * GET /api/comentarios/:id
   * Requiere permiso: comentario:read
   */
  @Get(':id')
  @RequireRead('comentario')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comentarioService.findOne(id);
  }

  /**
   * Actualizar un comentario
   * PATCH /api/comentarios/:id
   * Requiere permiso: comentario:update
   * Solo el propietario del comentario puede actualizarlo
   */
  @Patch(':id')
  @RequireUpdate('comentario')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComentarioDto: UpdateComentarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.comentarioService.update(id, updateComentarioDto, user.id);
  }

  /**
   * Eliminar un comentario (soft delete)
   * DELETE /api/comentarios/:id
   * Requiere permiso: comentario:delete
   * Solo el propietario del comentario puede eliminarlo
   */
  @Delete(':id')
  @RequireDelete('comentario')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.comentarioService.remove(id, user.id);
  }
}
