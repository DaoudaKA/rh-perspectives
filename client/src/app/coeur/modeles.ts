export type Role = 'COLLABORATEUR' | 'MANAGER' | 'ADMINISTRATEUR';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
}

export interface ReponseAuth {
  jeton: string;
  utilisateur: Utilisateur;
}
export type StatutTache = 'BROUILLON' | 'SOUMISE' | 'VALIDEE' | 'REJETEE';

export const LIBELLES_STATUT: Record<StatutTache, string> = {
  BROUILLON: 'Brouillon',
  SOUMISE: 'Soumise',
  VALIDEE: 'Validée',
  REJETEE: 'Rejetée',
};

export const LIBELLES_ROLE: Record<Role, string> = {
  COLLABORATEUR: 'Collaborateur',
  MANAGER: 'Manager',
  ADMINISTRATEUR: 'Administrateur',
};

export interface RefUtilisateur {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
}

export interface Tache {
  id: string;
  titre: string;
  description: string;
  statut: StatutTache;
  commentaireRejet: string | null;
  creeLe: string;
  modifieLe: string;
  createurId: string;
  validateurId: string | null;
  createur: RefUtilisateur;
  validateur: RefUtilisateur | null;
}

export interface SaisieTache {
  titre: string;
  description: string;
}