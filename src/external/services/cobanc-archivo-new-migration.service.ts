import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { In, Repository } from "typeorm";
import { TblArchivosNew } from "../entities/tbl-archivos-new.entity";
import { ArchivoService } from "../../archivo/archivo.service";
import { Archivo } from "../../archivo/entities/archivo.entity";
import { AssociatedEntity } from "../interfaces/associated-entity.interface";
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

@Injectable()
export class CobancArchivoNewMigrationService {
    private readonly logger = new Logger(CobancArchivoNewMigrationService.name);
    private readonly cobancFileDownloadUrl: string;
    private readonly storageBasePath: string;
    private readonly mkdir = promisify(fs.mkdir);
    private readonly writeFile = promisify(fs.writeFile);

    constructor(
        @InjectRepository(TblArchivosNew, 'newSistemasConnection')
        private readonly tblArchivosNewRepository: Repository<TblArchivosNew>,

        private readonly archivoService: ArchivoService,
        private readonly configService: ConfigService,
    ) {
        this.cobancFileDownloadUrl = this.configService.get<string>('COBANC_FILE_DOWNLOAD_URL') || '';
        // Definir la ruta base del storage (ajustar según tu proyecto)
        this.storageBasePath = path.join(process.cwd(), 'storage', 'archivos');
        this.ensureStorageDirectoryExists();
    }

    /**
     * Asegura que el directorio de storage exista.
     */
    private async ensureStorageDirectoryExists(): Promise<void> {
        try {
            if (!fs.existsSync(this.storageBasePath)) {
                await this.mkdir(this.storageBasePath, { recursive: true });
                this.logger.log(`Directorio de storage creado: ${this.storageBasePath}`);
            }
        } catch (error) {
            this.logger.error(`Error creando directorio de storage: ${error.message}`);
        }
    }

    /**
     * Migra archivos desde la base de datos de Cobanc a la base de datos local.
     * 
     * Esta función realiza las siguientes operaciones:
     * 1. Obtiene todos los archivos de la tabla tbl_archivos_new de Cobanc.
     * 2. Filtra los archivos que ya existen en la base de datos local usando archivo_new_id.
     * 3. Migra solo los archivos que no existen, extrayendo únicamente los campos compatibles con la entidad Archivo.
     * 4. Extrae la extensión del archivo desde el campo filename.
     * 5. Registra logs detallados del proceso de migración.
     * 
     * Validaciones:
     * - archivo_new_id debe ser único, por lo tanto no se crean archivos duplicados.
     * - Solo se migran los campos que existen en la entidad Archivo local.
     * 
    * @param archivoNewIds - Array de IDs específicos a migrar.
    * @param associatedEntity -  Entidad a la que se asociarán los archivos migrados.
    *                            Ej: { type: 'Ticket', id: 42 }.
    *                            Si no se proporciona, se usarán los valores originales de Cobanc.
    * @returns Promise<{ migrated: number, skipped: number, errors: number }> - Estadísticas de la migración.
     */
    async migrateArchivos(
        archivoNewIds: number[],
        associatedEntity?: AssociatedEntity,
    ): Promise<{ migrated: number, skipped: number, errors: number }> {
        this.logger.log('Iniciando migración de archivos desde Cobanc...');

        let archivosCobanc: TblArchivosNew[] = [];

        // Obtener archivos de Cobanc según filtro
        if (archivoNewIds && archivoNewIds.length > 0) {
            this.logger.log(`Migrando archivos específicos: ${archivoNewIds.join(', ')}`);
            archivosCobanc = await this.tblArchivosNewRepository.findBy({ id: In(archivoNewIds) });
        } 

        if (archivosCobanc.length === 0) {
            this.logger.warn('No se encontraron archivos para migrar en Cobanc');
            return { migrated: 0, skipped: 0, errors: 0 };
        }

        this.logger.log(`Se encontraron ${archivosCobanc.length} archivos en Cobanc`);

        // Obtener IDs de archivos que ya existen en la base de datos local
        const archivoNewIdsCobanc = archivosCobanc.map(archivo => archivo.id);
        const archivosExistentes = await this.archivoService.findByArchivoNewIds(archivoNewIdsCobanc);
        const existingIds = new Set(archivosExistentes.map(archivo => archivo.archivo_new_id));

        this.logger.log(`${existingIds.size} archivos ya existen en la base de datos local`);

        // Filtrar archivos que no existen
        const archivosToMigrate = archivosCobanc.filter(archivo => !existingIds.has(archivo.id));

        if (archivosToMigrate.length === 0) {
            this.logger.log('No hay archivos nuevos para migrar');
            return { migrated: 0, skipped: archivosCobanc.length, errors: 0 };
        }

        this.logger.log(`Se migrarán ${archivosToMigrate.length} archivos nuevos`);

        // Migrar archivos en paralelo usando Promise.allSettled
        const results = await Promise.allSettled(
            archivosToMigrate.map(archivoCobanc =>
                this.createArchivoFromCobanc(archivoCobanc, associatedEntity)
            )
        );

        // Contar resultados
        let migrated = 0;
        let errors = 0;

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.logger.error(`Error migrando archivo ID ${archivosToMigrate[index].id}: ${result.reason}`);
                errors++;
            } else {
                this.logger.log(`Archivo ID ${archivosToMigrate[index].id} migrado exitosamente`);
                migrated++;
            }
        });

        const skipped = archivosCobanc.length - archivosToMigrate.length;

        this.logger.log(`Migración completada: ${migrated} migrados, ${skipped} omitidos, ${errors} errores`);

        return { migrated, skipped, errors };
    }

    /**
     * Crea un archivo local a partir de un archivo de Cobanc.
     * Descarga el archivo desde Cobanc, lo guarda en el storage local,
     * y solo crea la entidad Archivo si el guardado fue exitoso.
     * 
    * @param archivoCobanc - Archivo de la base de datos de Cobanc
    * @param associatedEntity - (Opcional) Entidad a la que se asociará este archivo local.
    *                            Si se pasa, sobrescribe `documentable_type`/`documentable_id`.
    * @returns Promise<Archivo> - Archivo creado en la base de datos local
    * @throws Error si no se puede descargar o guardar el archivo
     */
    public async createArchivoFromCobanc(archivoCobanc: TblArchivosNew, associatedEntity?: AssociatedEntity): Promise<Archivo> {
        this.logger.log(`Procesando archivo: ${archivoCobanc.display_name} (ID: ${archivoCobanc.id})`);

        // 1. Generar URL de descarga desde Cobanc
        const downloadUrl = this.generateDownloadUrl(archivoCobanc.route);
        
        if (!downloadUrl) {
            throw new BadRequestException(`No se pudo generar URL de descarga para archivo ID ${archivoCobanc.id}`);
        }

        // 2. Descargar el archivo desde Cobanc
        let fileBuffer: Buffer;
        try {
            this.logger.debug(`Descargando archivo desde: ${downloadUrl}`);
            const response = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 30000, // 30 segundos de timeout
                validateStatus: (status) => status === 200,
            });
            fileBuffer = Buffer.from(response.data as ArrayBuffer);
            this.logger.log(`Archivo descargado exitosamente: ${archivoCobanc.display_name} (${fileBuffer.length} bytes)`);
        } catch (error) {
            this.logger.error(`Error descargando archivo ID ${archivoCobanc.id}: ${error.message}`);
            throw new Error(`No se pudo descargar el archivo desde Cobanc: ${error.message}`);
        }

        // 3. Generar nombre único y ruta de almacenamiento
        const extension = this.extractExtension(archivoCobanc.filename);
        const timestamp = Date.now();
        const uniqueFilename = `${archivoCobanc.id}_${timestamp}.${extension}`;
        const relativePath = path.join('archivos', uniqueFilename);
        const absolutePath = path.join(this.storageBasePath, uniqueFilename);

        // 4. Guardar archivo en el storage local
        try {
            await this.writeFile(absolutePath, fileBuffer);
            this.logger.log(`Archivo guardado en storage: ${absolutePath}`);
        } catch (error) {
            this.logger.error(`Error guardando archivo ID ${archivoCobanc.id} en storage: ${error.message}`);
            throw new Error(`No se pudo guardar el archivo en storage: ${error.message}`);
        }

        // 5. Verificar que el archivo se guardó correctamente
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`El archivo no existe después de guardarlo: ${absolutePath}`);
        }

        const stats = fs.statSync(absolutePath);
        if (stats.size !== fileBuffer.length) {
            // Eliminar archivo corrupto
            fs.unlinkSync(absolutePath);
            throw new Error(`El archivo guardado tiene un tamaño incorrecto`);
        }

        this.logger.log(`✅ Archivo verificado exitosamente en storage`);

        // 6. Crear entidad Archivo en la base de datos local
        const createArchivoDto = {
            archivable_type: associatedEntity?.type ?? archivoCobanc.archivable_type,
            archivable_id: associatedEntity?.id ?? archivoCobanc.archivable_id,
            route: relativePath, // Ruta relativa en el storage local
            display_name: archivoCobanc.display_name,
            extension: extension,
            archivo_new_id: archivoCobanc.id, // ID único de referencia
        };

        this.logger.debug(`Creando registro en BD: ${createArchivoDto.display_name} con archivo_new_id: ${createArchivoDto.archivo_new_id}`);

        try {
            const archivo = await this.archivoService.create(createArchivoDto);
            this.logger.log(`✅ Archivo migrado completamente: ID ${archivo.id}`);
            return archivo;
        } catch (error) {
            // Si falla la inserción en BD, eliminar el archivo del storage
            this.logger.error(`Error creando registro en BD, eliminando archivo del storage...`);
            try {
                fs.unlinkSync(absolutePath);
            } catch (unlinkError) {
                this.logger.error(`Error eliminando archivo del storage: ${unlinkError.message}`);
            }
            throw error;
        }
    }

    /**
     * Extrae la extensión del nombre de archivo.
     * 
     * @param filename - Nombre del archivo con extensión
     * @returns string - Extensión sin el punto (ej: 'pdf', 'jpg')
     */
    private extractExtension(filename: string): string {
        if (!filename || filename.trim() === '') {
            return '';
        }

        const parts = filename.split('.');
        if (parts.length < 2) {
            return '';
        }

        return parts[parts.length - 1].toLowerCase();
    }

    /**
     * Genera la URL de descarga de un archivo desde el sistema de Cobanc.
     * 
     * El sistema de Cobanc espera que la ruta del archivo esté codificada en base64.
     * La URL final será: https://newsistemas.cobanc.cl/descargar/public/{ruta_en_base64}
     * 
     * @param route - Ruta del archivo en el sistema de Cobanc
     * @returns string - URL completa de descarga con la ruta codificada en base64
     * 
     * @example
     * ```typescript
     * const url = generateDownloadUrl('storage/tickets/archivo.pdf');
     * // Resultado: https://newsistemas.cobanc.cl/descargar/public/c3RvcmFnZS90aWNrZXRzL2FyY2hpdm8ucGRm
     * ```
     */
    public generateDownloadUrl(route: string): string {
        if (!route || route.trim() === '') {
            this.logger.warn('Ruta vacía proporcionada para generar URL de descarga');
            return '';
        }

        // Codificar la ruta en base64
        const encodedRoute = Buffer.from(route).toString('base64');
        
        // Construir la URL completa
        const downloadUrl = `${this.cobancFileDownloadUrl}${encodedRoute}`;
        
        this.logger.debug(`URL de descarga generada: ${downloadUrl} para ruta: ${route}`);
        
        return downloadUrl;
    }

    /**
     * Genera URLs de descarga para múltiples archivos.
     * 
     * @param archivos - Array de archivos de Cobanc
     * @returns Array de objetos con id, display_name y downloadUrl
     */
    public generateDownloadUrls(archivos: TblArchivosNew[]): Array<{ id: number, display_name: string, downloadUrl: string }> {
        return archivos.map(archivo => ({
            id: archivo.id,
            display_name: archivo.display_name,
            downloadUrl: this.generateDownloadUrl(archivo.route)
        }));
    }

    /**
     * Migra un archivo específico por su ID de Cobanc.
     * 
    * @param archivoNewId - ID del archivo en la base de datos de Cobanc
    * @param associatedEntity - (Opcional) Entidad a la que se asociará este archivo al migrarlo.
    * @returns Promise<Archivo | null> - Archivo migrado o null si ya existe o no se encuentra
     */
    async migrateArchivoById(archivoNewId: number, associatedEntity?: AssociatedEntity): Promise<Archivo | null> {
        this.logger.log(`Migrando archivo con ID ${archivoNewId} desde Cobanc`);

        // Validar que no exista ya
        const existingArchivos = await this.archivoService.findByArchivoNewId(archivoNewId);
        if (existingArchivos.length > 0) {
            this.logger.warn(`Archivo con archivo_new_id ${archivoNewId} ya existe en la base de datos local`);
            return null;
        }

        // Buscar archivo en Cobanc
        const archivoCobanc = await this.tblArchivosNewRepository.findOne({
            where: { id: archivoNewId }
        });

        if (!archivoCobanc) {
            this.logger.warn(`Archivo con ID ${archivoNewId} no encontrado en Cobanc`);
            throw new Error(`Archivo con ID ${archivoNewId} no encontrado en Cobanc`);
        }

        // Crear archivo local
        return await this.createArchivoFromCobanc(archivoCobanc, associatedEntity);
    }
}
