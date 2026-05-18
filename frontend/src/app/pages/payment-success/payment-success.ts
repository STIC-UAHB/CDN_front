import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payment-success',
  imports: [],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
})
export class PaymentSuccess implements OnInit {
  private router      = inject(Router);
  private authService = inject(AuthService);
  private apiService  = inject(ApiService);

  ngOnInit() {
    this.apiService.me().subscribe({
      next: (res) => {
        this.authService.updateSubscription(res);
      },
      error: () => {}
    });
  }

  allerDashboard() { this.router.navigate(['/dashboard']); }
}
