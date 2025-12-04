import { IsNotEmpty, IsString, IsInt, MaxLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un nuevo comentario
 * 
 * Valida los datos necesarios para crear un comentario:
 * - comentario: El texto del comentario (máximo 5000 caracteres)
 * - commentable_id: ID de la entidad a la que pertenece el comentario
 * - commentable_type: Tipo de entidad (ej: 'Ticket', 'ClasificacionTicket', 'User')
 * 
 * El usuario_id se obtiene automáticamente del usuario autenticado
 */
export class CreateComentarioDto {
    /**
     * Texto del comentario
     * @example "Este es un comentario de prueba"
     */
    @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
    @IsString({ message: 'El comentario debe ser una cadena de texto' })
    @MaxLength(5000, { message: 'El comentario no puede exceder los 5000 caracteres' })
    comentario: string;

    /**
     * ID de la entidad a la que pertenece el comentario
     * @example 1
     */
    @IsNotEmpty({ message: 'El commentable_id no puede estar vacío' })
    @IsInt({ message: 'El commentable_id debe ser un número entero' })
    @Type(() => Number)
    commentable_id: number;

    /**
     * Tipo/namespace del recurso al que pertenece el comentario
     * Ejemplo: 'Ticket', 'User', 'Tipo', 'ClasificacionTicket', etc.
     */
    @IsNotEmpty({ message: 'El commentable_type no puede estar vacío' })
    @IsString({ message: 'El commentable_type debe ser una cadena' })
    @MaxLength(200, { message: 'El commentable_type es demasiado largo' })
    commentable_type: string;

    /**
     * ID del comentario en el sistema Cobanc (externo)
     */
    @IsNotEmpty({ message: 'El comentario_cobanc_id no puede estar vacío' })
    @IsInt({ message: 'El comentario_cobanc_id debe ser un número entero' })
    @Type(() => Number)
    comentario_cobanc_id: number;

    @IsNotEmpty({ message: 'El usuario_nombre no puede estar vacío' })
    @IsString({ message: 'El usuario_nombre debe ser una cadena' })
    @MaxLength(255, { message: 'El usuario_nombre es demasiado largo' })
    usuario_nombre: string;

}
