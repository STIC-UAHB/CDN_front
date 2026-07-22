import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api  = environment.apiUrl;

  // ── Auth (public) ──
  register(data: any)        { return this.http.post<any>(`${this.api}/register`, data); }
  sendOtp(data: any)         { return this.http.post<any>(`${this.api}/send-otp`, data); }
  verifyOtp(data: any)       { return this.http.post<any>(`${this.api}/verify-otp`, data); }
  login(data: any)           { return this.http.post<any>(`${this.api}/login`, data); }
  resetPassword(data: any)   { return this.http.post<any>(`${this.api}/reset-password`, data); }

  // ── Client (JWT) ──
  me()                       { return this.http.get<any>(`${this.api}/me`, { headers: this.auth.authHeaders() }); }
  updateProfil(data: any)    { return this.http.put<any>(`${this.api}/me/profil`, data, { headers: this.auth.authHeaders() }); }
  updatePassword(data: any)  { return this.http.put<any>(`${this.api}/me/password`, data, { headers: this.auth.authHeaders() }); }

  // ── Règles (JWT) ──
  getRegles()                { return this.http.get<any[]>(`${this.api}/regles`, { headers: this.auth.authHeaders() }); }
  createRegle(data: any)     { return this.http.post<any>(`${this.api}/regles`, data, { headers: this.auth.authHeaders() }); }
  importRegles(data: any[])  { return this.http.post<any>(`${this.api}/regles/import`, data, { headers: this.auth.authHeaders() }); }
  getReglesTemplate()        { return this.http.get(`${this.api}/regles/template`, { headers: this.auth.authHeaders(), responseType: 'blob' as 'json' }); }

  // ── Notifications (JWT) ──
  getNotifications(page = 1) { return this.http.get<any>(`${this.api}/notifications?page=${page}`, { headers: this.auth.authHeaders() }); }
  getStats()                 { return this.http.get<any>(`${this.api}/stats`, { headers: this.auth.authHeaders() }); }

  // ── Paiement (JWT) ──
  initiatePayment(plan: string) { return this.http.post<any>(`${this.api}/payment/initiate`, { plan }, { headers: this.auth.authHeaders() }); }

  // ── Admin (JWT + is_admin) ──
  adminStats()          { return this.http.get<any>(`${this.api}/admin/stats`, { headers: this.auth.authHeaders() }); }
  adminClients()        { return this.http.get<any[]>(`${this.api}/admin/clients`, { headers: this.auth.authHeaders() }); }
  adminUpdateClient(id: number, data: any) { return this.http.put<any>(`${this.api}/admin/clients/${id}`, data, { headers: this.auth.authHeaders() }); }
  adminPaiements()      { return this.http.get<any[]>(`${this.api}/admin/paiements`, { headers: this.auth.authHeaders() }); }
  adminNotifications(page = 1, canal = '', statut = '') {
    const params = new URLSearchParams({ page: String(page) });
    if (canal)  params.set('canal', canal);
    if (statut) params.set('statut', statut);
    return this.http.get<any>(`${this.api}/admin/notifications?${params}`, { headers: this.auth.authHeaders() });
  }
  adminRegles()         { return this.http.get<any[]>(`${this.api}/admin/regles`, { headers: this.auth.authHeaders() }); }
  adminStatistiques()   { return this.http.get<any>(`${this.api}/admin/statistiques`, { headers: this.auth.authHeaders() }); }
}
