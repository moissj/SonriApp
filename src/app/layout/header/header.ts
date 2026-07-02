import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly layout = inject(LayoutService);

  /** Estado del menú desplegable del avatar */
  readonly menuOpen = signal(false);

  /** Estado colapsado del menú lateral (modo rail) */
  readonly sidenavCollapsed = this.layout.sidenavCollapsed;

  /** Perfil del odontólogo autenticado */
  readonly profile = this.profileService.profile;

  /** Correo del usuario autenticado */
  readonly email = computed(() => this.auth.user()?.email ?? '');

  /** Título de la página según la ruta activa */
  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.resolveTitle()),
    ),
    { initialValue: this.resolveTitle() },
  );

  /** Nombre a mostrar (nombre completo o el correo como respaldo) */
  readonly displayName = computed(
    () => this.profile()?.nombre_completo?.trim() || this.email() || 'Mi cuenta',
  );

  /** Iniciales calculadas a partir del nombre del usuario */
  readonly initials = computed(() => {
    const name = this.profile()?.nombre_completo?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      const first = parts[0]?.[0] ?? '';
      const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (first + last).toUpperCase();
    }
    const email = this.email();
    return email ? email[0].toUpperCase() : '?';
  });

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  toggleSidenav(): void {
    this.layout.toggleSidenav();
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  async logout(): Promise<void> {
    this.closeMenu();
    await this.auth.logout();
  }

  /** Cerrar el menú al hacer clic fuera de él */
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  /** Cerrar el menú con la tecla Escape */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  private resolveTitle(): string {
    let route = this.activatedRoute.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data['title'] ?? 'Panel de inicio';
  }
}
