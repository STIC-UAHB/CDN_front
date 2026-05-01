import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private TOKEN_KEY  = 'token';
  private API_KEY    = 'api_key';
  private NOM_KEY    = 'nom';
  private QUOTA_M    = 'quota_mensuel';
  private QUOTA_U    = 'quota_utilise';
  private PLAN_KEY   = 'plan';
  private SUB_STATUT = 'subscription_statut';

  setSession(res: any) {
    localStorage.setItem(this.TOKEN_KEY,  res.token);
    localStorage.setItem(this.API_KEY,    res.api_key);
    localStorage.setItem(this.NOM_KEY,    res.nom);
    localStorage.setItem(this.QUOTA_M,    res.quota_mensuel);
    localStorage.setItem(this.QUOTA_U,    res.quota_utilise);
    localStorage.setItem(this.PLAN_KEY,   res.plan ?? '');
    localStorage.setItem(this.SUB_STATUT, res.subscription_statut ?? 'inactive');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY);
  }

  getNom(): string {
    return localStorage.getItem(this.NOM_KEY) || '';
  }

  getQuotaMensuel(): number {
    return Number(localStorage.getItem(this.QUOTA_M) || 0);
  }

  getQuotaUtilise(): number {
    return Number(localStorage.getItem(this.QUOTA_U) || 0);
  }

  getPlan(): string { return localStorage.getItem(this.PLAN_KEY) || ''; }
  getSubscriptionStatut(): string { return localStorage.getItem(this.SUB_STATUT) || 'inactive'; }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Pour les endpoints protégés par JWT (auth)
  authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type':  'application/json',
    });
  }

  // Pour les endpoints protégés par api_key (notify, regles, notifications...)
  apiKeyHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getApiKey()}`,
      'Content-Type':  'application/json',
    });
  }

  logout() {
    localStorage.clear();
  }
}
