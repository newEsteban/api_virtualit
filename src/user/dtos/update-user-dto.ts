import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, IsInt, MinLength, MaxLength, Matches } from "class-validator";

/**
 * DTO para actualizar un usuario existente
 * 
 * Define la estructura y validaciones para los datos que pueden ser
 * actualizados en un usuario del sistema.
 */
export class UpdateUserDto {
    /**
     * Nombre completo del usuario (opcional)
     */
    @IsOptional()
    @IsString()
    @MinLength(3)
    name?: string;

    /**
     * Email del usuario (opcional)
     */
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    /**
     * Nueva contraseña del usuario (opcional)
     */
    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'La contraseña debe tener una letra mayúscula, una minúscula y un número',
    })
    password?: string;

    /**
     * Estado activo del usuario (opcional)
     */
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    /**
     * Array de IDs de roles a asignar al usuario (opcional)
     */
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    rolIds?: number[];
}
