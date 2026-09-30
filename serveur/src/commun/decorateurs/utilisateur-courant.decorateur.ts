import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UtilisateurCourant = createParamDecorator(
  (_donnee: unknown, contexte: ExecutionContext) =>
    contexte.switchToHttp().getRequest().user,
);