import {
    IsEmail,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    IsOptional,
    IsArray,
    IsInt
} from "class-validator";

/**
 * DTO para crear un nuevo usuario
 * 
 * Define la estructura y validaciones para los datos necesarios
 * al crear un usuario en el sistema.
 */
export class CreateUserDto {

    /**
     * Nombre completo del usuario
     */
    @IsString()
    @MinLength(3)
    name: string;

    /**
     * Email único del usuario
     */
    @IsString()
    @IsEmail()
    email: string;

    /**
     * Contraseña del usuario
     * Debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número
     */
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'La contraseña debe tener una letra mayúscula, una minúscula y un número',
    })
    password: string;

    /**
     * Array de IDs de roles a asignar al usuario (opcional)
     */
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    rolIds?: number[];
}