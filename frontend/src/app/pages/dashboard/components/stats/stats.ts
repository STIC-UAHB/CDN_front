import { Component, input, output, signal, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  imports: [DecimalPipe],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class StatsComponent implements OnInit {
  quotaUtilise = input.required<number>();
  quotaMensuel = input.required<number>();
  quotaPct     = input.required<number>();
  nom          = input.required<string>();
  apiKey       = input.required<string>();

  showApiKey = signal(false);
  goToApiKey = output<void>();

  private apiService = inject(ApiService);
  private chart: Chart | null = null;

  statsData  = signal<any>(null);
  statsErreur = signal(false);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.apiService.getStats().subscribe({
      next: (data) => {
        this.statsData.set(data);
        setTimeout(() => this.dessinerGraphique(), 0);
      },
      error: () => this.statsErreur.set(true),
    });
  }

  private dessinerGraphique() {
    const data = this.statsData();
    if (!data || !this.chartCanvas?.nativeElement) return;
    if (this.chart) this.chart.destroy();

    const labels = data.par_jour.map((d: any) => d.date);
    const values = data.par_jour.map((d: any) => d.total);

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

  get canalEntries(): { key: string; value: number }[] {
    const canal = this.statsData()?.par_canal;
    if (!canal) return [];
    return Object.entries(canal).map(([key, value]) => ({ key, value: value as number }));
  }

  canalPct(count: number): number {
    const total = this.statsData()?.total ?? 0;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  copyKey() {
    navigator.clipboard.writeText(this.apiKey());
  }
}
