import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para actualizar un comentario existente
 * 
 * Solo permite actualizar el texto del comentario.
 * No se permite cambiar las referencias polimórficas (commentable_id, commentable_type).
 */
export class UpdateComentarioDto {
    /**
     * Texto actualizado del comentario
     * @example "Este es un comentario actualizado"
     */
    @IsOptional()
    @IsString({ message: 'El comentario debe ser una cadena de texto' })
    @MaxLength(5000, { message: 'El comentario no puede exceder los 5000 caracteres' })
    comentario?: string;
}
