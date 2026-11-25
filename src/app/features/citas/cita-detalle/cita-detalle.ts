import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Cita } from '../../../core/services/cita.service';
import { DrawerComponent } from '../../../shared/components/drawer/drawer';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { fechaHoraBogota } from '../funciones/agenda.funcion';

type EstadoAccion = 'confirmada' | 'atendida' | 'no_asistio';

const BTN = 'min-h-10 px-3 rounded-lg text-sm font-semibold border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ';

/** Detalle de una cita en Drawer con acciones; la lógica vive en el padre (Agenda). */
@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [DrawerComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer [(abierto)]="abierto" titulo="Detalle de la cita">
      @if (cita(); as c) {
        <dl class="space-y-4 text-sm">
          <div><dt class="text-xs font-semibold uppercase text-slate-500">Paciente</dt>
            <dd class="text-base font-semibold text-slate-900">{{ c.paciente?.nombre_completo }}</dd></div>
          <div><dt class="text-xs font-semibold uppercase text-slate-500">Fecha y hora</dt>
            <dd class="text-slate-800 capitalize">{{ fechaHora(c.fecha_hora) }}</dd></div>
          <div><dt class="text-xs font-semibold uppercase text-slate-500">Duración</dt>
            <dd class="text-slate-800">{{ c.duracion_minutos }} min</dd></div>
          <div><dt class="text-xs font-semibold uppercase text-slate-500">Tratamiento</dt>
            <dd class="text-slate-800">{{ c.tipo_tratamiento || '—' }}</dd></div>
          <div><dt class="text-xs font-semibold uppercase text-slate-500">Estado</dt>
            <dd class="mt-1"><app-status-badge [estado]="c.estado" /></dd></div>
          <div><dt class="text-xs font-semibold uppercase text-slate-500">Notas</dt>
            <dd class="text-slate-800 whitespace-pre-line">{{ c.notas || 'Sin notas' }}</dd></div>
        </dl>
      }
      <div pie class="flex flex-wrap gap-2">
        @if (cita(); as c) {
          <button type="button" (click)="editar.emit(c)" [class]="btn + 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'">Editar</button>
          @for (a of acciones; track a.estado) {
            <button type="button" (click)="cambiarEstado.emit({ cita: c, estado: a.estado })" [disabled]="c.estado === a.estado" [class]="btn + 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50'">{{ a.label }}</button>
          }
          @if (c.paciente?.telefono) {
            <button type="button" (click)="whatsapp.emit({ cita: c, tipo: 'confirmacion' })" [class]="btn + 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'">WhatsApp: confirmación</button>
            <button type="button" (click)="whatsapp.emit({ cita: c, tipo: 'recordatorio' })" [class]="btn + 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'">WhatsApp: recordatorio</button>
          }
          @if (c.estado !== 'cancelada') {
            <button type="button" (click)="cancelar.emit(c)" [class]="btn + 'bg-white text-red-700 border-red-300 hover:bg-red-50'">Cancelar cita</button>
          }
        }
      </div>
    </app-drawer>
  `,
})
export class CitaDetalleComponent {
  readonly cita = input<Cita | null>(null);
  readonly abierto = model(false);
  readonly editar = output<Cita>();
  readonly cambiarEstado = output<{ cita: Cita; estado: EstadoAccion }>();
  readonly cancelar = output<Cita>();
  readonly whatsapp = output<{ cita: Cita; tipo: 'confirmacion' | 'recordatorio' }>();

  protected readonly btn = BTN;
  protected readonly fechaHora = fechaHoraBogota;
  protected readonly acciones: { estado: EstadoAccion; label: string }[] = [
    { estado: 'confirmada', label: 'Confirmar' },
    { estado: 'atendida', label: 'Atendida' },
    { estado: 'no_asistio', label: 'No asistió' },
  ];
}
