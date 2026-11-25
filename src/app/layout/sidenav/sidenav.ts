import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

interface NavItem {
  label: string;
  route: string;
  exact: boolean;
  /** Nombre kebab del icono Lucide (registrado en app.config.ts). */
  icono: string;
}

interface NavGrupo {
  titulo: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
  private readonly layout = inject(LayoutService);
  protected readonly auth = inject(AuthService);

  /** `true` cuando el menú lateral está en modo rail (solo iconos). */
  readonly collapsed = this.layout.sidenavCollapsed;

  // TODO(plan-23): reemplazar por la versión real cuando exista fuente (package.json está en 0.0.0).
  readonly version = 'v2.0';

  readonly grupos: NavGrupo[] = [
    {
      titulo: 'Operación',
      items: [
        { label: 'Inicio', route: '/', exact: true, icono: 'layout-dashboard' },
        { label: 'Agenda', route: '/citas', exact: false, icono: 'calendar-days' },
        { label: 'Recordatorios', route: '/recordatorios', exact: false, icono: 'bell' },
      ],
    },
    {
      titulo: 'Clínica',
      items: [
        { label: 'Pacientes', route: '/pacientes', exact: false, icono: 'users' },
        { label: 'Historial', route: '/historial', exact: false, icono: 'clipboard-list' },
        { label: 'Plantillas', route: '/plantillas', exact: false, icono: 'file-text' },
      ],
    },
    {
      titulo: 'Gestión',
      items: [
        { label: 'Tratamientos', route: '/tratamientos', exact: false, icono: 'stethoscope' },
        { label: 'Reportes', route: '/reportes', exact: false, icono: 'bar-chart-3' },
      ],
    },
  ];
}
