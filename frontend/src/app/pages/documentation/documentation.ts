import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-documentation',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './documentation.html',
  styleUrl: './documentation.css',
})
export class Documentation {
  sidebarOuverte = signal(false);

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
