import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

interface MasItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  private readonly auth = inject(AuthService);

  readonly isSuperAdmin = this.auth.isSuperAdmin;
  readonly sheetOpen = signal(false);

  /** Secciones adicionales accesibles desde el botón "Más" (iconos Lucide) */
  readonly masItems: MasItem[] = [
    { label: 'Recordatorios', route: '/recordatorios', icon: 'bell' },
    { label: 'Reportes', route: '/reportes', icon: 'bar-chart-3' },
    { label: 'Tratamientos', route: '/tratamientos', icon: 'clipboard-list' },
    { label: 'Plantillas', route: '/plantillas', icon: 'message-circle' },
    { label: 'Mi perfil', route: '/perfil', icon: 'circle-user' },
  ];

  toggleSheet(): void {
    this.sheetOpen.update((v) => !v);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
  }

  async logout(): Promise<void> {
    this.closeSheet();
    await this.auth.logout();
  }
}
