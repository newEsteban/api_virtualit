import { IsString, IsInt, IsOptional, MinLength, MaxLength, IsPositive } from 'class-validator';

/**
 * DTO para crear un nuevo Archivo (relación polimórfica)
 */
export class CreateArchivoDto {
    @IsInt({ message: 'El archivable_id debe ser un número entero' })
    @IsPositive({ message: 'El archivable_id debe ser un número positivo' })
    archivable_id: number;

    @IsString()
    @MinLength(2, { message: 'El archivable_type debe tener al menos 2 caracteres' })
    @MaxLength(100, { message: 'El archivable_type no puede exceder 100 caracteres' })
    archivable_type: string;

    @IsString()
    @MinLength(1, { message: 'La ruta es obligatoria' })
    @MaxLength(500, { message: 'La ruta no puede exceder 500 caracteres' })
    route: string;

    @IsString()
    @MinLength(1, { message: 'El nombre es obligatorio' })
    @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
    display_name: string;

    @IsString()
    @MinLength(1, { message: 'La extensión es obligatoria' })
    @MaxLength(10, { message: 'La extensión no puede exceder 10 caracteres' })
    extension: string;


    @IsInt({ message: 'El archivo_new_id debe ser un número entero' })
    @IsPositive({ message: 'El archivo_new_id debe ser un número positivo' })
    archivo_new_id: number;
}
