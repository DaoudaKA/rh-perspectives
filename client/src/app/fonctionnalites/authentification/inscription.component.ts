import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthentificationService } from '../../coeur/authentification.service';
import { messageErreur } from '../../coeur/erreur-http';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <form class="card auth-card" [formGroup]="formulaire" (ngSubmit)="valider()">
        <h1>Créer un compte</h1>
        <p class="muted">Votre compte sera créé avec le rôle Collaborateur.</p>

        @if (erreur()) {
          <div class="alert alert-error" role="alert">{{ erreur() }}</div>
        }

        <label>Prénom <input formControlName="prenom" /></label>
        @if (formulaire.controls.prenom.touched && formulaire.controls.prenom.invalid) {
          <small class="field-error">Prénom requis</small>
        }

        <label>Nom <input formControlName="nom" /></label>
        @if (formulaire.controls.nom.touched && formulaire.controls.nom.invalid) {
          <small class="field-error">Nom requis</small>
        }

        <label>Email <input type="email" formControlName="email" autocomplete="username" /></label>
        @if (formulaire.controls.email.touched && formulaire.controls.email.invalid) {
          <small class="field-error">Email valide requis</small>
        }

        <label>Mot de passe
          <input type="password" formControlName="motDePasse" autocomplete="new-password" />
        </label>
        @if (formulaire.controls.motDePasse.touched && formulaire.controls.motDePasse.invalid) {
          <small class="field-error">8 caractères minimum</small>
        }

        <button class="btn btn-primary" type="submit" [disabled]="chargement()">
          {{ chargement() ? 'Création…' : "S'inscrire" }}
        </button>
        <p class="muted center">Déjà inscrit ? <a routerLink="/connexion">Se connecter</a></p>
      </form>
    </main>
  `,
})
export class InscriptionComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthentificationService);
  private routeur = inject(Router);

  formulaire = this.fb.nonNullable.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
  });
  erreur = signal('');
  chargement = signal(false);

  valider() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.chargement.set(true);
    this.erreur.set('');
    this.auth.inscrire(this.formulaire.getRawValue()).subscribe({
      next: () => this.routeur.navigateByUrl('/'),
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.chargement.set(false);
      },
    });
  }
}