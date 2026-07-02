import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  PresupuestoService,
  Presupuesto,
  PresupuestoItem,
  DescuentoTipo,
  EstadoPresupuesto,
} from '../../../../core/services/presupuesto.service';
import { TratamientoService, Tratamiento } from '../../../../core/services/tratamiento.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { WhatsappService, PacienteMensaje } from '../../../../core/services/whatsapp.service';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';
import { CardComponent } from '../../../../shared/components/card/card';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-presupuestos',
  standalone: true,
  imports: [FormsModule, DatePipe, CopCurrencyPipe, CardComponent, EmptyStateComponent],
  templateUrl: './presupuestos.html',
  styleUrl: './presupuestos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresupuestosComponent implements OnInit {
  private readonly presupuestoService = inject(PresupuestoService);
  private readonly tratamientoService = inject(TratamientoService);
  private readonly profileService = inject(ProfileService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly cop = new CopCurrencyPipe();

  readonly pacienteId = input.required<string>();
  readonly paciente = input.required<PacienteMensaje>();

  /** Notifica cambios que afectan la facturación (para refrescar el resumen de pagos) */
  readonly cambio = output<void>();

  readonly presupuestos = signal<Presupuesto[]>([]);
  readonly catalogo = signal<Tratamiento[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // --- Constructor del presupuesto ---
  readonly showBuilder = signal(false);
  readonly lineas = signal<PresupuestoItem[]>([]);
  readonly descuentoTipo = signal<DescuentoTipo>('ninguno');
  readonly descuentoValor = signal<number>(0);

  readonly subtotal = computed(() =>
    this.lineas().reduce((sum, l) => sum + (l.precio || 0) * (l.cantidad || 1), 0)
  );

  readonly descuentoMonto = computed(() => {
    const sub = this.subtotal();
    const val = this.descuentoValor() || 0;
    if (this.descuentoTipo() === 'porcentaje') return Math.round((sub * val) / 100);
    if (this.descuentoTipo() === 'monto') return Math.min(val, sub);
    return 0;
  });

  readonly total = computed(() => Math.max(0, this.subtotal() - this.descuentoMonto()));

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [presupuestos, catalogo] = await Promise.all([
        this.presupuestoService.getPresupuestos(this.pacienteId()),
        this.tratamientoService.getTratamientos(true),
      ]);
      this.presupuestos.set(presupuestos);
      this.catalogo.set(catalogo);
    } catch (err) {
      console.error('Error cargando presupuestos:', err);
      this.error.set('No se pudieron cargar los presupuestos.');
    } finally {
      this.loading.set(false);
    }
  }

  toggleBuilder(): void {
    this.showBuilder.update((v) => !v);
    if (!this.showBuilder()) this.resetBuilder();
  }

  private resetBuilder(): void {
    this.lineas.set([]);
    this.descuentoTipo.set('ninguno');
    this.descuentoValor.set(0);
  }

  /** Agrega una línea desde el catálogo */
  agregarDeCatalogo(tratamientoId: string): void {
    const t = this.catalogo().find((x) => x.id === tratamientoId);
    if (!t) return;
    this.lineas.update((prev) => [
      ...prev,
      { tratamiento_id: t.id, nombre: t.nombre, precio: t.precio_base, cantidad: 1 },
    ]);
  }

  quitarLinea(index: number): void {
    this.lineas.update((prev) => prev.filter((_, i) => i !== index));
  }

  actualizarPrecio(index: number, valor: number): void {
    this.lineas.update((prev) => prev.map((l, i) => (i === index ? { ...l, precio: Number(valor) || 0 } : l)));
  }

  actualizarCantidad(index: number, valor: number): void {
    const cant = Math.max(1, Number(valor) || 1);
    this.lineas.update((prev) => prev.map((l, i) => (i === index ? { ...l, cantidad: cant } : l)));
  }

  async guardar(): Promise<void> {
    if (this.lineas().length === 0) return;

    this.saving.set(true);
    this.error.set(null);
    try {
      const nuevo = await this.presupuestoService.createPresupuesto(this.pacienteId(), {
        subtotal: this.subtotal(),
        descuento_tipo: this.descuentoTipo(),
        descuento_valor: this.descuentoValor() || 0,
        total: this.total(),
        notas: null,
        items: this.lineas(),
      });
      this.presupuestos.update((prev) => [nuevo, ...prev]);
      this.resetBuilder();
      this.showBuilder.set(false);
    } catch (err) {
      console.error('Error guardando presupuesto:', err);
      this.error.set('No se pudo guardar el presupuesto.');
    } finally {
      this.saving.set(false);
    }
  }

  async cambiarEstado(p: Presupuesto, estado: EstadoPresupuesto): Promise<void> {
    try {
      await this.presupuestoService.updateEstado(p.id, estado);
      this.presupuestos.update((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, estado } : x))
      );
      this.cambio.emit();
    } catch (err) {
      console.error('Error cambiando estado:', err);
      this.error.set('No se pudo actualizar el estado.');
    }
  }

  /** Genera y envía el resumen del presupuesto por WhatsApp (vía WhatsappService) */
  enviarPorWhatsApp(p: Presupuesto): void {
    const profile = this.profileService.profile();
    const consultorio = profile?.nombre_consultorio ?? profile?.nombre_completo ?? 'nuestro consultorio';
    const nombre = this.whatsapp.primerNombre(this.paciente().nombre_completo);

    const lineasTxt = (p.items ?? [])
      .map((it) => `• ${it.nombre}${it.cantidad > 1 ? ` x${it.cantidad}` : ''}: ${this.cop.transform(it.precio * it.cantidad)}`)
      .join('\n');

    let texto = `¡Hola ${nombre}! 😊 Este es el resumen de tu presupuesto en ${consultorio}:\n\n${lineasTxt}\n\nSubtotal: ${this.cop.transform(p.subtotal)}`;
    if (p.descuento_tipo !== 'ninguno' && p.descuento_valor > 0) {
      texto += `\nDescuento: -${this.cop.transform(p.subtotal - p.total)}`;
    }
    texto += `\n*Total: ${this.cop.transform(p.total)}*\n\nCualquier duda, escríbenos por este chat.`;

    this.whatsapp.enviarTexto(this.paciente(), texto);
  }

  resumenItems(p: Presupuesto): string {
    return (p.items ?? []).map((it) => it.nombre).join(', ');
  }
}
