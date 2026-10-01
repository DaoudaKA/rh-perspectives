import { PartialType } from '@nestjs/swagger';
import { CreerTacheDto } from './creer-tache.dto';

export class ModifierTacheDto extends PartialType(CreerTacheDto) {}