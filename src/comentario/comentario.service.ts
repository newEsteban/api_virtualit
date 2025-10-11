import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Comentario } from './entities/comentario.entity';
import { User } from '../user/entities/user.entity';

/**
 * Servicio para gestionar comentarios polimórficos
 * 
 * Permite crear comentarios que pueden estar asociados a cualquier entidad
 * mediante el patrón polimórfico (commentable_id, commentable_type)
 */
@Injectable()
export class ComentarioService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Crear un nuevo comentario
   * @param createComentarioDto Datos del comentario
   * @param userId ID del usuario que crea el comentario
   * @returns El comentario creado
   */
  async create(createComentarioDto: CreateComentarioDto, userId: string) {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const comentario = this.comentarioRepository.create({
      ...createComentarioDto,
      usuario_id: userId,
    });

    return await this.comentarioRepository.save(comentario);
  }

  /**
   * Obtener todos los comentarios con sus relaciones
   * @returns Lista de comentarios
   */
  async findAll() {
    return await this.comentarioRepository.find({
      relations: ['usuario'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtener un comentario por ID
   * @param id ID del comentario
   * @returns El comentario encontrado
   */
  async findOne(id: number) {
    const comentario = await this.comentarioRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comentario;
  }

  /**
   * Obtener todos los comentarios de una entidad específica
   * @param commentableType Tipo de entidad (ej: 'Ticket', 'ClasificacionTicket')
   * @param commentableId ID de la entidad
   * @returns Lista de comentarios de la entidad
   */
  async findByCommentable(commentableType: string, commentableId: number) {
    return await this.comentarioRepository.find({
      where: {
        commentable_type: commentableType,
        commentable_id: commentableId,
      },
      relations: ['usuario'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtener todos los comentarios de un usuario
   * @param userId ID del usuario
   * @returns Lista de comentarios del usuario
   */
  async findByUser(userId: string) {
    return await this.comentarioRepository.find({
      where: { usuario_id: userId },
      relations: ['usuario'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Actualizar un comentario
   * @param id ID del comentario
   * @param updateComentarioDto Datos actualizados
   * @param userId ID del usuario que actualiza (para verificar propiedad)
   * @returns El comentario actualizado
   */
  async update(id: number, updateComentarioDto: UpdateComentarioDto, userId: string) {
    const comentario = await this.findOne(id);

    // Verificar que el usuario sea el propietario del comentario
    if (comentario.usuario_id !== userId) {
      throw new BadRequestException('No tienes permiso para actualizar este comentario');
    }

    Object.assign(comentario, updateComentarioDto);
    return await this.comentarioRepository.save(comentario);
  }

  /**
   * Eliminar un comentario (soft delete)
   * @param id ID del comentario
   * @param userId ID del usuario que elimina (para verificar propiedad)
   */
  async remove(id: number, userId: string) {
    const comentario = await this.findOne(id);

    // Verificar que el usuario sea el propietario del comentario
    if (comentario.usuario_id !== userId) {
      throw new BadRequestException('No tienes permiso para eliminar este comentario');
    }

    await this.comentarioRepository.softDelete(id);
    return { message: `Comentario con ID ${id} eliminado exitosamente` };
  }
}
