import { Component, ChangeDetectionStrategy, output, viewChild, ElementRef, inject, signal, computed, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';
import { CitaService, Cita } from '../../../core/services/cita.service';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { ProfileService } from '../../../core/services/profile.service';
import { TratamientoService, Tratamiento } from '../../../core/services/tratamiento.service';
import { PatientAutocompleteComponent } from '../../../shared/components/patient-autocomplete/patient-autocomplete';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-cita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PatientAutocompleteComponent, AlertComponent, ConfirmModalComponent, CopCurrencyPipe],
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

  readonly overlapWarningMessage = computed(() => {
    const conflicts = this.overlapCitas();
    if (conflicts.length === 0) return '';
    const details = conflicts.map(c => {
      // Formatear hora de forma sencilla y segura en ES
      const date = new Date(c.fecha_hora);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = (hours % 12 || 12).toString().padStart(2, '0');
      return `${c.paciente?.nombre_completo || 'Paciente'} a las ${formattedHour}:${minutes} ${ampm}`;
    }).join(', ');
    return `Conflicto de Horario: ya existe una cita agendada en este rango con: ${details}.`;
  });

  readonly form = new FormGroup({
    fecha_hora: new FormControl('', [Validators.required]),
    duracion_minutos: new FormControl(30, [Validators.required, Validators.min(5)]),
    tipo_tratamiento: new FormControl('', [Validators.required]),
    estado: new FormControl<'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio'>('pendiente', [Validators.required]),
    notas: new FormControl(''),
    canal_origen: new FormControl<'manual' | 'whatsapp' | 'portal'>('manual'),
  });

  ngOnInit(): void {
    // Cargar el catálogo de tratamientos para el selector de tipo
    this.tratamientoService
      .getTratamientos(true)
      .then((list) => {
        this.tratamientos.set(list);
        this.cdr.markForCheck();
      })
      .catch((err) => console.error('No se pudo cargar el catálogo de tratamientos:', err));

    // Escuchar cambios de fecha/hora o duración para validar solapamientos
    this.form.valueChanges.pipe(
      debounceTime(400),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(async (val) => {
      if (val.fecha_hora && val.duracion_minutos) {
        try {
          const conflicts = await this.citaService.checkOverlap(
            val.fecha_hora,
            Number(val.duracion_minutos),
            this.selectedCitaId() || undefined
          );
          this.overlapCitas.set(conflicts);
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
        
        // Buscar paciente correspondiente
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

        this.form.patchValue({
          fecha_hora: cita.fecha_hora.slice(0, 16),
          duracion_minutos: cita.duracion_minutos || defaultDuration,
          tipo_tratamiento: cita.tipo_tratamiento,
          estado: cita.estado,
          notas: cita.notas || '',
          canal_origen: cita.canal_origen,
        });
      } else {
        this.isEditing.set(false);
        this.selectedCitaId.set(null);
        this.selectedPatient.set(null);
        setTimeout(() => this.patientAutocomplete()?.clearSelection());
        this.form.reset({
          fecha_hora: cita?.fecha_hora ? cita.fecha_hora.slice(0, 16) : '',
          duracion_minutos: defaultDuration,
          tipo_tratamiento: '',
          estado: 'pendiente',
          notas: '',
          canal_origen: 'manual',
        });
      }
      this.cdr.markForCheck();
    });
    this.dialog()?.nativeElement.showModal();
  }

  close(): void {
    this.dialog()?.nativeElement.close();
    this.cdr.markForCheck();
  }

  onPacienteSeleccionado(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.cdr.markForCheck();
  }

  /** Indica si el nombre de tratamiento existe en el catálogo */
  existeEnCatalogo(nombre: string | null | undefined): boolean {
    if (!nombre) return false;
    return this.tratamientos().some((t) => t.nombre === nombre);
  }

  /** Al elegir un tratamiento del catálogo, autocompletar la duración estimada */
  onTipoChange(nombre: string): void {
    const t = this.tratamientos().find((x) => x.nombre === nombre);
    if (t) {
      this.form.patchValue({ duracion_minutos: t.duracion_minutos });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.selectedPatient()) return;

    this.errorMessage.set('');
    const data: Cita = {
      id: this.selectedCitaId() || undefined,
      paciente_id: this.selectedPatient()!.id!,
      fecha_hora: new Date(this.form.value.fecha_hora!).toISOString(),
      duracion_minutos: Number(this.form.value.duracion_minutos),
      tipo_tratamiento: this.form.value.tipo_tratamiento!,
      estado: this.form.value.estado!,
      notas: this.form.value.notas || '',
      canal_origen: this.form.value.canal_origen || 'manual',
    };

    try {
      await this.citaService.saveCita(data);
      this.close();
      this.saveSuccess.emit();
    } catch (err: any) {
      console.error('Error al guardar cita:', err);
      this.errorMessage.set(err.message || 'Error al guardar la cita. Por favor intente de nuevo.');
      this.cdr.markForCheck();
    }
  }

  onDelete(): void {
    this.confirmModal()?.open();
  }

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
