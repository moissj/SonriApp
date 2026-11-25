import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { LayoutService } from '../../core/services/layout.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, ButtonComponent],
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
  readonly menuAbierto = signal(false);

  /** Estado colapsado del menú lateral (modo rail) */
  readonly sidenavCollapsed = this.layout.sidenavCollapsed;

  readonly profile = this.profileService.profile;
  readonly email = computed(() => this.auth.user()?.email ?? '');

  /** Título de la ruta activa para el breadcrumb ('' en la raíz) */
  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.resolveTitle()),
    ),
    { initialValue: this.resolveTitle() },
  );

  /** Segmento final del breadcrumb: vacío en la raíz. */
  readonly esRaiz = computed(() => !this.pageTitle() || this.router.url.split('?')[0] === '/');

  // TODO: fuente de notificaciones no leídas (Fase 2)
  readonly hayNoLeidas = signal(false);

  readonly displayName = computed(
    () => this.profile()?.nombre_completo?.trim() || this.email() || 'Mi cuenta',
  );

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
    this.menuAbierto.update((open) => !open);
  }

  toggleSidenav(): void {
    this.layout.toggleSidenav();
  }

  closeMenu(): void {
    this.menuAbierto.set(false);
  }

  async logout(): Promise<void> {
    this.closeMenu();
    await this.auth.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.menuAbierto()) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuAbierto()) this.closeMenu();
  }

  private resolveTitle(): string {
    let route = this.activatedRoute.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data['title'] ?? '';
  }
}
