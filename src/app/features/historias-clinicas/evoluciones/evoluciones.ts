import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistoriasClinicasService,
  HistoriaClinica,
} from '../../../core/services/historias-clinicas.service';
import { CardComponent } from '../../../shared/components/card/card';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { CodigoBuscadorComponent } from '../../../shared/components/codigo-buscador/codigo-buscador';
import { Cie10Service } from '../../../core/services/cie10.service';

@Component({
  selector: 'app-evoluciones',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, CardComponent, EmptyStateComponent, CodigoBuscadorComponent],
  templateUrl: './evoluciones.html',
  styleUrl: './evoluciones.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolucionesComponent implements OnInit {
  private readonly historiasService = inject(HistoriasClinicasService);
  private readonly fb = inject(FormBuilder);
  private readonly cie10Service = inject(Cie10Service);

  readonly cie10 = signal<{ codigo: string; descripcion: string } | null>(null);
  readonly buscarCie10 = (q: string) => this.cie10Service.buscar(q);

  /** Id del paciente cuyas evoluciones se gestionan */
  readonly pacienteId = input.required<string>();

  readonly historias = signal<HistoriaClinica[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  /** Muestra/oculta el formulario de nueva entrada */
  readonly showForm = signal(false);
  /** Id de la entrada expandida (tarjeta colapsable) */
  readonly expandedId = signal<string | null>(null);

  readonly hoy = new Date();

  readonly form = this.fb.nonNullable.group({
    motivo_consulta: ['', [Validators.required, Validators.maxLength(200)]],
    diagnostico: [''],
    notas_clinicas: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.historias.set(await this.historiasService.getHistorias(this.pacienteId()));
    } catch (err) {
      console.error('Error cargando evoluciones:', err);
      this.error.set('No se pudieron cargar las evoluciones.');
    } finally {
      this.loading.set(false);
    }
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) this.form.reset();
  }

  toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    try {
      const { motivo_consulta, diagnostico, notas_clinicas } = this.form.getRawValue();
      const nueva = await this.historiasService.addHistoria(this.pacienteId(), {
        motivo_consulta,
        diagnostico: diagnostico.trim() || null,
        notas_clinicas: notas_clinicas.trim() || null,
        cie10_codigo: this.cie10()?.codigo ?? null,
      });
      // Insertar al inicio (orden cronológico inverso); la descripción viene del código elegido
      const conDescripcion = { ...nueva, cie10_descripcion: this.cie10()?.descripcion ?? null };
      this.historias.update((prev) => [conDescripcion, ...prev]);
      this.form.reset();
      this.cie10.set(null);
      this.showForm.set(false);
    } catch (err) {
      console.error('Error guardando evolución:', err);
      this.error.set('No se pudo guardar la entrada. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }
}
