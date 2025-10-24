
import { IsString, MinLength, MaxLength, IsOptional, IsNumber } from 'class-validator';

/**
 * DTO para crear un nuevo Tipo
 */
export class CreateTipoDto {
    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
    descripcion?: string;

    @IsOptional()
    @IsNumber()
    tipo_cobanc_id: number;
}
