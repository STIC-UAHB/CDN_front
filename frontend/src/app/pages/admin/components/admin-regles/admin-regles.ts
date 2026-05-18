import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-admin-regles',
  imports: [],
  templateUrl: './admin-regles.html',
  styleUrl: './admin-regles.css',
})
export class AdminReglesComponent implements OnInit {
  private api = inject(ApiService);

  regles       = signal<any[]>([]);
  recherche    = signal('');
  filtreClient = signal('');

  reglesFiltrees = computed(() => {
    let list = this.regles();
    const r = this.recherche().toLowerCase();
    if (r) list = list.filter(x => x.event_code.toLowerCase().includes(r));
    if (this.filtreClient()) list = list.filter(x => x.client_id === +this.filtreClient());
    return list;
  });

  clients = computed(() => {
    const seen = new Set<number>();
    return this.regles()
      .filter(r => r.client && !seen.has(r.client_id) && seen.add(r.client_id))
      .map(r => ({ id: r.client_id, nom: r.client.nom }));
  });

  ngOnInit() {
    this.api.adminRegles().subscribe({ next: (list) => this.regles.set(list) });
  }

  canaux(r: any): string {
    const c = [];
    if (r.sms_actif)    c.push('SMS');
    if (r.email_actif)  c.push('Email');
    if (r.push_actif)   c.push('Push');
    if (r.socket_actif) c.push('Socket');
    return c.join(', ') || '—';
  }
}
