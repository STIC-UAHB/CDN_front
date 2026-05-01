import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';

interface Regle {
  id: number;
  event_code: string;
  message_template: string;
  description: string;
  sms_actif: boolean;
  email_actif: boolean;
  push_actif: boolean;
  socket_actif: boolean;
  non_desactivable: boolean;
}

@Component({
  selector: 'app-regles',
  imports: [],
  templateUrl: './regles.html',
  styleUrl: './regles.css',
})
export class ReglesComponent implements OnInit {
  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private api         = 'http://localhost:8000/api';

  regles        = signal<Regle[]>([]);
  showForm      = signal(false);
  loading       = signal(false);
  erreur        = signal('');
  succes        = signal('');
  form          = signal({ event_code: '', message_template: '', description: '', sms_actif: false, email_actif: false, push_actif: false, socket_actif: false, non_desactivable: false });

  templatePlaceholder = 'ex: Bonjour {nom}, votre quota est à {valeur}%';
  get btnLabel() { return this.loading() ? 'Enregistrement...' : 'Enregistrer'; }

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.http.get<Regle[]>(`${this.api}/regles`, { headers: this.authService.authHeaders() })
      .subscribe({ next: (data) => this.regles.set(data), error: () => {} });
  }

  setField(field: string, value: any) {
    this.form.set({ ...this.form(), [field]: value });
  }

  creer() {
    const f = this.form();
    if (!f.event_code || !f.message_template) {
      this.erreur.set('Le code événement et le message sont obligatoires.');
      return;
    }
    this.loading.set(true);
    this.erreur.set('');
    this.succes.set('');

    this.http.post<Regle>(`${this.api}/regles`, f, { headers: this.authService.authHeaders() })
      .subscribe({
        next: (regle) => {
          this.regles.set([...this.regles(), regle]);
          this.succes.set('Règle créée avec succès.');
          this.form.set({ event_code: '', message_template: '', description: '', sms_actif: false, email_actif: false, push_actif: false, socket_actif: false, non_desactivable: false });
          this.loading.set(false);
          setTimeout(() => { this.showForm.set(false); this.succes.set(''); }, 1500);
        },
        error: (err) => {
          this.erreur.set(err.error?.message || 'Erreur lors de la création.');
          this.loading.set(false);
        }
      });
  }

  telechargerTemplate() {
    this.http.get(`${this.api}/regles/template`, {
      headers: this.authService.authHeaders(),
      responseType: 'blob'
    }).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'babelnofif-rules-template.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  importer(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        this.http.post<any>(`${this.api}/regles/import`, data, { headers: this.authService.authHeaders() })
          .subscribe({
            next: (res) => {
              this.succes.set(`${res.imported} règle(s) importée(s) avec succès.`);
              this.charger();
              setTimeout(() => this.succes.set(''), 3000);
            },
            error: (err) => this.erreur.set(err.error?.message || 'Erreur lors de l\'import.')
          });
      } catch {
        this.erreur.set('Fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  }
}
