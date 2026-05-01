import { Routes } from '@angular/router';
import { Accueil } from './pages/accueil/accueil';
import { Auth } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/dashboard';
import { Pricing } from './pages/pricing/pricing';
import { PaymentSuccess } from './pages/payment-success/payment-success';
import { PaymentError } from './pages/payment-error/payment-error';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',                component: Accueil },
  { path: 'auth',            component: Auth },
  { path: 'dashboard',       component: Dashboard,       canActivate: [authGuard] },
  { path: 'pricing',         component: Pricing,         canActivate: [authGuard] },
  { path: 'payment/success', component: PaymentSuccess,  canActivate: [authGuard] },
  { path: 'payment/error',   component: PaymentError,    canActivate: [authGuard] },
];
