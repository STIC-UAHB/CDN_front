import { Component, signal, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-statistiques',
  imports: [DecimalPipe],
  templateUrl: './admin-statistiques.html',
  styleUrl: './admin-statistiques.css',
})
export class AdminStatistiquesComponent implements OnInit {
  private api = inject(ApiService);

  data   = signal<any>(null);
  private chartJour:   Chart | null = null;
  private chartCanal:  Chart | null = null;
  private chartStatut: Chart | null = null;

  @ViewChild('jourCanvas')   jourCanvas!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('canalCanvas')  canalCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('statutCanvas') statutCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.api.adminStatistiques().subscribe({
      next: (d) => {
        this.data.set(d);
        setTimeout(() => this.dessinerGraphiques(), 0);
      },
    });
  }

  get canalEntries() {
    const c = this.data()?.par_canal;
    if (!c) return [];
    return Object.entries(c).map(([k, v]) => ({ key: k, value: v as number }));
  }

  get totalCanal() {
    return this.canalEntries.reduce((s, e) => s + e.value, 0);
  }

  canalPct(v: number) {
    return this.totalCanal > 0 ? Math.round((v / this.totalCanal) * 100) : 0;
  }

  private dessinerGraphiques() {
    const d = this.data();
    if (!d) return;

    // Graphique par jour
    if (this.jourCanvas?.nativeElement) {
      if (this.chartJour) this.chartJour.destroy();
      this.chartJour = new Chart(this.jourCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: d.par_jour.map((x: any) => x.date),
          datasets: [{
            label: 'Notifications',
            data: d.par_jour.map((x: any) => x.total),
            borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.08)',
            borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { maxTicksLimit: 10 } } },
        },
      });
    }

    // Graphique par statut
    if (this.statutCanvas?.nativeElement) {
      if (this.chartStatut) this.chartStatut.destroy();
      const statuts = d.par_statut as Record<string, number>;
      const COLORS: Record<string, string> = { envoye: '#10b981', echoue: '#ef4444', en_attente: '#f59e0b' };
      this.chartStatut = new Chart(this.statutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statuts),
          datasets: [{
            data: Object.values(statuts),
            backgroundColor: Object.keys(statuts).map(k => COLORS[k] ?? '#94a3b8'),
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
        },
      });
    }
  }
}
