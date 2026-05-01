import { Component, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stats',
  imports: [DecimalPipe],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class StatsComponent {
  quotaUtilise = input.required<number>();
  quotaMensuel = input.required<number>();
  quotaPct     = input.required<number>();
  nom          = input.required<string>();
  apiKey       = input.required<string>();

  showApiKey = signal(false);

  goToApiKey = output<void>();

  copyKey() {
    navigator.clipboard.writeText(this.apiKey());
  }
}
