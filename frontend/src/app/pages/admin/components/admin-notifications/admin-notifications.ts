import { Component, signal, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-admin-notifications',
  imports: [DatePipe],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.css',
})
export class AdminNotificationsComponent implements OnInit {
  private api = inject(ApiService);

  notifications = signal<any[]>([]);
  meta          = signal<any>(null);
  page          = signal(1);
  filtreCanal   = signal('');
  filtreStatut  = signal('');

  ngOnInit() { this.charger(); }

  charger() {
    this.api.adminNotifications(this.page(), this.filtreCanal(), this.filtreStatut())
      .subscribe({
        next: (res) => {
          this.notifications.set(res.data);
          this.meta.set({ current_page: res.current_page, last_page: res.last_page, total: res.total });
        },
      });
  }

  appliquerFiltres() {
    this.page.set(1);
    this.charger();
  }

  pageSuivante() {
    if (this.page() < this.meta()?.last_page) {
      this.page.set(this.page() + 1);
      this.charger();
    }
  }

  pagePrecedente() {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.charger();
    }
  }

  statutClass(s: string) {
    return s === 'envoye' ? 'st-green' : s === 'echoue' ? 'st-red' : 'st-amber';
  }
}
