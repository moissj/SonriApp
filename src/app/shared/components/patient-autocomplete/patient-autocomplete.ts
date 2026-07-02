import { Component, ChangeDetectionStrategy, output, inject, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { from } from 'rxjs';

@Component({
  selector: 'app-patient-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-autocomplete.html',
  styleUrl: './patient-autocomplete.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientAutocompleteComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  
  pacienteSeleccionado = output<Patient>();
  
  readonly searchControl = new FormControl('');
  readonly selectedPatient = signal<Patient | null>(null);
  readonly isCreatingNew = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly patients$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => {
      if (this.selectedPatient() && term === this.selectedPatient()?.nombre_completo) {
        return from(Promise.resolve([]));
      }
      return from(this.patientService.getPatients(term || ''));
    })
  );

  readonly quickForm = new FormGroup({
    nombre_completo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    tipo_documento: new FormControl('CC', [Validators.required]),
    numero_documento: new FormControl('', [Validators.required, Validators.pattern(/^[0-9A-Za-z-]{5,20}$/)]),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^3[0-9]{9}$/)]),
  });

  ngOnInit(): void {}

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.searchControl.setValue(patient.nombre_completo, { emitEvent: false });
    this.pacienteSeleccionado.emit(patient);
  }

  clearSelection(): void {
    this.selectedPatient.set(null);
    this.searchControl.setValue('');
  }

  showCreateForm(): void {
    this.isCreatingNew.set(true);
    this.quickForm.reset({
      nombre_completo: this.searchControl.value || '',
      tipo_documento: 'CC',
      numero_documento: '',
      telefono: '',
    });
  }

  cancelCreate(): void {
    this.isCreatingNew.set(false);
    this.errorMessage.set(null);
  }

  async onCreatePatient(): Promise<void> {
    if (this.quickForm.invalid) {
      this.quickForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set(null);

    let phone = this.quickForm.value.telefono;
    if (phone && phone.length === 10) {
      phone = `+57${phone}`;
    }

    const newPatient: Omit<Patient, 'id' | 'odontologo_id' | 'created_at' | 'ultima_cita'> = {
      nombre_completo: this.quickForm.value.nombre_completo!,
      tipo_documento: this.quickForm.value.tipo_documento as 'CC' | 'TI' | 'CE' | 'PA',
      numero_documento: this.quickForm.value.numero_documento!,
      telefono: phone || null,
      email: null,
      fecha_nacimiento: null,
      ciudad: null,
      departamento: null,
      direccion: null,
      antecedentes_medicos: null,
      alergias: null,
      afiliacion_salud: null,
      notas_generales: null,
    };

    try {
      const created = await this.patientService.createPatient(newPatient);
      this.isCreatingNew.set(false);
      this.selectPatient(created);
    } catch (err: any) {
      console.error(err);
      this.errorMessage.set(err.message || 'Error al guardar paciente.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
