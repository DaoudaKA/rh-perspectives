import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class InscriptionDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Le nom est obligatoire' }) nom: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Le prénom est obligatoire' }) prenom: string;
  @ApiProperty() @IsEmail({}, { message: 'Email invalide' }) email: string;
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  motDePasse: string;
}