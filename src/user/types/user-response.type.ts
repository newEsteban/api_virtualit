import { Rol } from '../../rol/entities/rol.entity';

/**
 * Tipo de respuesta para el usuario sin información sensible
 * 
 * Excluye métodos internos y la contraseña del usuario
 * para garantizar que la información sensible no se exponga en las respuestas de la API.
 */
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    roles: Rol[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

/**
 * Tipo de respuesta simplificada para el usuario
 * Para casos donde no se necesitan las relaciones
 */
export interface SimpleUserResponse {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    created_at: Date;
    updated_at: Date;
}
