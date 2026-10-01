import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ModifierRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'Rôle invalide' })
  role: Role;
}