import { Component, signal, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type Step = 'register' | 'login' | 'canal' | 'otp' | 'forgot' | 'forgot-otp' | 'new-password';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit, OnDestroy {
  private http        = inject(HttpClient);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private api         = 'http://localhost:8000/api';

  step         = signal<Step>('register');
  showRegPwd   = signal(false);
  showLoginPwd = signal(false);

  email     = signal('');
  telephone = signal('');
  canal     = signal<'email' | 'sms' | ''>('');
  otpDigits = signal(['', '', '', '', '', '']);
  timer     = signal(120);
  timerLabel= signal('2:00');
  erreur    = signal('');
  loading   = signal(false);

  private timerInterval: any = null;

  allerAccueil() { this.router.navigate(['/']); }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'login') this.step.set('login');
    });
  }

  goTo(s: Step) {
    this.erreur.set('');
    this.step.set(s);
  }

  // ── ÉTAPE 1 — Inscription ──
  register(nom: string, email: string, tel: string, pwd: string, pwdConf: string) {
    if (!nom || !email || !tel || !pwd) {
      this.erreur.set('Tous les champs obligatoires doivent être remplis.');
      return;
    }
    if (pwd !== pwdConf) {
      this.erreur.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);
    this.erreur.set('');

    this.http.post<any>(`${this.api}/register`, {
      nom,
      email_contact          : email,
      telephone              : tel,
      password               : pwd,
      password_confirmation  : pwdConf,
    }).subscribe({
      next: (res) => {
        this.email.set(res.email);
        this.telephone.set(res.telephone);
        this.loading.set(false);
        this.goTo('canal');
      },
      error: (err) => {
        this.loading.set(false);
        this.erreur.set(err.error?.message || 'Erreur lors de l\'inscription.');
      }
    });
  }

  // ── ÉTAPE 2 — Envoyer OTP ──
  choisirCanal(c: 'email' | 'sms') {
    this.canal.set(c);
    this.loading.set(true);
    this.erreur.set('');

    this.http.post<any>(`${this.api}/send-otp`, {
      email: this.email(),
      canal: c,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.goTo('otp');
        this.startTimer();
      },
      error: (err) => {
        this.loading.set(false);
        this.erreur.set(err.error?.message || 'Erreur lors de l\'envoi du code.');
      }
    });
  }

  // ── Renvoyer OTP (même canal ou autre) ──
  renvoyerOtp(c: 'email' | 'sms') {
    this.canal.set(c);
    this.erreur.set('');

    this.http.post<any>(`${this.api}/send-otp`, {
      email: this.email(),
      canal: c,
    }).subscribe({
      next: () => {
        this.otpDigits.set(['', '', '', '', '', '']);
        this.resetTimer();
      },
      error: (err) => {
        this.erreur.set(err.error?.message || 'Erreur lors du renvoi.');
      }
    });
  }

  // ── ÉTAPE 3 — Vérifier OTP ──
  verifierOtp() {
    const code = this.getOtpCode();
    if (code.length < 6) return;

    this.loading.set(true);
    this.erreur.set('');

    this.http.post<any>(`${this.api}/verify-otp`, {
      email: this.email(),
      otp  : code,
    }).subscribe({
      next: () => {
        clearInterval(this.timerInterval);
        this.loading.set(false);
        this.goTo('login');
      },
      error: (err) => {
        this.loading.set(false);
        this.erreur.set(err.error?.erreur || 'Code incorrect ou expiré.');
      }
    });
  }

  // ── CONNEXION ──
  login(email: string, pwd: string) {
    this.loading.set(true);
    this.erreur.set('');

    this.http.post<any>(`${this.api}/login`, {
      email_contact: email,
      password     : pwd,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.authService.setSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.erreur.set(err.error?.erreur || 'Identifiants incorrects.');
      }
    });
  }

  // ── Timer ──
  startTimer() {
    this.timer.set(120);
    this.updateLabel();
    this.timerInterval = setInterval(() => {
      const t = this.timer() - 1;
      this.timer.set(t);
      this.updateLabel();
      if (t <= 0) clearInterval(this.timerInterval);
    }, 1000);
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.startTimer();
  }

  updateLabel() {
    const t = this.timer();
    const m = Math.floor(t / 60);
    const s = t % 60;
    this.timerLabel.set(`${m}:${s.toString().padStart(2, '0')}`);
  }

  // ── OTP input case par case ──
  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val   = input.value.replace(/\D/g, '').slice(-1);
    const digits = [...this.otpDigits()];
    digits[index] = val;
    this.otpDigits.set(digits);
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  getOtpCode() { return this.otpDigits().join(''); }

  maskEmail(e: string) {
    if (!e) return '';
    const [local, domain] = e.split('@');
    return local.slice(0, 4) + '***@' + domain;
  }

  maskPhone(p: string) {
    if (!p) return '';
    return p.slice(0, 5) + '****' + p.slice(-2);
  }

  // ── MOT DE PASSE OUBLIÉ ──
  forgotEmail = signal('');
  newPwd      = signal('');
  newPwdConf  = signal('');

  demanderReset(email: string) {
    if (!email) { this.erreur.set('Saisissez votre email.'); return; }
    this.loading.set(true);
    this.erreur.set('');
    this.forgotEmail.set(email);
    this.email.set(email);

    this.http.post<any>(`${this.api}/send-otp`, { email, canal: 'email' })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.goTo('forgot-otp');
          this.startTimer();
        },
        error: (err) => {
          this.loading.set(false);
          this.erreur.set(err.error?.message || 'Email introuvable.');
        }
      });
  }

  verifierOtpReset() {
    const code = this.getOtpCode();
    if (code.length < 6) return;
    // On garde le code OTP en mémoire et on passe à la saisie du mot de passe
    // La vérification réelle se fait dans reset-password
    clearInterval(this.timerInterval);
    this.erreur.set('');
    this.goTo('new-password');
  }

  reinitialiserPassword(pwd: string, pwdConf: string) {
    if (!pwd || pwd !== pwdConf) {
      this.erreur.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.loading.set(true);
    this.erreur.set('');

    this.http.post<any>(`${this.api}/reset-password`, {
      email                : this.forgotEmail(),
      otp                  : this.getOtpCode(),
      password             : pwd,
      password_confirmation: pwdConf,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.otpDigits.set(['', '', '', '', '', '']);
        this.goTo('login');
      },
      error: (err) => {
        this.loading.set(false);
        this.erreur.set(err.error?.erreur || 'Code invalide ou expiré.');
      }
    });
  }

  ngOnDestroy() { clearInterval(this.timerInterval); }
}
