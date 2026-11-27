import { Component, ChangeDetectionStrategy, input, output, signal, viewChild } from '@angular/core';
import { OdontogramaTipo } from '../../../../../core/services/odontograma.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal';
import { CicloOdontograma } from '../funciones/ciclo-odontograma';
import { ComparacionOdontogramaComponent } from './comparacion-odontograma';

const BTN = 'h-8 px-3.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40';

/** Segmentado Inicial|Final, panel de crear final, banner de cerrado y acciones cerrar/reabrir/comparar. */
@Component({
  selector: 'app-odontograma-ciclo',
  standalone: true,
  imports: [ModalComponent, ConfirmModalComponent, ComparacionOdontogramaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <!-- Segmentado inset: pista gris con pastilla blanca elevada en el activo -->
      <div role="group" aria-label="Tipo de odontograma" class="inline-flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
        @for (t of tipos; track t.id) {
          <button type="button" [attr.aria-pressed]="ciclo().tipoActivo() === t.id" [disabled]="ciclo().ocupado()"
            class="h-7 px-4 text-xs rounded-md font-semibold transition disabled:opacity-40"
            [class]="ciclo().tipoActivo() === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            (click)="elegirTipo.emit(t.id)">{{ t.label }}</button>
        }
      </div>
      <!-- Acciones separadas del segmentado -->
      <div class="flex flex-wrap items-center gap-2">
        @if (ciclo().existeFinal()) { <app-comparacion-odontograma [pacienteId]="pacienteId()" /> }
        @if (ciclo().meta()?.estado === 'borrador') {
          <button type="button" [class]="btn" [disabled]="ciclo().ocupado()" (click)="confirmCerrar.open()">Cerrar odontograma</button>
        }
        <button type="button" [class]="btn" disabled title="Próximamente">Enviar a presupuesto (próximamente)</button>
      </div>
    </div>

    @if (ciclo().cerrado()) {
      <div role="status" class="flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <span><strong>Solo lectura.</strong> Odontograma cerrado el {{ ciclo().fechaCierre() }}. Reabrir para editar.</span>
        <button type="button" [class]="btn" [disabled]="ciclo().ocupado()" (click)="abrirReabrir()">Reabrir</button>
      </div>
    }

    @if (ciclo().necesitaCrear()) {
      <section aria-labelledby="crear-final" class="rounded-xl border border-primary-200 bg-primary-50 p-3 space-y-2">
        <h4 id="crear-final" class="text-sm font-semibold text-gray-800">Crear odontograma final</h4>
        <p class="text-xs text-gray-600">Aún no existe el odontograma final de este paciente. Elige cómo empezar.</p>
        <div class="flex flex-wrap gap-2">
          <button type="button" [class]="btn" [disabled]="ciclo().ocupado()" (click)="ciclo().crear(true)">Copiar del inicial</button>
          <button type="button" [class]="btn" [disabled]="ciclo().ocupado()" (click)="ciclo().crear(false)">En blanco</button>
        </div>
      </section>
    }

    <app-confirm-modal #confirmCerrar title="Cerrar odontograma"
      message="Al cerrarlo quedará en solo lectura hasta que se reabra con un motivo. ¿Continuar?"
      confirmText="Cerrar" (confirm)="ciclo().cerrar()" />

    <app-modal #modalReabrir title="Reabrir odontograma">
      <form class="space-y-3" (submit)="$event.preventDefault(); enviarReabrir()">
        <label for="motivo-reabrir" class="block text-sm text-gray-700">Motivo de la reapertura (obligatorio)</label>
        <textarea #campo id="motivo-reabrir" rows="3" class="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          (input)="motivo.set(campo.value)"></textarea>
        <div class="flex justify-end gap-2">
          <button type="button" [class]="btn" (click)="modalReabrir.close()">Cancelar</button>
          <button type="submit" [class]="btn" [disabled]="!motivo().trim() || ciclo().ocupado()">Reabrir</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class CicloOdontogramaComponent {
  readonly ciclo = input.required<CicloOdontograma>();
  readonly pacienteId = input.required<string>();
  readonly elegirTipo = output<OdontogramaTipo>();
  readonly btn = BTN;
  readonly tipos: { id: OdontogramaTipo; label: string }[] = [{ id: 'inicial', label: 'Inicial' }, { id: 'final', label: 'Final' }];
  readonly motivo = signal('');
  
  readonly dlgReabrir = viewChild.required<ModalComponent>("modalReabrir");

  abrirReabrir(): void {
    this.motivo.set('');
    this.dlgReabrir().open();
  }

  enviarReabrir(): void {
    const m = this.motivo().trim();
    if (!m) return;
    this.dlgReabrir().close();
    void this.ciclo().reabrir(m);
  }
}
