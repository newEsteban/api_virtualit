import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtipoService } from './subtipo.service';
import { SubtipoController } from './subtipo.controller';
import { Subtipo } from './entities/subtipo.entity';
import { Tipo } from '../tipo/entities/tipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subtipo, Tipo])],
  controllers: [SubtipoController],
  providers: [SubtipoService],
  exports: [SubtipoService],
})
export class SubtipoModule { }
