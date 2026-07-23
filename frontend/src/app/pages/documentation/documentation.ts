import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-documentation',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './documentation.html',
  styleUrl: './documentation.css',
})
export class Documentation {
  private authService = inject(AuthService);
  sidebarOuverte = signal(false);

  // Si l'utilisateur est connecté, "retour au site" ramène au dashboard plutôt qu'à l'accueil public.
  retourUrl = this.authService.isLoggedIn() ? '/dashboard' : '/';

  constructor(router: Router) {
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.sidebarOuverte.set(false);
        window.scrollTo(0, 0);
      });
  }

  toggleSidebar() {
    this.sidebarOuverte.update((v) => !v);
  }
}
