import { IsString, IsInt, IsOptional, MinLength, MaxLength, IsPositive } from 'class-validator';

/**
 * DTO para crear un nuevo Archivo (relación polimórfica)
 */
export class CreateArchivoDto {
    @IsInt({ message: 'El modulo_id debe ser un número entero' })
    @IsPositive({ message: 'El modulo_id debe ser un número positivo' })
    modulo_id: number;

    @IsString()
    @MinLength(2, { message: 'El modulo_type debe tener al menos 2 caracteres' })
    @MaxLength(100, { message: 'El modulo_type no puede exceder 100 caracteres' })
    modulo_type: string;

    @IsString()
    @MinLength(1, { message: 'La ruta es obligatoria' })
    @MaxLength(500, { message: 'La ruta no puede exceder 500 caracteres' })
    ruta: string;

    @IsString()
    @MinLength(1, { message: 'El nombre es obligatorio' })
    @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
    nombre: string;

    @IsString()
    @MinLength(1, { message: 'La extensión es obligatoria' })
    @MaxLength(10, { message: 'La extensión no puede exceder 10 caracteres' })
    extension: string;

    @IsOptional()
    @IsInt({ message: 'El archivo_new_id debe ser un número entero' })
    @IsPositive({ message: 'El archivo_new_id debe ser un número positivo' })
    archivo_new_id?: number;
}
