import { Injectable } from '@nestjs/common';

/**
 * Servicio para manejar tokens invalidados (blacklist)
 * 
 * Mantiene una lista en memoria de tokens que han sido invalidados
 * mediante logout. Los tokens se eliminan automáticamente cuando expiran.
 */
@Injectable()
export class TokenBlacklistService {
    private blacklistedTokens = new Map<string, number>(); // token -> timestamp de expiración
    private userActiveTokens = new Map<string, string>(); // userId -> current active token

    /**
     * Añade un token a la blacklist
     * 
     * @param token - Token JWT a invalidar
     * @param expirationTime - Timestamp de expiración del token
     */
    addToBlacklist(token: string, expirationTime: number): void {
        this.blacklistedTokens.set(token, expirationTime);
        
        // Limpiar tokens expirados periódicamente
        this.cleanExpiredTokens();
    }

    /**
     * Invalida el token anterior de un usuario y registra el nuevo
     * 
     * @param userId - ID del usuario
     * @param newToken - Nuevo token activo
     * @param newTokenExp - Expiración del nuevo token
     */
    invalidatePreviousUserToken(userId: string, newToken: string, newTokenExp: number): void {
        const previousToken = this.userActiveTokens.get(userId);
        
        if (previousToken) {
            // Invalidar el token anterior añadiéndolo a la blacklist
            // Usamos la expiración del token anterior (asumimos la misma duración)
            this.addToBlacklist(previousToken, newTokenExp);
        }
        
        // Registrar el nuevo token como activo para este usuario
        this.userActiveTokens.set(userId, newToken);
    }

    /**
     * Invalida todos los tokens de un usuario
     * 
     * @param userId - ID del usuario
     */
    invalidateAllUserTokens(userId: string): void {
        const currentToken = this.userActiveTokens.get(userId);
        
        if (currentToken) {
            // Calcular tiempo de expiración (1 hora desde ahora por defecto)
            const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60);
            this.addToBlacklist(currentToken, expirationTime);
            this.userActiveTokens.delete(userId);
        }
    }

    /**
     * Verifica si un token está en la blacklist
     * 
     * @param token - Token JWT a verificar
     * @returns true si el token está invalidado
     */
    isTokenBlacklisted(token: string): boolean {
        const expirationTime = this.blacklistedTokens.get(token);
        
        if (!expirationTime) {
            return false;
        }

        // Si el token ya expiró naturalmente, lo removemos de la blacklist
        const now = Math.floor(Date.now() / 1000);
        if (now > expirationTime) {
            this.blacklistedTokens.delete(token);
            return false;
        }

        return true;
    }

    /**
     * Limpia tokens que ya expiraron naturalmente
     */
    private cleanExpiredTokens(): void {
        const now = Math.floor(Date.now() / 1000);
        
        for (const [token, expirationTime] of this.blacklistedTokens.entries()) {
            if (now > expirationTime) {
                this.blacklistedTokens.delete(token);
            }
        }
    }

    /**
     * Obtiene estadísticas de la blacklist (para debugging)
     */
    getStats(): { totalBlacklisted: number; activeBlacklisted: number; activeUsers: number } {
        this.cleanExpiredTokens();
        return {
            totalBlacklisted: this.blacklistedTokens.size,
            activeBlacklisted: this.blacklistedTokens.size,
            activeUsers: this.userActiveTokens.size,
        };
    }
}
