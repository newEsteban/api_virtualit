import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoService } from './tipo.service';
import { TipoController } from './tipo.controller';
import { Tipo } from './entities/tipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tipo])],
  controllers: [TipoController],
  providers: [TipoService],
  exports: [TipoService],
})
export class TipoModule { }
