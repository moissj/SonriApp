import { Injectable, signal } from '@angular/core';

/** Breakpoint que separa la vista móvil de la de escritorio (Tailwind `md`). */
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

/**
 * Estado de UI compartido del layout: colapso del menú lateral y
 * detección reactiva del breakpoint desktop/móvil.
 *
 * Centralizar esto evita duplicar lógica (DRY) entre el header, el
 * sidenav y las vistas que cambian según el tamaño de pantalla.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly _sidenavCollapsed = signal(false);
  private readonly _isDesktop = signal(this.matchesDesktop());

  /** `true` cuando el sidenav está en modo rail (solo iconos). */
  readonly sidenavCollapsed = this._sidenavCollapsed.asReadonly();

  /** `true` cuando el viewport es >= breakpoint `md` (768px). */
  readonly isDesktop = this._isDesktop.asReadonly();

  constructor() {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
      mql.addEventListener('change', (e) => this._isDesktop.set(e.matches));
    }
  }

  /** Alterna entre el modo expandido y el modo rail (solo iconos). */
  toggleSidenav(): void {
    this._sidenavCollapsed.update((collapsed) => !collapsed);
  }

  setSidenavCollapsed(collapsed: boolean): void {
    this._sidenavCollapsed.set(collapsed);
  }

  private matchesDesktop(): boolean {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return true;
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  }
}
