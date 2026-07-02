import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header';
import { SidenavComponent } from './layout/sidenav/sidenav';
import { BottomNavComponent } from './layout/bottom-nav/bottom-nav';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidenavComponent, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  /** Ocultar navegación en rutas de auth y onboarding */
  readonly showLayout = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        return !url.startsWith('/auth') && !url.startsWith('/onboarding');
      }),
    ),
    { initialValue: false },
  );
}
