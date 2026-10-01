import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { messageErreur } from '../../coeur/erreur-http';
import { Tache } from '../../coeur/modeles';
import { TachesService } from '../../coeur/taches.service';

@Component({
  selector: 'app-formulaire-tache',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form class="card carte-formulaire" [formGroup]="formulaire" (ngSubmit)="enregistrer(false)">
      <h2>{{ id ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>

      @if (erreur()) {
        <div class="alert alert-error" role="alert">{{ erreur() }}</div>
      }
      @if (tache()?.statut === 'REJETEE') {
        <div class="note-rejet">
          <strong>Motif du rejet :</strong> {{ tache()?.commentaireRejet || 'Aucun commentaire.' }}
        </div>
      }

      <label>Titre
        <input formControlName="titre" maxlength="150" />
      </label>
      @if (formulaire.controls.titre.touched && formulaire.controls.titre.invalid) {
        <small class="field-error">Le titre est obligatoire (150 caractères maximum)</small>
      }

      <label>Description
        <textarea formControlName="description" rows="6"></textarea>
      </label>
      @if (formulaire.controls.description.touched && formulaire.controls.description.invalid) {
        <small class="field-error">La description est obligatoire</small>
      }

      <div class="form-actions">
        <button class="btn btn-primary" type="submit" [disabled]="enCours() || formulaire.disabled">
          Enregistrer
        </button>
        <button class="btn btn-ghost" type="button" [disabled]="enCours() || formulaire.disabled" (click)="enregistrer(true)">
          Enregistrer et soumettre
        </button>
        <a class="btn btn-ghost" routerLink="/taches">Annuler</a>
      </div>
    </form>
  `,
})
export class FormulaireTacheComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(TachesService);
  private routeur = inject(Router);

  id = inject(ActivatedRoute).snapshot.paramMap.get('id');

  formulaire = this.fb.nonNullable.group({
    titre: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', Validators.required],
  });
  tache = signal<Tache | null>(null);
  enCours = signal(false);
  erreur = signal('');

  ngOnInit() {
    if (!this.id) return;
    this.api.une(this.id).subscribe({
      next: (t) => {
        this.tache.set(t);
        this.formulaire.patchValue({ titre: t.titre, description: t.description });
        if (t.statut !== 'BROUILLON' && t.statut !== 'REJETEE') {
          this.erreur.set('Cette tâche ne peut plus être modifiée (statut : ' + t.statut + ').');
          this.formulaire.disable();
        }
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.formulaire.disable();
      },
    });
  }

  enregistrer(puisSoumettre: boolean) {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.enCours.set(true);
    this.erreur.set('');

    const donnees = this.formulaire.getRawValue();
    const enregistree$ = this.id ? this.api.modifier(this.id, donnees) : this.api.creer(donnees);
    const requete$ = puisSoumettre
      ? enregistree$.pipe(switchMap((t) => this.api.soumettre(t.id)))
      : enregistree$;

    requete$.subscribe({
      next: () => this.routeur.navigateByUrl('/taches'),
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.enCours.set(false);
      },
    });
  }
}