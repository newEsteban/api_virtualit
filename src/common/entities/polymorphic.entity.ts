/**
 * Base helper para entidades que participan en relaciones polimórficas.
 * Provee métodos utilitarios `getKey()` y `getType()` usados por migraciones y helpers.
 */
export class PolymorphicEntity {
    /**
     * Devuelve el identificador de la entidad (puede ser number o string).
     * Implementación genérica que asume la propiedad `id` en la entidad.
     */
    getKey(): number | string | null {
        // `id` puede ser number o string (uuid)
        // usamos any para evitar errores de tipado en la base común
        // y devolver null si no existe.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const self: any = this as any;
        return typeof self.id !== 'undefined' ? self.id : null;
    }

    /**
     * Devuelve el nombre de la clase (ej: 'User', 'Ticket').
     */
    getType(): string {
        // Obtener el nombre del constructor es suficiente para identificar la entidad
        // en la mayoría de los casos. Si se usa minificación/obfuscación, considera
        // definir una constante estática `ENTITY_TYPE` en cada entidad.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctor: any = (this as any).constructor;
        // Si la clase define una constante estática `ENTITY_TYPE`, úsala
        if (ctor && typeof ctor.ENTITY_TYPE === 'string' && ctor.ENTITY_TYPE.length) {
            return ctor.ENTITY_TYPE;
        }
        return (ctor && ctor.name) ? ctor.name : '';
    }
}
