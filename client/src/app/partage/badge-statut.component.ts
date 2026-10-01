import { Component, computed, input } from '@angular/core';
import { LIBELLES_STATUT, StatutTache } from '../coeur/modeles';

@Component({
  selector: 'app-badge-statut',
  template: `<span [class]="'statut statut-' + statut().toLowerCase()">{{ libelle() }}</span>`,
})
export class BadgeStatutComponent {
  statut = input.required<StatutTache>();
  libelle = computed(() => LIBELLES_STATUT[this.statut()]);
}