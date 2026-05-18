import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminStatsComponent } from './components/admin-stats/admin-stats';
import { AdminClientsComponent } from './components/admin-clients/admin-clients';
import { AdminPaiementsComponent } from './components/admin-paiements/admin-paiements';
import { AdminNotificationsComponent } from './components/admin-notifications/admin-notifications';
import { AdminReglesComponent } from './components/admin-regles/admin-regles';
import { AdminStatistiquesComponent } from './components/admin-statistiques/admin-statistiques';

type Menu = 'stats' | 'clients' | 'paiements' | 'notifications' | 'regles' | 'statistiques';

@Component({
  selector: 'app-admin',
  imports: [
    AdminStatsComponent,
    AdminClientsComponent,
    AdminPaiementsComponent,
    AdminNotificationsComponent,
    AdminReglesComponent,
    AdminStatistiquesComponent,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminDashboard {
  private auth   = inject(AuthService);
  private router = inject(Router);

  activeMenu = signal<Menu>('stats');

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth'], { queryParams: { mode: 'login' } });
  }
}
