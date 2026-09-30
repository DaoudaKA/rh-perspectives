import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CLE_PUBLIQUE } from '../decorateurs/publique.decorateur';

@Injectable()
export class JwtAuthGarde extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(contexte: ExecutionContext) {
    const estPublique = this.reflector.getAllAndOverride<boolean>(CLE_PUBLIQUE, [
      contexte.getHandler(),
      contexte.getClass(),
    ]);
    if (estPublique) return true;
    return super.canActivate(contexte);
  }
}