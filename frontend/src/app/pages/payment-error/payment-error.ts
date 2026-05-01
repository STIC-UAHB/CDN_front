import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-error',
  imports: [],
  templateUrl: './payment-error.html',
  styleUrl: './payment-error.css',
})
export class PaymentError {
  private router = inject(Router);

  reessayer() { this.router.navigate(['/pricing']); }
  allerDashboard() { this.router.navigate(['/dashboard']); }
}
