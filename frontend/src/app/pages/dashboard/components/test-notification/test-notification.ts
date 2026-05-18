import { Component, signal, input, effect, inject } from '@angular/core';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-test-notification',
  imports: [],
  templateUrl: './test-notification.html',
  styleUrl: './test-notification.css',
})
export class TestNotificationComponent {
  private apiService = inject(ApiService);

  emailRestantsInput = input<number>(2);
  smsRestantsInput   = input<number>(2);

  emailRestants = signal(2);
  smsRestants   = signal(2);
  readonly limite = signal(2);

  emailDest    = signal('');
  smsDest      = signal('');
  loadingEmail = signal(false);
  loadingSms   = signal(false);
  succesEmail  = signal('');
  succesSms    = signal('');
  erreurEmail  = signal('');
  erreurSms    = signal('');

  constructor() {
    effect(() => { this.emailRestants.set(this.emailRestantsInput()); });
    effect(() => { this.smsRestants.set(this.smsRestantsInput()); });
  }

  testerEmail() {
    if (!this.emailDest()) { this.erreurEmail.set('Saisissez un email.'); return; }
    this.loadingEmail.set(true);
    this.erreurEmail.set('');
    this.succesEmail.set('');

    this.apiService.testerNotification('email', this.emailDest())
      .subscribe({
        next: (res) => {
          this.loadingEmail.set(false);
          this.emailRestants.set(res.restants);
          this.succesEmail.set('Email de test envoyé !');
        },
        error: (err) => {
          this.loadingEmail.set(false);
          this.erreurEmail.set(err.error?.message || 'Erreur lors de l\'envoi.');
        }
      });
  }

  testerSms() {
    if (!this.smsDest()) { this.erreurSms.set('Saisissez un numéro.'); return; }
    this.loadingSms.set(true);
    this.erreurSms.set('');
    this.succesSms.set('');

    this.apiService.testerNotification('sms', this.smsDest())
      .subscribe({
        next: (res) => {
          this.loadingSms.set(false);
          this.smsRestants.set(res.restants);
          this.succesSms.set('SMS de test envoyé !');
        },
        error: (err) => {
          this.loadingSms.set(false);
          this.erreurSms.set(err.error?.message || 'Erreur lors de l\'envoi.');
        }
      });
  }
}
