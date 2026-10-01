import { Routes } from '@angular/router';
import { gardeConnecte, gardeInvite } from './coeur/gardes';

export const routes: Routes = [
  {
    path: 'connexion',
    canActivate: [gardeInvite],
    loadComponent: () =>
      import('./fonctionnalites/authentification/connexion.component').then(
        (m) => m.ConnexionComponent,
      ),
  },
  {
    path: 'inscription',
    canActivate: [gardeInvite],
    loadComponent: () =>
      import('./fonctionnalites/authentification/inscription.component').then(
        (m) => m.InscriptionComponent,
      ),
  },
  {
    path: '',
    canActivate: [gardeConnecte],
    loadComponent: () =>
      import('./partage/mise-en-page.component').then((m) => m.MiseEnPageComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'taches' },
      {
        path: 'taches',
        loadComponent: () =>
          import('./fonctionnalites/taches/liste-taches.component').then(
            (m) => m.ListeTachesComponent,
          ),
      },
      {
        path: 'taches/nouvelle',
        loadComponent: () =>
          import('./fonctionnalites/taches/formulaire-tache.component').then(
            (m) => m.FormulaireTacheComponent,
          ),
      },
      {
        path: 'taches/:id/modifier',
        loadComponent: () =>
          import('./fonctionnalites/taches/formulaire-tache.component').then(
            (m) => m.FormulaireTacheComponent,
          ),
      },
      // Étape suivante : validation, administration/taches, administration/utilisateurs
    ],
  },
  { path: '**', redirectTo: '' },
];