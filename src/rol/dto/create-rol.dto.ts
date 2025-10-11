import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsInt, MaxLength, MinLength, IsNotEmpty, Min } from 'class-validator';

/**
 * DTO para crear un nuevo rol
 * 
 * Define la estructura y validaciones para los datos necesarios
 * al crear un rol en el sistema.
 */
export class CreateRolDto {
    /**
     * Nombre único del rol
     * Ej: "admin", "editor", "viewer"
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    /**
     * Descripción del rol (opcional)
     * Explica las responsabilidades del rol
     */
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    /**
     * Nivel de prioridad del rol (opcional)
     * Menor número = mayor prioridad
     */
    @IsOptional()
    @IsNumber()
    @Min(1)
    priority?: number;

    /**
     * Estado activo del rol (opcional, por defecto true)
     */
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    /**
     * Array de IDs de permisos a asignar al rol (opcional)
     */
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    permisoIds?: number[];
}
