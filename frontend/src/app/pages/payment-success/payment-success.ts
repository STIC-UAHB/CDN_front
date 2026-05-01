import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment-success',
  imports: [],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
})
export class PaymentSuccess implements OnInit {
  private router      = inject(Router);
  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private api         = 'http://localhost:8000/api';

  ngOnInit() {
    this.http.get<any>(`${this.api}/me`, { headers: this.authService.authHeaders() })
      .subscribe({
        next: (res) => {
          localStorage.setItem('subscription_statut', res.subscription_statut ?? 'inactive');
          localStorage.setItem('plan', res.plan ?? '');
          localStorage.setItem('quota_mensuel', String(res.quota_mensuel ?? '0'));
        },
        error: () => {}
      });
  }

  allerDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
