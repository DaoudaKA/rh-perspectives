import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseDeDonneesService } from '../base-de-donnees/base-de-donnees.service';

@Injectable()
export class UtilisateursService {
  constructor(private bdd: BaseDeDonneesService) {}

  trouverParEmail(email: string) {
    return this.bdd.utilisateur.findUnique({ where: { email } });
  }

  trouverParId(id: string) {
    return this.bdd.utilisateur.findUnique({ where: { id } });
  }

  creer(donnees: Prisma.UtilisateurCreateInput) {
    return this.bdd.utilisateur.create({ data: donnees });
  }
}