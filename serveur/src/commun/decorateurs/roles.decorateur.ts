import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const CLE_ROLES = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(CLE_ROLES, roles);