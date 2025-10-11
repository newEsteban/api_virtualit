#!/usr/bin/env node

import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { MigrateTicketsCommand } from './commands/migrate-tickets.command';

/**
 * Punto de entrada para ejecutar comandos CLI
 * 
 * Uso:
 * npm run command -- migrate-tickets --help
 * npm run command -- migrate-tickets --stats
 * npm run command -- migrate-tickets --dry-run
 * npm run command -- migrate-tickets --no-dry-run
 * npm run command -- migrate-tickets --fecha-desde 2024-01-01 --fecha-hasta 2024-12-31
 * npm run command -- migrate-tickets --estado ABIERTO
 * npm run command -- migrate-tickets --ticket-id 123
 */
async function bootstrap() {
    await CommandFactory.run(AppModule, {
        logger: ['error', 'warn', 'log'],
        errorHandler: (err) => {
            console.error('❌ Error ejecutando comando:', err.message);
            process.exit(1);
        },
    });
}

bootstrap();