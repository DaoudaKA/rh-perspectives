import { HttpErrorResponse } from '@angular/common/http';

export function messageErreur(erreur: unknown): string {
  if (erreur instanceof HttpErrorResponse) {
    if (erreur.status === 0) return "Serveur injoignable. Vérifiez que l'API est démarrée.";
    const message = erreur.error?.message;
    if (Array.isArray(message)) return message.join(' · ');
    if (typeof message === 'string') return message;
  }
  return 'Une erreur est survenue.';
}