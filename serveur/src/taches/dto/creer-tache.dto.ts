import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreerTacheDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MaxLength(150, { message: 'Le titre ne doit pas dépasser 150 caractères' })
  titre: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire' })
  description: string;
}