import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { Cita } from '../../core/services/cita.service';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CardComponent } from '../../shared/components/card/card';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, DatePipe, CopCurrencyPipe, CardComponent, StatusBadgeComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioComponent {
  private readonly profileService = inject(ProfileService);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  readonly profile = this.profileService.profile;
  readonly loading = signal(true);

  readonly citasHoy = signal<Cita[]>([]);
  readonly proximas7 = signal(0);
  readonly pacientesNuevosMes = signal(0);
  readonly saldoPendiente = signal(0);

  readonly firstName = computed(() => this.profile()?.nombre_completo?.trim().split(/\s+/)[0] ?? '');

  readonly todayLabel = computed(() =>
    new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  );

  constructor() {
    this.loadDashboard();
  }

  private async loadDashboard(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.dashboardService.getResumen();
      this.citasHoy.set(data.citasHoy);
      this.proximas7.set(data.proximas7);
      this.pacientesNuevosMes.set(data.pacientesNuevosMes);
      this.saldoPendiente.set(data.saldoPendiente);
    } catch (err) {
      console.error('Error cargando el dashboard:', err);
    } finally {
      this.loading.set(false);
    }
  }

  irACita(): void {
    this.router.navigate(['/citas']);
  }
}
