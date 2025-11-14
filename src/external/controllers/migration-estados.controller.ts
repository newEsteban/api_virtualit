import { Body, Controller, HttpException, HttpStatus, Logger, Post } from "@nestjs/common";
import { CobancSubtipoMigrationService } from "../services/cobanc-subtipo-migration.service";
import { MigrateSubtipoDto } from "../dtos/local-general.dto";

@Controller('migration-estados')
export class MigrationEstadosController {
    private readonly logger = new Logger(MigrationEstadosController.name);

    constructor(    
        private readonly conbancSubtipoMigrationService: CobancSubtipoMigrationService,
    ){}

    @Post('update-or-create-subtipo')
    async migrateSubtiposTicket(    
       @Body() body: MigrateSubtipoDto
    ){
        try {
            this.logger.log('Iniciando copia de subtipos para el tickets...');
            
            const result = await this.conbancSubtipoMigrationService.migrateSubtipos(body);

            return {
                success: true,
                message: 'Copia de subtipos completada exitosamente',
                result
            };

        } catch (error) {
            this.logger.error('Error durante la copia de subtipos:', error.message);
            throw new HttpException({
                success: false,
                message: 'Error durante la copia de subtipos',
                error: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}