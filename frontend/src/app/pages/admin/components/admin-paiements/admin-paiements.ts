import { Component, signal, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-admin-paiements',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './admin-paiements.html',
  styleUrl: './admin-paiements.css',
})
export class AdminPaiementsComponent implements OnInit {
  private api = inject(ApiService);
  paiements = signal<any[]>([]);

  ngOnInit() {
    this.api.adminPaiements().subscribe({
      next: (list) => this.paiements.set(list),
    });
  }
}
