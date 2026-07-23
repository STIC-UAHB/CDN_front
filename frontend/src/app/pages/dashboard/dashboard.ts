import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { StatsComponent } from './components/stats/stats';
import { NotificationsComponent } from './components/notifications/notifications';
import { ReglesComponent } from './components/regles/regles';
import { SettingsComponent } from './components/settings/settings';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, StatsComponent, NotificationsComponent, ReglesComponent, SettingsComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private apiService  = inject(ApiService);
  private router      = inject(Router);

  nom                = signal('');
  apiKey             = signal('');
  email              = signal('');
  quotaMensuel       = signal(0);
  quotaUtilise       = signal(0);
  activeMenu         = signal('dashboard');
  subscriptionStatut = signal('inactive');
  plan               = signal('');
  subscriptionFin    = signal<string | null>(null);

  get quotaPct() {
    if (!this.quotaMensuel()) return 0;
    return Math.round((this.quotaUtilise() / this.quotaMensuel()) * 100);
  }

  get planLabel(): string {
    const labels: Record<string, string> = {
      essai: 'Essai gratuit',
      starter: 'Starter',
      pro: 'Pro',
      business: 'Business',
    };
    return labels[this.plan()] || 'Aucun plan';
  }

  get subscriptionFinFormatee(): string {
    const fin = this.subscriptionFin();
    if (!fin) return '';
    return new Date(fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  ngOnInit() {
    this.apiKey.set(this.authService.getApiKey() || '');
    this.nom.set(this.authService.getNom() || 'Mon Application');
    this.quotaMensuel.set(this.authService.getQuotaMensuel());
    this.quotaUtilise.set(this.authService.getQuotaUtilise());
    this.subscriptionStatut.set(this.authService.getSubscriptionStatut());
    this.plan.set(this.authService.getPlan());
    this.rafraichirQuota();
  }

  rafraichirQuota() {
    this.apiService.me().subscribe({
      next: (res) => {
        this.quotaMensuel.set(res.quota_mensuel);
        this.quotaUtilise.set(res.quota_utilise);
        this.nom.set(res.nom);
        this.email.set(res.email_contact);
        this.subscriptionStatut.set(res.subscription_statut ?? 'inactive');
        this.plan.set(res.plan ?? '');
        this.subscriptionFin.set(res.subscription_fin ?? null);
      },
      error: () => {}
    });
  }

  allerPricing() {
    this.router.navigate(['/pricing']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth'], { queryParams: { mode: 'login' } });
  }
}
