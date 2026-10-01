import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { URL_API } from './config';
import { SaisieTache, StatutTache, Tache } from './modeles';

@Injectable({ providedIn: 'root' })
export class TachesService {
  private http = inject(HttpClient);
  private url = `${URL_API}/taches`;

  mesTaches(statut?: StatutTache) {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get<Tache[]>(this.url, { params });
  }

  aValider() {
    return this.http.get<Tache[]>(`${this.url}/a-valider`);
  }

  une(id: string) {
    return this.http.get<Tache>(`${this.url}/${id}`);
  }

  creer(donnees: SaisieTache) {
    return this.http.post<Tache>(this.url, donnees);
  }

  modifier(id: string, donnees: Partial<SaisieTache>) {
    return this.http.patch<Tache>(`${this.url}/${id}`, donnees);
  }

  supprimer(id: string) {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }

  soumettre(id: string) {
    return this.http.post<Tache>(`${this.url}/${id}/soumettre`, {});
  }

  valider(id: string) {
    return this.http.post<Tache>(`${this.url}/${id}/valider`, {});
  }

  rejeter(id: string, commentaire?: string) {
    return this.http.post<Tache>(`${this.url}/${id}/rejeter`, { commentaire });
  }
}