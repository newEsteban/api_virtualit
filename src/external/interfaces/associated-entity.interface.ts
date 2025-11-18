export interface AssociatedEntity {
    /**
     * Nombre del tipo de entidad (ej: 'Ticket', 'Subtipo')
     */
    type: string;

    /**
     * ID de la entidad asociada en la base de datos local
     */
    id: number;
}
