import { Component, signal, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);

  nom           = signal('');
  apiKey        = signal('');
  quotaMensuel  = signal(0);
  quotaUtilise  = signal(0);
  showApiKey    = signal(false);
  activeMenu    = signal('dashboard');

  ngOnInit() {
    this.apiKey.set(this.authService.getApiKey() || '');
    this.nom.set(this.authService.getNom() || 'Mon Application');
    this.quotaMensuel.set(this.authService.getQuotaMensuel());
    this.quotaUtilise.set(this.authService.getQuotaUtilise());
  }

  get quotaPct() {
    if (!this.quotaMensuel()) return 0;
    return Math.round((this.quotaUtilise() / this.quotaMensuel()) * 100);
  }

  copyKey() {
    navigator.clipboard.writeText(this.apiKey());
  }

  logout() {
    this.authService.logout();
    window.location.href = '/auth';
  }
}
