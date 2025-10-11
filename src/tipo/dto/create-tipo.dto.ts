import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para crear un nuevo Tipo
 */
export class CreateTipoDto {
    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
    nombre: string;
}
