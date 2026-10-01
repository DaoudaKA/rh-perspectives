import { BadRequestException, Injectable } from '@nestjs/common';
import { Role, StatutTache } from '@prisma/client';
import { BaseDeDonneesService } from '../base-de-donnees/base-de-donnees.service';

@Injectable()
export class AdministrationService {
  constructor(private bdd: BaseDeDonneesService) {}

  utilisateurs() {
    return this.bdd.utilisateur.findMany({
      select: {
        id: true, nom: true, prenom: true, email: true, role: true, creeLe: true,
        _count: { select: { tachesCreees: true } },
      },
      orderBy: { creeLe: 'asc' },
    });
  }

  modifierRole(id: string, role: Role, moiId: string) {
    if (id === moiId) {
      throw new BadRequestException('Vous ne pouvez pas modifier votre propre rôle');
    }
    return this.bdd.utilisateur.update({
      where: { id },
      data: { role },
      select: { id: true, nom: true, prenom: true, email: true, role: true },
    });
  }

  taches(statut?: StatutTache) {
    return this.bdd.tache.findMany({
      where: statut ? { statut } : {},
      include: {
        createur: { select: { id: true, nom: true, prenom: true, email: true } },
        validateur: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { modifieLe: 'desc' },
    });
  }
}