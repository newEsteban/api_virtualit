import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentarioService } from './comentario.service';
import { ComentarioController } from './comentario.controller';
import { Comentario } from './entities/comentario.entity';
import { User } from '../user/entities/user.entity';
import { Archivo } from '../archivo/entities/archivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comentario, User, Archivo]),
  ],
  controllers: [ComentarioController],
  providers: [ComentarioService],
  exports: [ComentarioService],
})
export class ComentarioModule { }
