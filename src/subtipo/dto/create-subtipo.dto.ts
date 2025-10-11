import { IsString, MinLength, MaxLength, IsInt, IsPositive } from 'class-validator';

/**
 * DTO para crear un nuevo Subtipo
 */
export class CreateSubtipoDto {
    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
    nombre: string;

    @IsInt({ message: 'El tipo_id debe ser un número entero' })
    @IsPositive({ message: 'El tipo_id debe ser un número positivo' })
    tipo_id: number;
}
