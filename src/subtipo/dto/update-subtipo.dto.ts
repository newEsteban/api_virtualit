import { PartialType } from '@nestjs/mapped-types';
import { CreateSubtipoDto } from './create-subtipo.dto';

export class UpdateSubtipoDto extends PartialType(CreateSubtipoDto) {}
