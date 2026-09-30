import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { CLE_ROLES } from '../decorateurs/roles.decorateur';

@Injectable()
export class RolesGarde implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(contexte: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(CLE_ROLES, [
      contexte.getHandler(),
      contexte.getClass(),
    ]);
    if (!roles?.length) return true;

    const { user } = contexte.switchToHttp().getRequest();
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Accès refusé : rôle insuffisant');
    }
    return true;
  }
}