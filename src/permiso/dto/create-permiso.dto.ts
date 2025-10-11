import { IsString, IsOptional, IsBoolean, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

/**
 * DTO para crear un nuevo permiso
 * 
 * Define la estructura y validaciones para los datos necesarios
 * al crear un permiso en el sistema.
 */
export class CreatePermisoDto {
    /**
     * Nombre único del permiso
     * Formato recomendado: "action_resource" (ej: "read_users", "create_posts")
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    /**
     * Descripción del permiso (opcional)
     * Explica qué acción permite realizar
     */
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    /**
     * Recurso al que aplica el permiso
     * Ej: "users", "posts", "dashboard"
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    resource: string;

    /**
     * Acción específica del permiso
     * Ej: "read", "create", "update", "delete"
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    action: string;

    /**
     * Estado activo del permiso (opcional, por defecto true)
     */
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
