import { Component, input, output, signal, inject, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent implements OnInit {
  nom   = input.required<string>();
  email = input.required<string>();

  nomUpdated = output<string>();

  private apiService = inject(ApiService);

  activeTab = signal('profil');

  profilForm    = signal({ nom: '', email_contact: '' });
  profilLoading = signal(false);
  profilErreur  = signal('');
  profilSucces  = signal('');

  pwForm    = signal({ ancien_password: '', password: '', password_confirmation: '' });
  pwLoading = signal(false);
  pwErreur  = signal('');
  pwSucces  = signal('');

  ngOnInit() {
    this.profilForm.set({ nom: this.nom(), email_contact: this.email() });
  }

  setProfilField(field: string, value: string) {
    this.profilForm.set({ ...this.profilForm(), [field]: value });
  }

  setPwField(field: string, value: string) {
    this.pwForm.set({ ...this.pwForm(), [field]: value });
  }

  sauvegarderProfil() {
    this.profilLoading.set(true);
    this.profilErreur.set('');
    this.profilSucces.set('');

    this.apiService.updateProfil(this.profilForm())
      .subscribe({
        next: (res) => {
          this.profilSucces.set('Profil mis à jour avec succès.');
          this.nomUpdated.emit(res.nom);
          this.profilLoading.set(false);
        },
        error: (err) => {
          this.profilErreur.set(err.error?.message || 'Erreur lors de la mise à jour.');
          this.profilLoading.set(false);
        }
      });
  }

  changerPassword() {
    const f = this.pwForm();
    if (f.password !== f.password_confirmation) {
      this.pwErreur.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.pwLoading.set(true);
    this.pwErreur.set('');
    this.pwSucces.set('');

    this.apiService.updatePassword(f)
      .subscribe({
        next: (res) => {
          this.pwSucces.set(res.message);
          this.pwForm.set({ ancien_password: '', password: '', password_confirmation: '' });
          this.pwLoading.set(false);
        },
        error: (err) => {
          const details = err.error?.details;
          if (details?.ancien_password) {
            this.pwErreur.set(details.ancien_password[0]);
          } else {
            this.pwErreur.set(err.error?.message || 'Erreur lors du changement.');
          }
          this.pwLoading.set(false);
        }
      });
  }
}
