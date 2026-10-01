import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { URL_API } from './config';
import { ReponseAuth, Role, Utilisateur } from './modeles';

const CLE_JETON = 'taskflow_jeton';
const CLE_UTILISATEUR = 'taskflow_utilisateur';

@Injectable({ providedIn: 'root' })
export class AuthentificationService {
  private http = inject(HttpClient);
  private routeur = inject(Router);

  private _jeton = signal<string | null>(localStorage.getItem(CLE_JETON));
  private _utilisateur = signal<Utilisateur | null>(this.lireUtilisateurStocke());

  readonly jeton = this._jeton.asReadonly();
  readonly utilisateur = this._utilisateur.asReadonly();
  readonly estConnecte = computed(() => !!this._jeton() && !!this._utilisateur());

  connecter(identifiants: { email: string; motDePasse: string }) {
    return this.http
      .post<ReponseAuth>(`${URL_API}/auth/connexion`, identifiants)
      .pipe(tap((reponse) => this.ouvrirSession(reponse)));
  }

  inscrire(donnees: { nom: string; prenom: string; email: string; motDePasse: string }) {
    return this.http
      .post<ReponseAuth>(`${URL_API}/auth/inscription`, donnees)
      .pipe(tap((reponse) => this.ouvrirSession(reponse)));
  }

  /** Resynchronise le profil (ex. rôle modifié par un administrateur). */
  actualiserProfil() {
    this.http.get<Utilisateur>(`${URL_API}/auth/moi`).subscribe({
      next: (u) =>
        this.enregistrerUtilisateur({
          id: u.id,
          email: u.email,
          nom: u.nom,
          prenom: u.prenom,
          role: u.role,
        }),
      error: () => {}, // un 401 est géré par l'intercepteur
    });
  }

  deconnecter() {
    localStorage.removeItem(CLE_JETON);
    localStorage.removeItem(CLE_UTILISATEUR);
    this._jeton.set(null);
    this._utilisateur.set(null);
    this.routeur.navigate(['/connexion']);
  }

  aRole(...roles: Role[]): boolean {
    const utilisateur = this._utilisateur();
    return !!utilisateur && roles.includes(utilisateur.role);
  }

  private ouvrirSession(reponse: ReponseAuth) {
    localStorage.setItem(CLE_JETON, reponse.jeton);
    this._jeton.set(reponse.jeton);
    this.enregistrerUtilisateur(reponse.utilisateur);
  }

  private enregistrerUtilisateur(utilisateur: Utilisateur) {
    localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur));
    this._utilisateur.set(utilisateur);
  }

  private lireUtilisateurStocke(): Utilisateur | null {
    try {
      const brut = localStorage.getItem(CLE_UTILISATEUR);
      return brut ? (JSON.parse(brut) as Utilisateur) : null;
    } catch {
      return null;
    }
  }
}