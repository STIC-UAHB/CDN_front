import { Component, signal, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-stats',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css',
})
export class AdminStatsComponent implements OnInit {
  private api = inject(ApiService);

  data   = signal<any>(null);
  erreur = signal(false);
  private chart: Chart | null = null;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.api.adminStats().subscribe({
      next: (d) => {
        this.data.set(d);
        setTimeout(() => this.dessinerGraphique(), 0);
      },
      error: () => this.erreur.set(true),
    });
  }

  private dessinerGraphique() {
    const d = this.data();
    if (!d || !this.chartCanvas?.nativeElement) return;
    if (this.chart) this.chart.destroy();

    const labels = d.par_jour.map((x: any) => x.date);
    const values = d.par_jour.map((x: any) => x.total);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Notifications',
          data: values,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.08)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: { ticks: { maxTicksLimit: 10 } },
        },
      },
    });
  }

  statutClass(s: string) {
    return s === 'envoye' ? 'dot-green' : s === 'echoue' ? 'dot-red' : 'dot-amber';
  }
}
