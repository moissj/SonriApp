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
import { HistoriaService, HistoriaClinica } from '../../../../core/services/historia.service';
import { CardComponent } from '../../../../shared/components/card/card';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, CardComponent, EmptyStateComponent],
  templateUrl: './historia-clinica.html',
  styleUrl: './historia-clinica.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoriaClinicaComponent implements OnInit {
  private readonly historiaService = inject(HistoriaService);
  private readonly fb = inject(FormBuilder);

  /** Id del paciente cuya historia clínica se gestiona */
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
      this.historias.set(await this.historiaService.getHistorias(this.pacienteId()));
    } catch (err) {
      console.error('Error cargando historia clínica:', err);
      this.error.set('No se pudo cargar la historia clínica.');
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
      const nueva = await this.historiaService.addHistoria(this.pacienteId(), {
        motivo_consulta,
        diagnostico: diagnostico.trim() || null,
        notas_clinicas: notas_clinicas.trim() || null,
      });
      // Insertar al inicio (orden cronológico inverso)
      this.historias.update((prev) => [nueva, ...prev]);
      this.form.reset();
      this.showForm.set(false);
    } catch (err) {
      console.error('Error guardando entrada clínica:', err);
      this.error.set('No se pudo guardar la entrada. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }
}
