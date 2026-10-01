import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { messageErreur } from '../../coeur/erreur-http';
import { LIBELLES_STATUT, StatutTache, Tache } from '../../coeur/modeles';
import { TachesService } from '../../coeur/taches.service';
import { BadgeStatutComponent } from '../../partage/badge-statut.component';

@Component({
  selector: 'app-liste-taches',
  imports: [RouterLink, DatePipe, BadgeStatutComponent],
  template: `
    <div class="page-head">
      <h2>Mes tâches</h2>
      <span class="spacer"></span>
      <select aria-label="Filtrer par statut" (change)="changerFiltre($any($event.target).value)">
        <option value="">Tous les statuts</option>
        @for (s of statuts; track s) {
          <option [value]="s">{{ libelles[s] }}</option>
        }
      </select>
      <a class="btn btn-primary" routerLink="/taches/nouvelle">+ Nouvelle tâche</a>
    </div>

    @if (erreur()) {
      <div class="alert alert-error" role="alert">{{ erreur() }}</div>
    }
    @if (info()) {
      <div class="alert alert-success" role="status">{{ info() }}</div>
    }

    @if (chargement()) {
      <p class="muted">Chargement…</p>
    } @else if (taches().length === 0) {
      <div class="card vide">
        <p>Aucune tâche{{ filtre() ? ' avec ce statut' : '' }}.</p>
      </div>
    } @else {
      <div class="liste-taches">
        @for (t of taches(); track t.id) {
          <article class="card tache">
            <div class="tache-tete">
              <h3>{{ t.titre }}</h3>
              <app-badge-statut [statut]="t.statut" />
            </div>
            <p class="tache-desc">{{ t.description }}</p>

            @if (t.statut === 'REJETEE') {
              <div class="note-rejet">
                <strong>Rejetée{{ t.validateur ? ' par ' + t.validateur.prenom + ' ' + t.validateur.nom : '' }}.</strong>
                {{ t.commentaireRejet || 'Aucun commentaire.' }}
              </div>
            }
            @if (t.statut === 'VALIDEE' && t.validateur) {
              <div class="muted">Validée par {{ t.validateur.prenom }} {{ t.validateur.nom }}</div>
            }

            <div class="tache-meta muted">
              <span>Créée le {{ t.creeLe | date: 'dd/MM/yyyy HH:mm' }}</span>
              <span>Modifiée le {{ t.modifieLe | date: 'dd/MM/yyyy HH:mm' }}</span>
            </div>

            @if (t.statut === 'BROUILLON' || t.statut === 'REJETEE') {
              <div class="tache-actions">
                <button class="btn btn-primary" [disabled]="occupee() === t.id" (click)="soumettre(t)">
                  {{ t.statut === 'REJETEE' ? 'Resoumettre' : 'Soumettre' }}
                </button>
                <a class="btn btn-ghost" [routerLink]="['/taches', t.id, 'modifier']">Modifier</a>
                <button class="btn btn-danger" [disabled]="occupee() === t.id" (click)="supprimer(t)">
                  Supprimer
                </button>
              </div>
            }
          </article>
        }
      </div>
    }
  `,
})
export class ListeTachesComponent implements OnInit {
  private api = inject(TachesService);

  statuts = Object.keys(LIBELLES_STATUT) as StatutTache[];
  libelles = LIBELLES_STATUT;

  taches = signal<Tache[]>([]);
  filtre = signal<StatutTache | ''>('');
  chargement = signal(false);
  occupee = signal<string | null>(null);
  erreur = signal('');
  info = signal('');

  ngOnInit() {
    this.charger();
  }

  changerFiltre(valeur: StatutTache | '') {
    this.filtre.set(valeur);
    this.charger();
  }

  soumettre(t: Tache) {
    this.executer(t, this.api.soumettre(t.id), 'Tâche soumise pour validation.');
  }

  supprimer(t: Tache) {
    if (!confirm(`Supprimer « ${t.titre} » ? Cette action est définitive.`)) return;
    this.executer(t, this.api.supprimer(t.id), 'Tâche supprimée.');
  }

  private charger() {
    this.chargement.set(true);
    this.api.mesTaches(this.filtre() || undefined).subscribe({
      next: (taches) => {
        this.taches.set(taches);
        this.chargement.set(false);
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.chargement.set(false);
      },
    });
  }

  private executer(t: Tache, requete: Observable<unknown>, messageSucces: string) {
    this.occupee.set(t.id);
    this.erreur.set('');
    this.info.set('');
    requete.subscribe({
      next: () => {
        this.info.set(messageSucces);
        this.occupee.set(null);
        this.charger();
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.occupee.set(null);
      },
    });
  }
}