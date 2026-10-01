import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthentificationService } from './authentification.service';
import { URL_API } from './config';

export const authentificationIntercepteur: HttpInterceptorFn = (requete, suivant) => {
  const auth = inject(AuthentificationService);
  const jeton = auth.jeton();

  const requeteFinale =
    jeton && requete.url.startsWith(URL_API)
      ? requete.clone({ setHeaders: { Authorization: `Bearer ${jeton}` } })
      : requete;

  return suivant(requeteFinale).pipe(
    catchError((erreur: HttpErrorResponse) => {
      if (erreur.status === 401 && !requete.url.includes('/auth/connexion')) {
        auth.deconnecter();
      }
      return throwError(() => erreur);
    }),
  );
};