import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFiltre implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, hote: ArgumentsHost) {
    const reponse = hote.switchToHttp().getResponse<Response>();
    const correspondance: Record<string, [number, string]> = {
      P2002: [HttpStatus.CONFLICT, 'Cette valeur existe déjà'],
      P2025: [HttpStatus.NOT_FOUND, 'Ressource introuvable'],
    };
    const [statut, message] = correspondance[exception.code] ?? [
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Erreur interne du serveur',
    ];
    reponse.status(statut).json({ statusCode: statut, message, error: exception.code });
  }
}