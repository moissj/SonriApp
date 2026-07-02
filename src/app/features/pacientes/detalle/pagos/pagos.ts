import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PagoService, Pago, MetodoPago, ResumenFacturacion } from '../../../../core/services/pago.service';
import { PresupuestoService, Presupuesto } from '../../../../core/services/presupuesto.service';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';
import { CardComponent } from '../../../../shared/components/card/card';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule, DatePipe, CopCurrencyPipe, CardComponent, EmptyStateComponent],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagosComponent implements OnInit {
  private readonly pagoService = inject(PagoService);
  private readonly presupuestoService = inject(PresupuestoService);

  readonly pacienteId = input.required<string>();

  readonly pagos = signal<Pago[]>([]);
  readonly resumen = signal<ResumenFacturacion>({ facturado: 0, pagado: 0, saldo: 0 });
  readonly presupuestosAceptados = signal<Presupuesto[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly showForm = signal(false);

  // Formulario de pago
  readonly monto = signal<number>(0);
  readonly metodo = signal<MetodoPago>('efectivo');
  readonly presupuestoId = signal<string>('');

  readonly metodos: { value: MetodoPago; label: string }[] = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
  ];

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [pagos, resumen, presupuestos] = await Promise.all([
        this.pagoService.getPagos(this.pacienteId()),
        this.pagoService.getResumen(this.pacienteId()),
        this.presupuestoService.getPresupuestos(this.pacienteId()),
      ]);
      this.pagos.set(pagos);
      this.resumen.set(resumen);
      this.presupuestosAceptados.set(presupuestos.filter((p) => p.estado === 'aceptado'));
    } catch (err) {
      console.error('Error cargando pagos:', err);
      this.error.set('No se pudieron cargar los pagos.');
    } finally {
      this.loading.set(false);
    }
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) this.resetForm();
  }

  private resetForm(): void {
    this.monto.set(0);
    this.metodo.set('efectivo');
    this.presupuestoId.set('');
  }

  async registrar(): Promise<void> {
    const monto = Number(this.monto());
    if (!monto || monto <= 0) {
      this.error.set('Ingresa un monto válido.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    try {
      const pago = await this.pagoService.createPago(this.pacienteId(), {
        monto,
        metodo: this.metodo(),
        presupuesto_id: this.presupuestoId() || null,
      });
      this.pagos.update((prev) => [pago, ...prev]);
      // Recalcular resumen
      this.resumen.set(await this.pagoService.getResumen(this.pacienteId()));
      this.resetForm();
      this.showForm.set(false);
    } catch (err) {
      console.error('Error registrando pago:', err);
      this.error.set('No se pudo registrar el pago.');
    } finally {
      this.saving.set(false);
    }
  }

  metodoLabel(m: MetodoPago): string {
    return this.metodos.find((x) => x.value === m)?.label ?? m;
  }
}
