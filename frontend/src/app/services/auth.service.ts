import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private TOKEN_KEY  = 'token';
  private API_KEY    = 'api_key';
  private NOM_KEY    = 'nom';
  private QUOTA_M    = 'quota_mensuel';
  private QUOTA_U    = 'quota_utilise';

  setSession(res: any) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.API_KEY,   res.api_key);
    localStorage.setItem(this.NOM_KEY,   res.nom);
    localStorage.setItem(this.QUOTA_M,   res.quota_mensuel);
    localStorage.setItem(this.QUOTA_U,   res.quota_utilise);
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

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type':  'application/json',
    });
  }

  logout() {
    localStorage.clear();
  }
}
