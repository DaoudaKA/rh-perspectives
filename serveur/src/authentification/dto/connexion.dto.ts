import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConnexionDto {
  @ApiProperty() @IsEmail({}, { message: 'Email invalide' }) email: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Le mot de passe est obligatoire' }) motDePasse: string;
}