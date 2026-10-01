import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatutTache } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class FiltrerTachesDto {
  @ApiPropertyOptional({ enum: StatutTache })
  @IsOptional()
  @IsEnum(StatutTache, { message: 'Statut invalide' })
  statut?: StatutTache;
}