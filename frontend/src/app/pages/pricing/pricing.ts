import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-pricing',
  imports: [DecimalPipe],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class Pricing {
  private router     = inject(Router);
  private authService = inject(AuthService);
  private apiService  = inject(ApiService);

  loading    = signal<string>('');
  erreur     = signal('');
  planActuel = signal(this.authService.getPlan());

  plans = [
    { id: 'starter',  nom: 'Starter',  prix: 100,   quota: 1000,  desc: 'Idéal pour démarrer',                  color: '#6366f1' },
    { id: 'pro',      nom: 'Pro',      prix: 15000,  quota: 5000,  desc: 'Pour les applications en croissance',  color: '#0ea5e9', badge: 'Populaire' },
    { id: 'business', nom: 'Business', prix: 35000,  quota: 20000, desc: 'Pour les grandes applications',        color: '#10b981' },
  ];

  payer(plan: string) {
    this.loading.set(plan);
    this.erreur.set('');

    this.apiService.initiatePayment(plan)
      .subscribe({
        next: (res) => { window.location.href = res.payment_url; },
        error: (err) => {
          this.loading.set('');
          this.erreur.set(err.error?.message || 'Erreur lors de l\'initiation du paiement.');
        }
      });
  }

  retourDashboard() { this.router.navigate(['/dashboard']); }
}
