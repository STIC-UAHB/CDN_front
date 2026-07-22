import { Component, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { StatsComponent } from './components/stats/stats';
import { NotificationsComponent } from './components/notifications/notifications';
import { ReglesComponent } from './components/regles/regles';
import { SettingsComponent } from './components/settings/settings';

@Component({
  selector: 'app-dashboard',
  imports: [StatsComponent, NotificationsComponent, ReglesComponent, SettingsComponent],
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

  get quotaPct() {
    if (!this.quotaMensuel()) return 0;
    return Math.round((this.quotaUtilise() / this.quotaMensuel()) * 100);
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
