import { Component, signal, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

interface NotifItem {
  id: number;
  user_id: string;
  canal: string;
  destinataire: string;
  message: string;
  statut: string;
  tentatives: number;
  erreur: string | null;
  created_at: string;
  sent_at: string | null;
}

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent implements OnInit {
  private apiService = inject(ApiService);

  notifications = signal<NotifItem[]>([]);
  page          = signal(1);
  lastPage      = signal(1);
  loading       = signal(false);

  ngOnInit() { this.charger(); }

  charger(page = 1) {
    this.loading.set(true);
    this.apiService.getNotifications(page)
      .subscribe({
        next: (res) => {
          this.notifications.set(res.data);
          this.page.set(res.current_page);
          this.lastPage.set(res.last_page);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }
}
