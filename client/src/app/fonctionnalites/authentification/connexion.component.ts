import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthentificationService } from '../../coeur/authentification.service';
import { messageErreur } from '../../coeur/erreur-http';

@Component({
  selector: 'app-connexion',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <form class="card auth-card" [formGroup]="formulaire" (ngSubmit)="valider()">
        <h1>RH Taskflow</h1>
        <p class="muted">Connectez-vous pour accéder à vos tâches.</p>

        @if (erreur()) {
          <div class="alert alert-error" role="alert">{{ erreur() }}</div>
        }

        <label>Email
          <input type="email" formControlName="email" autocomplete="username" />
        </label>
        @if (formulaire.controls.email.touched && formulaire.controls.email.invalid) {
          <small class="field-error">Email valide requis</small>
        }

        <label>Mot de passe
          <input type="password" formControlName="motDePasse" autocomplete="current-password" />
        </label>
        @if (formulaire.controls.motDePasse.touched && formulaire.controls.motDePasse.invalid) {
          <small class="field-error">Mot de passe requis</small>
        }

        <button class="btn btn-primary" type="submit" [disabled]="chargement()">
          {{ chargement() ? 'Connexion…' : 'Se connecter' }}
        </button>

        <p class="muted center">Pas de compte ? <a routerLink="/inscription">Créer un compte</a></p>

        <div class="demo">
          <span class="muted">Comptes de démo :</span>
          @for (d of comptesDemo; track d.email) {
            <button type="button" class="btn btn-ghost" (click)="remplir(d.email)">{{ d.libelle }}</button>
          }
        </div>
      </form>
    </main>
  `,
})
export class ConnexionComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthentificationService);
  private routeur = inject(Router);

  formulaire = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });
  erreur = signal('');
  chargement = signal(false);

  comptesDemo = [
    { libelle: 'Collaborateur', email: 'collab1@demo.com' },
    { libelle: 'Manager', email: 'manager@demo.com' },
    { libelle: 'Admin', email: 'admin@demo.com' },
  ];

  remplir(email: string) {
    this.formulaire.setValue({ email, motDePasse: 'Password123!' });
  }

  valider() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.chargement.set(true);
    this.erreur.set('');
    this.auth.connecter(this.formulaire.getRawValue()).subscribe({
      next: () => this.routeur.navigateByUrl('/'),
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.chargement.set(false);
      },
    });
  }
}