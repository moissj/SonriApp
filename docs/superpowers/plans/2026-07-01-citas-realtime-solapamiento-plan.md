# Citas: Autocompletado, Solapamiento y Realtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement patient autocomplete with inline creation, automatic appointment slot overlap checks, a quick action menu for appointments, and live updates via Supabase Realtime.

**Architecture:** Encapsulate the autocomplete component in the shared module. Query existing appointments on input changes to trigger non-blocking overlap warnings. Hook up real-time postgres changes using Supabase subscription channel.

**Tech Stack:** Angular 18+, TailwindCSS, Supabase JS client (Realtime).

## Global Constraints

- No external autocomplete libraries (native HTML + CSS + Tailwind).
- DRY component design: Reusable `PatientAutocompleteComponent`.
- Real-time subscriptions scoped to the logged-in doctor's tenant/organization.
- Non-blocking overlap warning using AlertComponent.
- Optimistic updates with automatic rollback on DB errors.

---

### Task 1: Componente Reutilizable de Autocompletado

**Files:**
- Create: `src/app/shared/components/patient-autocomplete/patient-autocomplete.ts`
- Create: `src/app/shared/components/patient-autocomplete/patient-autocomplete.html`
- Create: `src/app/shared/components/patient-autocomplete/patient-autocomplete.scss`

**Interfaces:**
- Consumes: `PatientService`, `Patient`
- Produces: `PatientAutocompleteComponent` (selector: `app-patient-autocomplete`)
  - Output: `pacienteSeleccionado = output<Patient>()`

- [ ] **Step 1: Crear `patient-autocomplete.ts`**
  Implement details for loading, filtering, selection, and inline form state management.
  ```typescript
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

      // Aplicar formateo de prefijo +57 al telefono celular de Colombia
      let phone = this.quickForm.value.telefono;
      if (phone && phone.length === 10) {
        phone = `+57${phone}`;
      }

      const newPatient: Partial<Patient> = {
        nombre_completo: this.quickForm.value.nombre_completo!,
        tipo_documento: this.quickForm.value.tipo_documento!,
        numero_documento: this.quickForm.value.numero_documento!,
        telefono: phone!,
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
  ```

- [ ] **Step 2: Crear `patient-autocomplete.html`**
  ```html
  <div class="relative w-full">
    @if (selectedPatient()) {
      <div class="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl p-3">
        <div>
          <h5 class="text-sm font-semibold text-sky-900">{{ selectedPatient()?.nombre_completo }}</h5>
          <span class="text-xs text-sky-700">Documento: {{ selectedPatient()?.numero_documento }} | Celular: {{ selectedPatient()?.telefono }}</span>
        </div>
        <button type="button" (click)="clearSelection()" class="text-xs text-red-600 font-bold hover:underline">Cambiar</button>
      </div>
    } @else if (isCreatingNew()) {
      <!-- Formulario de Registro Rápido Inline -->
      <form [formGroup]="quickForm" (ngSubmit)="$event.preventDefault(); onCreatePatient()" class="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
        <h4 class="text-xs font-bold text-neutral-800 uppercase tracking-wider">Registro Rápido de Paciente</h4>
        
        @if (errorMessage()) {
          <div class="bg-red-50 text-red-600 text-xs p-2 rounded-lg border border-red-200">
            {{ errorMessage() }}
          </div>
        }

        <div>
          <label class="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Nombre Completo</label>
          <input type="text" formControlName="nombre_completo" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Tipo Doc.</label>
            <select formControlName="tipo_documento" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500">
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
              <option value="PA">PA</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Nro. Documento</label>
            <input type="text" formControlName="numero_documento" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500">
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Celular (10 dígitos)</label>
          <input type="text" formControlName="telefono" placeholder="3001234567" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500">
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-neutral-200">
          <button type="button" (click)="cancelCreate()" class="px-3 py-1.5 text-xs bg-neutral-200 hover:bg-neutral-300 rounded-lg font-medium">Cancelar</button>
          <button type="submit" [disabled]="quickForm.invalid || isSaving()" class="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium disabled:opacity-50">Guardar</button>
        </div>
      </form>
    } @else {
      <!-- Buscador -->
      <input type="text" [formControl]="searchControl" placeholder="Buscar paciente por nombre o documento..." class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
      
      @if (searchControl.value) {
        <div class="absolute z-20 w-full bg-white border border-neutral-200 rounded-xl mt-1 max-h-48 overflow-y-auto divide-y divide-neutral-100 shadow-lg">
          @for (p of patients$ | async; track p.id) {
            <div (click)="selectPatient(p)" class="p-3 hover:bg-neutral-50 cursor-pointer text-sm flex items-center justify-between">
              <div>
                <p class="font-bold text-neutral-800">{{ p.nombre_completo }}</p>
                <p class="text-xs text-neutral-500">Doc: {{ p.numero_documento }}</p>
              </div>
              <span class="text-xs text-sky-600 font-medium">Seleccionar</span>
            </div>
          }
          <!-- Opción de creación rápida inline -->
          <div (click)="showCreateForm()" class="p-3 hover:bg-neutral-50 cursor-pointer text-sm text-sky-600 font-bold flex items-center gap-1">
            <span>+ Crear Paciente Nuevo:</span>
            <span class="italic text-neutral-500">"{{ searchControl.value }}"</span>
          </div>
        </div>
      }
    }
  </div>
  ```

- [ ] **Step 3: Crear `patient-autocomplete.scss`**
  ```scss
  :host {
    display: block;
    width: 100%;
  }
  ```

- [ ] **Step 4: Compilar para verificar**
  Command: `npx ng build --configuration development`
  Expected: Compiled successfully with code 0.

---

### Task 2: Integrar Autocomplete en Modal de Citas

**Files:**
- Modify: `src/app/features/citas/cita-modal/cita-modal.ts`
- Modify: `src/app/features/citas/cita-modal/cita-modal.html`

**Interfaces:**
- Consumes: `PatientAutocompleteComponent`
- Produces: `CitaModalComponent` updated.

- [ ] **Step 1: Modificar `cita-modal.ts` para importar y registrar `PatientAutocompleteComponent`**
  Import `PatientAutocompleteComponent` and add to imports array. Remove legacy rx search code from `cita-modal.ts`.
  Let's see: lines 1-47:
  ```typescript
  import { Component, ChangeDetectionStrategy, output, viewChild, ElementRef, inject, signal } from '@angular/core';
  import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import { CitaService, Cita } from '../../../core/services/cita.service';
  import { PatientService, Patient } from '../../../core/services/patient.service';
  import { PatientAutocompleteComponent } from '../../../shared/components/patient-autocomplete/patient-autocomplete';

  @Component({
    selector: 'app-cita-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PatientAutocompleteComponent],
    templateUrl: './cita-modal.html',
    styleUrl: './cita-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class CitaModalComponent {
    private readonly citaService = inject(CitaService);
    private readonly patientService = inject(PatientService);

    saveSuccess = output<void>();

    private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');
    
    readonly isEditing = signal<boolean>(false);
    readonly selectedCitaId = signal<string | null>(null);

    // Selector de paciente hijo
    readonly patientAutocomplete = viewChild(PatientAutocompleteComponent);
    readonly selectedPatient = signal<Patient | null>(null);

    readonly form = new FormGroup({
      fecha_hora: new FormControl('', [Validators.required]),
      duracion_minutos: new FormControl(30, [Validators.required, Validators.min(5)]),
      tipo_tratamiento: new FormControl('', [Validators.required]),
      estado: new FormControl<'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio'>('pendiente', [Validators.required]),
      notas: new FormControl(''),
      canal_origen: new FormControl<'manual' | 'whatsapp' | 'portal'>('manual'),
    });

    open(cita?: Cita): void {
      if (cita && cita.id) {
        this.isEditing.set(true);
        this.selectedCitaId.set(cita.id);
        
        if (cita.paciente_id) {
          this.patientService.getPatients('').then((list) => {
            const p = list.find((item) => item.id === cita.paciente_id);
            if (p) {
              this.selectedPatient.set(p);
              setTimeout(() => this.patientAutocomplete()?.selectPatient(p));
            }
          });
        }

        this.form.patchValue({
          fecha_hora: cita.fecha_hora.slice(0, 16),
          duracion_minutos: cita.duracion_minutos,
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
          duracion_minutos: 30,
          tipo_tratamiento: '',
          estado: 'pendiente',
          notas: '',
          canal_origen: 'manual',
        });
      }
      this.dialog()?.nativeElement.showModal();
    }

    close(): void {
      this.dialog()?.nativeElement.close();
    }

    onPacienteSeleccionado(patient: Patient): void {
      this.selectedPatient.set(patient);
    }
  ```

- [ ] **Step 2: Modificar `cita-modal.html` para usar `<app-patient-autocomplete>`**
  Replace old patient HTML logic with component tag:
  ```html
  <!-- Buscador de Pacientes -->
  <div>
    <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Paciente</label>
    <app-patient-autocomplete #patientAutocomplete (pacienteSeleccionado)="onPacienteSeleccionado($event)"></app-patient-autocomplete>
  </div>
  ```

- [ ] **Step 3: Compilar y comprobar**
  Command: `npx ng build --configuration development`
  Expected: Compiled successfully with code 0.

---

### Task 3: Validación de Solapamiento de Horarios y Prellenado de Perfil

**Files:**
- Modify: `src/app/core/services/cita.service.ts`
- Modify: `src/app/features/citas/cita-modal/cita-modal.ts`
- Modify: `src/app/features/citas/cita-modal/cita-modal.html`

**Interfaces:**
- Consumes: `CitaService`, `AlertComponent`
- Produces: `CitaService.checkOverlap(...)`, overlap checks inside `CitaModalComponent`.

- [ ] **Step 1: Agregar validación de solapamiento en `cita.service.ts`**
  Definir consulta a Supabase.
  ```typescript
  async checkOverlap(fechaHora: string, duracionMinutos: number, excluyendoCitaId?: string): Promise<Cita[]> {
    const start = new Date(fechaHora);
    const end = new Date(start.getTime() + duracionMinutos * 60000);

    const user = this.authService.user();
    if (!user) return [];

    let query = this.supabase
      .from('citas')
      .select('*, paciente:pacientes(nombre_completo)')
      .eq('odontologo_id', user.id)
      .neq('estado', 'cancelada')
      .lte('fecha_hora', end.toISOString())
      .filter('fecha_hora_fin_raw', 'gte', start.toISOString()); // We will calculate this on frontend or do a comparison.
    
    // Wait, let's write a robust comparison using timestamps or loading appointments for the day and filtering.
    // Daily appointments are usually very few (less than 50), so we can fetch all appointments for that specific day and do the interval math in JavaScript. This is highly reliable and avoids custom Postgres interval functions!
    // Let's implement day-based check in JavaScript.
  ```
  Let's refine this check:
  ```typescript
  async checkOverlap(fechaHora: string, duracionMinutos: number, excluyendoCitaId?: string): Promise<Cita[]> {
    const checkStart = new Date(fechaHora).getTime();
    const checkEnd = checkStart + duracionMinutos * 60000;

    const startOfDay = new Date(fechaHora);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fechaHora);
    endOfDay.setHours(23, 59, 59, 999);

    const list = await this.getCitas(startOfDay.toISOString(), endOfDay.toISOString());
    return list.filter((cita) => {
      if (excluyendoCitaId && cita.id === excluyendoCitaId) return false;
      if (cita.estado === 'cancelada') return false;

      const citaStart = new Date(cita.fecha_hora).getTime();
      const citaEnd = citaStart + cita.duracion_minutos * 60000;

      // Hay solapamiento si: checkStart < citaEnd && checkEnd > citaStart
      return checkStart < citaEnd && checkEnd > citaStart;
    });
  }
  ```

- [ ] **Step 2: Prellenar duración predeterminada del odontólogo**
  En `cita-modal.ts`, consultar perfil para prellenar `duracion_minutos`.
  ```typescript
  // En open():
  const perfil = this.authService.perfil(); // Supongamos que perfil tiene duracion_cita_defecto
  // Prellenar duracion_minutos con perfil?.duracion_cita_defecto || 30
  ```

- [ ] **Step 3: Agregar lógica de chequeo y aviso en `cita-modal.ts`**
  ```typescript
  readonly overlapCitas = signal<Cita[]>([]);

  // Escuchar cambios de fecha_hora o duracion_minutos para lanzar checkOverlap
  // ...
  ```

- [ ] **Step 4: Modificar `cita-modal.html` para incluir `AlertComponent`**
  ```html
  @if (overlapCitas().length > 0) {
    <app-alert type="warning" title="Conflicto de Horario">
      Hay otra cita agendada en este horario: 
      @for (c of overlapCitas(); track c.id) {
        <span>{{ c.paciente?.nombre_completo }} ({{ c.fecha_hora | date: 'hh:mm a' }})</span>
      }
    </app-alert>
  }
  ```

---

### Task 4: Acciones Rápidas (Dropdown / Bottom Sheet) para Cambios de Estado

**Files:**
- Modify: `src/app/features/citas/citas.ts`
- Modify: `src/app/features/citas/citas.html`
- Modify: `src/app/features/citas/citas.scss`

**Interfaces:**
- Consumes: `CitaService`
- Produces: State changes menu with optimistic updates and rollbacks.

- [ ] **Step 1: Implementar acciones rápidas de cambio de estado en `CitasComponent`**
  ```typescript
  // Guardar estado original de la cita para rollback en caso de fallo
  async updateCitaEstado(cita: Cita, nuevoEstado: 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio'): Promise<void> {
    const estadoOriginal = cita.estado;
    
    // Optimistic Update: Actualizar localmente
    cita.estado = nuevoEstado;
    this.citas.update(list => [...list]);

    try {
      await this.citaService.saveCita({ ...cita, estado: nuevoEstado });
    } catch (err) {
      console.error('Rollback a causa de error:', err);
      cita.estado = estadoOriginal;
      this.citas.update(list => [...list]);
    }
  }
  ```

- [ ] **Step 2: Crear menú dropdown/sheet flotante en `citas.html`**
  Implement dropdown inside cell or modal sheet trigger.

---

### Task 5: Suscripción Realtime para Cambios del Odontólogo

**Files:**
- Modify: `src/app/features/citas/citas.ts`

**Interfaces:**
- Consumes: `SupabaseClient` from Core Services.

- [ ] **Step 1: Agregar suscripción en `ngOnInit` de `CitasComponent`**
  ```typescript
  // Suscribirse a cambios en tiempo real
  // ...
  ```

- [ ] **Step 2: Desuscribirse en `ngOnDestroy`**
  ```typescript
  // Destruir canal realtime
  ```

- [ ] **Step 3: Compilar y validar**
  Command: `npx ng build --configuration development`
  Expected: Compiled successfully with code 0.
