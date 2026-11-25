import { Component, ChangeDetectionStrategy, output, viewChild, ElementRef, inject, signal, computed, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SegmentedControlComponent } from '../../../shared/components/segmented-control/segmented-control';
import { ButtonComponent } from '../../../shared/components/button/button';
import { debounceTime } from 'rxjs/operators';
import { CitaService, Cita } from '../../../core/services/cita.service';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { ProfileService } from '../../../core/services/profile.service';
import { TratamientoService, Tratamiento } from '../../../core/services/tratamiento.service';
import { PatientAutocompleteComponent } from '../../../shared/components/patient-autocomplete/patient-autocomplete';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { calcularFaltantes, textoFaltan, opcionesDuracion, mensajeSolape, construirCita, valoresFormulario } from './funciones/cita-modal.funcion';

const DURACIONES_CHIP = [15, 30, 45, 60, 90];

@Component({
  selector: 'app-cita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PatientAutocompleteComponent, AlertComponent, ConfirmModalComponent, CopCurrencyPipe, SegmentedControlComponent, ButtonComponent],
  templateUrl: './cita-modal.html',
  styleUrl: './cita-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitaModalComponent implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly patientService = inject(PatientService);
  private readonly profileService = inject(ProfileService);
  private readonly tratamientoService = inject(TratamientoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  saveSuccess = output<void>();

  /** Catálogo de tratamientos para el selector de tipo */
  readonly tratamientos = signal<Tratamiento[]>([]);

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');
  readonly confirmModal = viewChild(ConfirmModalComponent);
  
  readonly isEditing = signal<boolean>(false);
  readonly selectedCitaId = signal<string | null>(null);

  readonly patientAutocomplete = viewChild(PatientAutocompleteComponent);
  readonly selectedPatient = signal<Patient | null>(null);
  readonly overlapCitas = signal<Cita[]>([]);
  readonly errorMessage = signal<string>('');

  readonly overlapWarningMessage = computed(() => mensajeSolape(this.overlapCitas()));

  readonly form = new FormGroup({
    fecha_hora: new FormControl('', [Validators.required]),
    duracion_minutos: new FormControl(30, [Validators.required, Validators.min(5)]),
    tipo_tratamiento: new FormControl('', [Validators.required]),
    estado: new FormControl<'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio'>('pendiente', [Validators.required]),
    notas: new FormControl(''),
    canal_origen: new FormControl<'manual' | 'whatsapp' | 'portal'>('manual'),
  });

  readonly guardando = signal(false);
  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private readonly duracion = toSignal(this.form.controls.duracion_minutos.valueChanges, { initialValue: 30 });

  readonly opcionesDuracion = computed(() => opcionesDuracion(DURACIONES_CHIP, Number(this.duracion()) || null));

  readonly faltantes = computed(() => {
    const v = this.valores();
    return calcularFaltantes({
      paciente: !!this.selectedPatient(),
      tratamiento: v.tipo_tratamiento ?? null,
      fechaHora: v.fecha_hora ?? null,
      duracion: v.duracion_minutos ?? null,
    });
  });
  readonly faltaTexto = computed(() => textoFaltan(this.faltantes()));

  setDuracion(m: number | null): void {
    if (m !== null) this.form.controls.duracion_minutos.setValue(m);
  }

  ngOnInit(): void {
    // Cargar el catálogo de tratamientos para el selector de tipo
    this.tratamientoService.getTratamientos(true)
      .then((list) => { this.tratamientos.set(list); this.cdr.markForCheck(); })
      .catch((err) => console.error('No se pudo cargar el catálogo de tratamientos:', err));

    // Escuchar cambios de fecha/hora o duración para validar solapamientos
    this.form.valueChanges.pipe(
      debounceTime(400),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(async (val) => {
      if (this.selectedPatient() && val.fecha_hora && val.duracion_minutos) {
        try {
          this.overlapCitas.set(await this.citaService.checkOverlap(val.fecha_hora, Number(val.duracion_minutos), this.selectedCitaId() || undefined));
        } catch (err) {
          console.error('Error al validar solapamiento:', err);
        }
      } else {
        this.overlapCitas.set([]);
      }
    });
  }

  open(cita?: Cita): void {
    this.overlapCitas.set([]);
    this.errorMessage.set('');
    this.profileService.loadProfile().then((prof) => {
      const defaultDuration = prof?.duracion_cita_defecto || 30;

      if (cita && cita.id) {
        this.isEditing.set(true);
        this.selectedCitaId.set(cita.id);
        if (cita.paciente_id) {
          this.patientService.getPatients('').then((list) => {
            const p = list.find((item) => item.id === cita.paciente_id);
            if (p) {
              this.selectedPatient.set(p);
              setTimeout(() => this.patientAutocomplete()?.selectPatient(p));
              this.cdr.markForCheck();
            }
          });
        }

        this.form.patchValue(valoresFormulario(cita, defaultDuration));
      } else {
        this.isEditing.set(false);
        this.selectedCitaId.set(null);
        this.selectedPatient.set(null);
        setTimeout(() => this.patientAutocomplete()?.clearSelection());
        this.form.reset(valoresFormulario({ fecha_hora: cita?.fecha_hora }, defaultDuration));
      }
      this.cdr.markForCheck();
    });
    this.dialog()?.nativeElement.showModal();
  }

  close(): void { this.dialog()?.nativeElement.close(); this.cdr.markForCheck(); }

  onPacienteSeleccionado(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.form.updateValueAndValidity(); // re-evalúa solapamiento ya con paciente
    this.cdr.markForCheck();
  }

  /** Indica si el nombre de tratamiento existe en el catálogo */
  existeEnCatalogo(nombre: string | null | undefined): boolean {
    return !!nombre && this.tratamientos().some((t) => t.nombre === nombre);
  }

  /** Al elegir un tratamiento del catálogo, autocompletar la duración estimada */
  onTipoChange(nombre: string): void {
    const t = this.tratamientos().find((x) => x.nombre === nombre);
    if (t) this.form.patchValue({ duracion_minutos: t.duracion_minutos });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.selectedPatient() || this.guardando()) return;

    this.errorMessage.set('');
    this.guardando.set(true);
    const data = construirCita(this.selectedCitaId(), this.selectedPatient()!.id!, this.form.value);

    try {
      await this.citaService.saveCita(data);
      this.close();
      this.saveSuccess.emit();
    } catch (err: any) {
      console.error('Error al guardar cita:', err);
      this.errorMessage.set(err.message || 'Error al guardar la cita. Por favor intente de nuevo.');
      this.cdr.markForCheck();
    } finally {
      this.guardando.set(false);
    }
  }

  onDelete(): void { this.confirmModal()?.open(); }

  async onConfirmDelete(): Promise<void> {
    const id = this.selectedCitaId();
    if (!id) return;
    this.errorMessage.set('');
    try {
      await this.citaService.deleteCita(id);
      this.close();
      this.saveSuccess.emit();
    } catch (err: any) {
      console.error('Error al eliminar cita:', err);
      this.errorMessage.set(err.message || 'Error al eliminar la cita. Por favor intente de nuevo.');
      this.cdr.markForCheck();
    }
  }
}
