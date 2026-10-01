import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatutTache, Tache, Utilisateur } from '@prisma/client';
import { BaseDeDonneesService } from '../base-de-donnees/base-de-donnees.service';
import { CreerTacheDto } from './dto/creer-tache.dto';
import { ModifierTacheDto } from './dto/modifier-tache.dto';

type UtilisateurAuth = Omit<Utilisateur, 'motDePasse'>;

const inclure = {
  createur: { select: { id: true, nom: true, prenom: true, email: true } },
  validateur: { select: { id: true, nom: true, prenom: true } },
};

@Injectable()
export class TachesService {
  constructor(private bdd: BaseDeDonneesService) {}

  creer(dto: CreerTacheDto, utilisateur: UtilisateurAuth) {
    return this.bdd.tache.create({
      data: { ...dto, createurId: utilisateur.id },
      include: inclure,
    });
  }

  /** Mes tâches (tous rôles). */
  mesTaches(utilisateur: UtilisateurAuth, statut?: StatutTache) {
    return this.bdd.tache.findMany({
      where: { createurId: utilisateur.id, ...(statut && { statut }) },
      include: inclure,
      orderBy: { modifieLe: 'desc' },
    });
  }

  /** Tâches à traiter (manager) : celles des autres, en attente de validation. */
  aValider(utilisateur: UtilisateurAuth) {
    return this.bdd.tache.findMany({
      where: { statut: StatutTache.SOUMISE, createurId: { not: utilisateur.id } },
      include: inclure,
      orderBy: { modifieLe: 'asc' },
    });
  }

  async trouverUne(id: string, utilisateur: UtilisateurAuth) {
    const tache = await this.recupererOuEchouer(id);
    this.verifierLecture(tache, utilisateur);
    return tache;
  }

  async modifier(id: string, dto: ModifierTacheDto, utilisateur: UtilisateurAuth) {
    const tache = await this.recupererOuEchouer(id);
    this.verifierProprietaire(tache, utilisateur);
    this.verifierModifiable(tache);
    return this.bdd.tache.update({ where: { id }, data: dto, include: inclure });
  }

  async supprimer(id: string, utilisateur: UtilisateurAuth) {
    const tache = await this.recupererOuEchouer(id);
    this.verifierProprietaire(tache, utilisateur);
    this.verifierModifiable(tache);
    await this.bdd.tache.delete({ where: { id } });
    return { message: 'Tâche supprimée' };
  }

  /** BROUILLON ou REJETEE -> SOUMISE (par le créateur). */
  async soumettre(id: string, utilisateur: UtilisateurAuth) {
    const tache = await this.recupererOuEchouer(id);
    this.verifierProprietaire(tache, utilisateur);
    this.verifierStatut(tache, [StatutTache.BROUILLON, StatutTache.REJETEE], 'soumise');
    return this.bdd.tache.update({
      where: { id },
      data: { statut: StatutTache.SOUMISE, commentaireRejet: null, validateurId: null },
      include: inclure,
    });
  }

  /** SOUMISE -> VALIDEE (manager, jamais sur sa propre tâche). */
  async valider(id: string, utilisateur: UtilisateurAuth) {
    await this.recupererATraiter(id, utilisateur);
    return this.bdd.tache.update({
      where: { id },
      data: { statut: StatutTache.VALIDEE, validateurId: utilisateur.id, commentaireRejet: null },
      include: inclure,
    });
  }

  /** SOUMISE -> REJETEE (manager, jamais sur sa propre tâche). */
  async rejeter(id: string, utilisateur: UtilisateurAuth, commentaire?: string) {
    await this.recupererATraiter(id, utilisateur);
    return this.bdd.tache.update({
      where: { id },
      data: {
        statut: StatutTache.REJETEE,
        validateurId: utilisateur.id,
        commentaireRejet: commentaire ?? null,
      },
      include: inclure,
    });
  }

  // ---------- Règles métier ----------

  private async recupererOuEchouer(id: string) {
    const tache = await this.bdd.tache.findUnique({ where: { id }, include: inclure });
    if (!tache) throw new NotFoundException('Tâche introuvable');
    return tache;
  }

  private async recupererATraiter(id: string, utilisateur: UtilisateurAuth) {
    const tache = await this.recupererOuEchouer(id);
    if (tache.createurId === utilisateur.id) {
      throw new ForbiddenException('Vous ne pouvez pas traiter votre propre tâche');
    }
    this.verifierStatut(tache, [StatutTache.SOUMISE], 'traitée (elle doit être soumise)');
    return tache;
  }

  private verifierProprietaire(tache: Tache, utilisateur: UtilisateurAuth) {
    if (tache.createurId !== utilisateur.id) {
      throw new ForbiddenException('Cette tâche ne vous appartient pas');
    }
  }

  private verifierLecture(tache: Tache, utilisateur: UtilisateurAuth) {
    const privilegie =
      utilisateur.role === Role.ADMINISTRATEUR || utilisateur.role === Role.MANAGER;
    if (tache.createurId !== utilisateur.id && !privilegie) {
      throw new ForbiddenException('Accès refusé à cette tâche');
    }
  }

  private verifierModifiable(tache: Tache) {
    this.verifierStatut(
      tache,
      [StatutTache.BROUILLON, StatutTache.REJETEE],
      'modifiée ou supprimée',
    );
  }

  private verifierStatut(tache: Tache, autorises: StatutTache[], action: string) {
    if (!autorises.includes(tache.statut)) {
      throw new BadRequestException(
        `La tâche ne peut pas être ${action} : statut actuel "${tache.statut}"`,
      );
    }
  }
}