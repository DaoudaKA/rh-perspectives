import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthentificationService } from '../coeur/authentification.service';
import { LIBELLES_ROLE, Role } from '../coeur/modeles';

interface LienNav {
  chemin: string;
  libelle: string;
  roles?: Role[]; // absent = visible par tous
}

const LIENS: LienNav[] = [
  { chemin: '/taches', libelle: 'Mes tâches' },
  // Étape suivante :
  // { chemin: '/validation', libelle: 'À valider', roles: ['MANAGER'] },
  // { chemin: '/administration/taches', libelle: 'Toutes les tâches', roles: ['ADMINISTRATEUR'] },
  // { chemin: '/administration/utilisateurs', libelle: 'Utilisateurs', roles: ['ADMINISTRATEUR'] },
];

@Component({
  selector: 'app-mise-en-page',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <strong class="marque">RH Taskflow</strong>
      <nav class="nav">
        @for (l of liens(); track l.chemin) {
          <a [routerLink]="l.chemin" routerLinkActive="actif">{{ l.libelle }}</a>
        }
      </nav>
      <span class="spacer"></span>
      @if (auth.utilisateur(); as u) {
        <span>{{ u.prenom }} {{ u.nom }}</span>
        <span class="badge">{{ libellesRole[u.role] }}</span>
      }
      <button class="btn btn-ghost" (click)="auth.deconnecter()">Déconnexion</button>
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `,
})
export class MiseEnPageComponent implements OnInit {
  auth = inject(AuthentificationService);
  libellesRole = LIBELLES_ROLE;

  liens = computed(() => LIENS.filter((l) => !l.roles || this.auth.aRole(...l.roles)));

  ngOnInit() {
    this.auth.actualiserProfil(); // rôle éventuellement modifié par un administrateur
  }
}