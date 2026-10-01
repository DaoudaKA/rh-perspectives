import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthentificationService } from './authentification.service';
import { Role } from './modeles';

/** Route réservée aux utilisateurs connectés. */
export const gardeConnecte: CanActivateFn = () => {
  const auth = inject(AuthentificationService);
  return auth.estConnecte() ? true : inject(Router).createUrlTree(['/connexion']);
};

/** Connexion et inscription : inaccessibles si déjà connecté. */
export const gardeInvite: CanActivateFn = () => {
  const auth = inject(AuthentificationService);
  return auth.estConnecte() ? inject(Router).createUrlTree(['/']) : true;
};

/** Route réservée à certains rôles, par exemple gardeRole('MANAGER'). */
export const gardeRole =
  (...roles: Role[]): CanActivateFn =>
  () => {
    const auth = inject(AuthentificationService);
    return auth.aRole(...roles) ? true : inject(Router).createUrlTree(['/']);
  };