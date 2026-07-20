import { Routes } from '@angular/router';
import { Accueil } from './pages/accueil/accueil';
import { Auth } from './pages/auth/auth';
import { Dashboard } from './pages/dashboard/dashboard';
import { Pricing } from './pages/pricing/pricing';
import { PaymentSuccess } from './pages/payment-success/payment-success';
import { PaymentError } from './pages/payment-error/payment-error';
import { AdminDashboard } from './pages/admin/admin';
import { Documentation } from './pages/documentation/documentation';
import { DocIntroduction } from './pages/documentation/pages/introduction/introduction';
import { DocDemarrage } from './pages/documentation/pages/demarrage/demarrage';
import { DocIntegrationApi } from './pages/documentation/pages/integration-api/integration-api';
import { DocNotifications } from './pages/documentation/pages/notifications/notifications';
import { DocRegles } from './pages/documentation/pages/regles/regles';
import { DocPreferences } from './pages/documentation/pages/preferences/preferences';
import { DocWebsocket } from './pages/documentation/pages/websocket/websocket';
import { DocPush } from './pages/documentation/pages/push/push';
import { DocEscalade } from './pages/documentation/pages/escalade/escalade';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '',                component: Accueil },
  { path: 'auth',            component: Auth },
  { path: 'dashboard',       component: Dashboard,       canActivate: [authGuard] },
  { path: 'pricing',         component: Pricing,         canActivate: [authGuard] },
  { path: 'payment/success', component: PaymentSuccess,  canActivate: [authGuard] },
  { path: 'payment/error',   component: PaymentError,    canActivate: [authGuard] },
  { path: 'admin',           component: AdminDashboard,  canActivate: [authGuard, adminGuard] },
  {
    path: 'documentation',
    component: Documentation,
    children: [
      { path: '',                 redirectTo: 'introduction', pathMatch: 'full' },
      { path: 'introduction',     component: DocIntroduction },
      { path: 'demarrage',        component: DocDemarrage },
      { path: 'integration-api',  component: DocIntegrationApi },
      { path: 'notifications',    component: DocNotifications },
      { path: 'regles',           component: DocRegles },
      { path: 'preferences',      component: DocPreferences },
      { path: 'websocket',        component: DocWebsocket },
      { path: 'push',             component: DocPush },
      { path: 'escalade',         component: DocEscalade },
    ],
  },
];
