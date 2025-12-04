export interface AssociatedEntity {
    /**
     * Obtiene el ID de la entidad (clave primaria)
     */
    getKey(): number | string | null;

    /**
     * Obtiene el tipo de la entidad
     */
    getType(): string;
}
