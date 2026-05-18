import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-admin-clients',
  imports: [DatePipe],
  templateUrl: './admin-clients.html',
  styleUrl: './admin-clients.css',
})
export class AdminClientsComponent implements OnInit {
  private api = inject(ApiService);

  clients      = signal<any[]>([]);
  recherche    = signal('');
  filtreStatut = signal('');
  filtrePlan   = signal('');

  editId      = signal<number | null>(null);
  editQuota   = signal(0);
  editStatut  = signal('actif');
  showApiKey  = signal(false);
  message     = signal('');

  clientsFiltres = computed(() => {
    let list = this.clients();
    const r = this.recherche().toLowerCase();
    if (r) list = list.filter(c =>
      c.nom.toLowerCase().includes(r) || c.email_contact.toLowerCase().includes(r)
    );
    if (this.filtreStatut()) list = list.filter(c => c.statut === this.filtreStatut());
    if (this.filtrePlan())   list = list.filter(c => (c.plan || '') === this.filtrePlan());
    return list;
  });

  editClient = computed(() =>
    this.clients().find(c => c.id === this.editId()) ?? null
  );

  ngOnInit() { this.charger(); }

  charger() {
    this.api.adminClients().subscribe({ next: (list) => this.clients.set(list) });
  }

  ouvrir(c: any) {
    this.editId.set(c.id);
    this.editQuota.set(c.quota_mensuel);
    this.editStatut.set(c.statut);
    this.showApiKey.set(false);
    this.message.set('');
  }

  fermer() { this.editId.set(null); }

  sauvegarder() {
    const id = this.editId();
    if (!id) return;
    this.api.adminUpdateClient(id, {
      quota_mensuel: this.editQuota(),
      statut: this.editStatut(),
    }).subscribe({
      next: () => {
        this.message.set('Mis à jour.');
        this.charger();
        setTimeout(() => this.fermer(), 800);
      },
    });
  }

  plans(): string[] {
    const set = new Set(this.clients().map(c => c.plan).filter(Boolean));
    return Array.from(set);
  }
}
