import { Component, signal, OnInit, inject } from '@angular/core';
import { ApiService } from '../../../../services/api.service';

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
  private apiService = inject(ApiService);

  regles     = signal<Regle[]>([]);
  showForm   = signal(false);
  loading    = signal(false);
  erreur     = signal('');
  succes     = signal('');
  editingId  = signal<number | null>(null);
  form       = signal({ event_code: '', message_template: '', description: '', sms_actif: false, email_actif: false, push_actif: false, socket_actif: false, non_desactivable: false });

  templatePlaceholder = 'ex: Bonjour {nom}, votre quota est à {valeur}%';
  get btnLabel() { return this.loading() ? 'Enregistrement...' : (this.editingId() ? 'Mettre à jour' : 'Enregistrer'); }
  get formTitle() { return this.editingId() ? 'Modifier la règle' : 'Nouvelle règle'; }

  ngOnInit() { this.charger(); }

  charger() {
    this.apiService.getRegles()
      .subscribe({ next: (data) => this.regles.set(data), error: () => {} });
  }

  setField(field: string, value: any) {
    this.form.set({ ...this.form(), [field]: value });
  }

  enregistrer() {
    const f = this.form();
    if (!f.event_code || !f.message_template) {
      this.erreur.set('Le code événement et le message sont obligatoires.');
      return;
    }
    this.loading.set(true);
    this.erreur.set('');
    this.succes.set('');

    const id = this.editingId();
    const requete = id ? this.apiService.updateRegle(id, f) : this.apiService.createRegle(f);

    requete.subscribe({
      next: (regle) => {
        if (id) {
          this.regles.set(this.regles().map(r => r.id === id ? regle : r));
          this.succes.set('Règle mise à jour avec succès.');
        } else {
          this.regles.set([...this.regles(), regle]);
          this.succes.set('Règle créée avec succès.');
        }
        this.annulerForm();
        this.loading.set(false);
        setTimeout(() => this.succes.set(''), 1500);
      },
      error: (err) => {
        this.erreur.set(err.error?.message || 'Erreur lors de l\'enregistrement.');
        this.loading.set(false);
      }
    });
  }

  modifier(regle: Regle) {
    this.editingId.set(regle.id);
    this.form.set({
      event_code: regle.event_code,
      message_template: regle.message_template,
      description: regle.description || '',
      sms_actif: regle.sms_actif,
      email_actif: regle.email_actif,
      push_actif: regle.push_actif,
      socket_actif: regle.socket_actif,
      non_desactivable: regle.non_desactivable,
    });
    this.showForm.set(true);
    this.erreur.set('');
    this.succes.set('');
  }

  supprimer(regle: Regle) {
    if (!confirm(`Supprimer la règle "${regle.event_code}" ? Cette action est irréversible.`)) return;

    this.apiService.deleteRegle(regle.id).subscribe({
      next: () => {
        this.regles.set(this.regles().filter(r => r.id !== regle.id));
        this.succes.set('Règle supprimée.');
        setTimeout(() => this.succes.set(''), 1500);
      },
      error: (err) => this.erreur.set(err.error?.message || 'Erreur lors de la suppression.')
    });
  }

  annulerForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.set({ event_code: '', message_template: '', description: '', sms_actif: false, email_actif: false, push_actif: false, socket_actif: false, non_desactivable: false });
  }

  telechargerTemplate() {
    this.apiService.getReglesTemplate().subscribe((blob: any) => {
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
        this.apiService.importRegles(data)
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
