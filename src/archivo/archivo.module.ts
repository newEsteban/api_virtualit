import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivoService } from './archivo.service';
import { ArchivoController } from './archivo.controller';
import { Archivo } from './entities/archivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Archivo])],
  controllers: [ArchivoController],
  providers: [ArchivoService],
  exports: [ArchivoService],
})
export class ArchivoModule { }
