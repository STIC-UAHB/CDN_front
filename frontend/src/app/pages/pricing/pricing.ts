import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-pricing',
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class Pricing implements OnInit {
  private router     = inject(Router);
  private authService = inject(AuthService);
  private apiService  = inject(ApiService);

  loading             = signal<string>('');
  erreur              = signal('');
  planActuel          = signal(this.authService.getPlan());
  subscriptionStatut  = signal(this.authService.getSubscriptionStatut());
  quotaMensuel        = signal(this.authService.getQuotaMensuel());
  quotaUtilise        = signal(this.authService.getQuotaUtilise());
  subscriptionFin     = signal<string | null>(null);

  get quotaRestant() {
    return Math.max(0, this.quotaMensuel() - this.quotaUtilise());
  }

  get abonnementActif() {
    return this.subscriptionStatut() === 'active';
  }

  get subscriptionFinFormatee(): string {
    const fin = this.subscriptionFin();
    if (!fin) return '';
    return new Date(fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  ngOnInit() {
    this.apiService.me().subscribe({
      next: (res) => {
        this.planActuel.set(res.plan ?? '');
        this.subscriptionStatut.set(res.subscription_statut ?? 'inactive');
        this.quotaMensuel.set(res.quota_mensuel ?? 0);
        this.quotaUtilise.set(res.quota_utilise ?? 0);
        this.subscriptionFin.set(res.subscription_fin ?? null);
      },
      error: () => {}
    });
  }

  quotaApresAchat(quotaPlan: number): number {
    return this.abonnementActif ? quotaPlan + this.quotaRestant : quotaPlan;
  }

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
