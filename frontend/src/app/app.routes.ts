import { Routes } from '@angular/router';
import { Accueil } from './pages/accueil/accueil';
import { Auth } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',          component: Accueil },
  { path: 'auth',      component: Auth },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
];
