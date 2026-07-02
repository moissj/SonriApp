# Gestión de Pacientes y Citas - Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar el formulario y la vista de detalle de pacientes, y construir el módulo de agenda de citas (Fase 3) con soporte responsive y modal nativo.

**Architecture:** Módulo de citas reactivo basado en señales, comunicación con Supabase mediante servicios dedicados, uso de la API nativa de `<dialog>` para modales accesibles y responsive (estilizados con Tailwind), y componentes reutilizables sin duplicación de lógica.

**Tech Stack:** Angular 21, RxJS, Supabase Client (`@supabase/supabase-js`), TailwindCSS.

## Global Constraints

- Standalone components con `ChangeDetectionStrategy.OnPush`.
- Reactive Forms para formularios de captura con validación en español.
- Prefijo celular colombiano `+57` antepuesto automáticamente.
- Uso exclusivo de TailwindCSS para diseño visual responsivo.

---

### Task 1: Componentes Reutilizables Compartidos (`ConfirmModal` y `StatusBadge`)

**Files:**
- Create: `src/app/shared/components/confirm-modal/confirm-modal.ts`
- Create: `src/app/shared/components/confirm-modal/confirm-modal.html`
- Create: `src/app/shared/components/confirm-modal/confirm-modal.scss`
- Create: `src/app/shared/components/status-badge/status-badge.ts`
- Create: `src/app/shared/components/status-badge/status-badge.html`
- Create: `src/app/shared/components/status-badge/status-badge.scss`

**Interfaces:**
- `ConfirmModalComponent` recibe `title`, `message`, `confirmText`, `cancelText` como signal inputs, y expone `confirm` y `cancel` como outputs.
- `StatusBadgeComponent` recibe `estado` (tipo `estado_cita_enum`) como signal input.

- [ ] **Step 1: Crear ConfirmModalComponent (TS)**

```typescript
import { Component, ChangeDetectionStrategy, input, output, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  title = input<string>('Confirmación');
  message = input<string>('¿Estás seguro de realizar esta acción?');
  confirmText = input<string>('Aceptar');
  cancelText = input<string>('Cancelar');

  confirm = output<void>();
  cancel = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');

  open(): void {
    this.dialog()?.nativeElement.showModal();
  }

  close(): void {
    this.dialog()?.nativeElement.close();
  }

  onConfirm(): void {
    this.confirm.emit();
    this.close();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close();
  }
}
```

- [ ] **Step 2: Crear HTML de ConfirmModalComponent**

```html
<dialog #dialogRef class="backdrop:bg-black/50 p-0 rounded-2xl border border-neutral-200 shadow-2xl max-w-md w-full bg-white transition-all overflow-hidden focus:outline-none">
  <div class="p-6">
    <h3 class="text-lg font-bold text-neutral-900">{{ title() }}</h3>
    <p class="mt-2 text-sm text-neutral-600 leading-relaxed">{{ message() }}</p>
    <div class="mt-6 flex justify-end gap-3">
      <button type="button" (click)="onCancel()" class="px-4 py-2 text-sm font-semibold rounded-lg text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors">
        {{ cancelText() }}
      </button>
      <button type="button" (click)="onConfirm()" class="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
        {{ confirmText() }}
      </button>
    </div>
  </div>
</dialog>
```

- [ ] **Step 3: Crear SCSS de ConfirmModalComponent**

```scss
:host {
  display: block;
}
```

- [ ] **Step 4: Crear StatusBadgeComponent (TS)**

```typescript
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type CitaEstado = 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  estado = input.required<CitaEstado>();

  label = computed(() => {
    switch (this.estado()) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'atendida': return 'Atendida';
      case 'cancelada': return 'Cancelada';
      case 'no_asistio': return 'No asistió';
      default: return 'Desconocido';
    }
  });

  badgeClass = computed(() => {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border';
    switch (this.estado()) {
      case 'pendiente':
        return `${base} bg-yellow-50 text-yellow-800 border-yellow-200`;
      case 'confirmada':
        return `${base} bg-blue-50 text-blue-800 border-blue-200`;
      case 'atendida':
        return `${base} bg-green-50 text-green-800 border-green-200`;
      case 'cancelada':
      case 'no_asistio':
        return `${base} bg-red-50 text-red-800 border-red-200`;
      default:
        return `${base} bg-neutral-50 text-neutral-800 border-neutral-200`;
    }
  });
}
```

- [ ] **Step 5: Crear HTML de StatusBadgeComponent**

```html
<span [class]="badgeClass()">
  {{ label() }}
</span>
```

- [ ] **Step 6: Crear SCSS de StatusBadgeComponent**

```scss
:host {
  display: inline-block;
}
```

- [ ] **Step 7: Compilar para verificar componentes compartidos**

Run: `npx ng build --configuration development`
Expected: DONE (0 errors)

- [ ] **Step 8: Commit**

```bash
git add src/app/shared/components/confirm-modal/ src/app/shared/components/status-badge/
git commit -m "feat: add reusable ConfirmModal and StatusBadge components"
```

---

### Task 2: Servicio de Citas (`CitaService`) y actualización del Servicio de Pacientes

**Files:**
- Create: `src/app/core/services/cita.service.ts`
- Modify: `src/app/core/services/patient.service.ts`

**Interfaces:**
- `CitaService` expone métodos para listar citas en un rango de fechas, guardar citas y actualizar estados.
- `PatientService` se asegura de mapear correctamente y formatear datos médicos adicionales.

- [ ] **Step 1: Crear CitaService**

```typescript
import { inject, Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface Cita {
  id?: string;
  odontologo_id?: string;
  paciente_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_tratamiento: string;
  estado: 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio';
  notas?: string;
  canal_origen: 'manual' | 'whatsapp' | 'portal';
  paciente?: {
    nombre_completo: string;
    telefono: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private readonly auth = inject(AuthService);

  async getCitas(startDate: string, endDate: string): Promise<Cita[]> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('citas')
      .select('*, paciente:pacientes(nombre_completo, telefono)')
      .eq('odontologo_id', userId)
      .gte('fecha_hora', startDate)
      .lte('fecha_hora', endDate)
      .order('fecha_hora', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
    return data || [];
  }

  async saveCita(cita: Cita): Promise<Cita> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const citaData = {
      ...cita,
      odontologo_id: userId,
    };

    const { data, error } = await supabase
      .from('citas')
      .upsert(citaData)
      .select('*, paciente:pacientes(nombre_completo, telefono)')
      .single();

    if (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }
    return data;
  }

  async deleteCita(id: string): Promise<void> {
    const { error } = await supabase.from('citas').delete().eq('id', id);
    if (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
}
```

- [ ] **Step 2: Verificar o actualizar campos en PatientService**
Verificar que `PatientService` implemente correctamente el método `getPatients` y guarde todos los campos requeridos en el formulario (dirección, antecedentes, alergias).

- [ ] **Step 3: Compilar y validar servicios**

Run: `npx ng build --configuration development`
Expected: DONE (0 errors)

- [ ] **Step 4: Commit**

```bash
git add src/app/core/services/cita.service.ts
git commit -m "feat: implement CitaService to manage Supabase appointments"
```

---

### Task 3: Integración de `ConfirmModal` y Formateador Celular en Pacientes

**Files:**
- Modify: `src/app/features/pacientes/detalle/detalle.ts`
- Modify: `src/app/features/pacientes/detalle/detalle.html`
- Modify: `src/app/features/pacientes/formulario/formulario.ts`

- [ ] **Step 1: Agregar ConfirmModal en Ficha de Paciente (TS)**
Importar `ConfirmModalComponent` y enlazar el método de confirmación.

```typescript
// En detalle.ts
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
// En @Component imports:
// ConfirmModalComponent
// En clase PacienteDetailComponent:
confirmModal = viewChild(ConfirmModalComponent);

triggerDelete(): void {
  this.confirmModal()?.open();
}

async onDeleteConfirmed(): Promise<void> {
  const patientId = this.patient()?.id;
  if (!patientId) return;
  try {
    await this.patientService.deletePatient(patientId);
    this.router.navigate(['/pacientes']);
  } catch (err) {
    console.error(err);
  }
}
```

- [ ] **Step 2: Agregar ConfirmModal en el HTML de Detalle**

```html
<!-- Al final de detalle.html -->
<app-confirm-modal
  #confirmModal
  title="Eliminar Paciente"
  message="¿Estás seguro de que deseas eliminar este paciente? Esta acción borrará permanentemente sus datos e historias clínicas asociadas."
  confirmText="Eliminar Paciente"
  cancelText="Conservar"
  (confirm)="onDeleteConfirmed()">
</app-confirm-modal>
```

Y enlazar el botón de eliminar del detalle:
```html
<button (click)="triggerDelete()" class="...">Eliminar</button>
```

- [ ] **Step 3: Aplicar prefijo automático +57 en Formulario de Pacientes (TS)**
En el guardado del formulario, validar que el teléfono tenga 10 dígitos y añadir automáticamente el prefijo `+57` antes de persistir en Supabase.

```typescript
// En formulario.ts
const rawPhone = this.form.value.telefono;
let formattedPhone = rawPhone ? rawPhone.toString().replace(/\D/g, '') : '';
if (formattedPhone.length === 10) {
  formattedPhone = `+57${formattedPhone}`;
}
```

- [ ] **Step 4: Compilar y validar**

Run: `npx ng build --configuration development`
Expected: DONE (0 errors)

- [ ] **Step 5: Commit**

```bash
git add src/app/features/pacientes/
git commit -m "feat: integrate ConfirmModal and Colombian phone validation in Pacientes"
```

---

### Task 4: Módulo de Citas y Agenda (Agenda y Selector de Fecha)

**Files:**
- Create: `src/app/features/citas/citas.ts`
- Create: `src/app/features/citas/citas.html`
- Create: `src/app/features/citas/citas.scss`
- Create: `src/app/features/citas/citas.routes.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- `citasRoutes` mapea el componente raíz de la agenda.
- `CitasComponent` maneja la selección de fechas (signal) y la renderización en grid o lista según resolución.

- [ ] **Step 1: Crear CitasComponent (TS)**

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { CitaService, Cita } from '../../core/services/cita.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { CitaModalComponent } from './cita-modal/cita-modal';
import { viewChild } from '@angular/core';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, DatePipe, StatusBadgeComponent, CitaModalComponent],
  templateUrl: './citas.html',
  styleUrl: './citas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitasComponent {
  private readonly citaService = inject(CitaService);

  readonly selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  private readonly refreshTrigger = signal<number>(0);

  readonly citaModal = viewChild(CitaModalComponent);

  // Cargar citas reactivas
  readonly citas = toSignal(
    toObservable(this.selectedDate).pipe(
      switchMap((dateStr) => {
        const start = `${dateStr}T00:00:00.000Z`;
        const end = `${dateStr}T23:59:59.999Z`;
        return from(this.citaService.getCitas(start, end));
      })
    ),
    { initialValue: [] as Cita[] }
  );

  // Horas para el grid semanal (Desktop)
  readonly hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

  changeDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.value) {
      this.selectedDate.set(input.value);
    }
  }

  prevDay(): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() - 1);
    this.selectedDate.set(d.toISOString().split('T')[0]);
  }

  nextDay(): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + 1);
    this.selectedDate.set(d.toISOString().split('T')[0]);
  }

  openCitaForm(cita?: Cita): void {
    this.citaModal()?.open(cita || {
      paciente_id: '',
      fecha_hora: `${this.selectedDate()}T09:00:00`,
      duracion_minutos: 30,
      tipo_tratamiento: '',
      estado: 'pendiente',
      canal_origen: 'manual'
    });
  }

  onSaveSuccess(): void {
    this.refreshTrigger.update(n => n + 1);
  }
}
```

- [ ] **Step 2: Crear HTML de CitasComponent**

```html
<div class="min-h-screen bg-neutral-50 pb-20 lg:pb-0">
  <!-- Cabecera y Selector de Fecha -->
  <header class="bg-white border-b border-neutral-200 sticky top-0 z-10 px-4 py-4 sm:px-6">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Agenda de Citas</h1>
        <p class="text-sm text-neutral-500">Visualiza y gestiona las citas programadas</p>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="prevDay()" class="p-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 transition-colors text-neutral-700">
          &larr;
        </button>
        <input type="date" [value]="selectedDate()" (change)="changeDate($event)" class="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
        <button (click)="nextDay()" class="p-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 transition-colors text-neutral-700">
          &rarr;
        </button>

        <button (click)="openCitaForm()" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm ml-auto sm:ml-0">
          + Nueva Cita
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6">
    <!-- Vista Mobile (Lista) -->
    <div class="block lg:hidden space-y-6">
      @if (citas().length === 0) {
        <div class="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <p class="text-neutral-500 text-sm">No hay citas agendadas para este día.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (cita of citas(); track cita.id) {
            <div (click)="openCitaForm(cita)" class="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm active:bg-neutral-50 transition-colors cursor-pointer flex items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-neutral-800">{{ cita.fecha_hora | date: 'shortTime' }}</span>
                  <app-status-badge [estado]="cita.estado"></app-status-badge>
                </div>
                <h4 class="font-semibold text-neutral-900">{{ cita.paciente?.nombre_completo }}</h4>
                <p class="text-xs text-neutral-500">{{ cita.tipo_tratamiento }}</p>
              </div>
              <span class="text-neutral-400 text-lg">&rarr;</span>
            </div>
          }
        </div>
      }
    </div>

    <!-- Vista Desktop (Grid) -->
    <div class="hidden lg:grid grid-cols-1 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div class="grid grid-cols-[100px_1fr] border-b border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">
        <div class="p-3 border-r border-neutral-100 text-center">Hora</div>
        <div class="p-3">Pacientes / Tratamientos</div>
      </div>

      <div class="divide-y divide-neutral-100 relative">
        @for (hour of hours; track hour) {
          <div class="grid grid-cols-[100px_1fr] min-h-[80px] hover:bg-neutral-50/50">
            <div class="p-3 border-r border-neutral-100 text-xs font-semibold text-neutral-500 text-center select-none pt-2">
              {{ hour }}
            </div>
            <div class="p-3 relative group flex flex-col justify-center">
              <!-- Citas que caen en este horario -->
              @for (cita of citas(); track cita.id) {
                @if ((cita.fecha_hora | date: 'H:00') === hour) {
                  <div (click)="openCitaForm(cita)" class="bg-sky-50 hover:bg-sky-100 border-l-4 border-sky-600 rounded-r-lg p-2.5 cursor-pointer shadow-sm transition-all mb-2 flex items-center justify-between gap-4">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-sky-900">{{ cita.fecha_hora | date: 'shortTime' }} ({{ cita.duracion_minutos }} min)</span>
                        <app-status-badge [estado]="cita.estado"></app-status-badge>
                      </div>
                      <h5 class="text-sm font-bold text-neutral-900 mt-1">{{ cita.paciente?.nombre_completo }}</h5>
                      <span class="text-xs text-neutral-600">{{ cita.tipo_tratamiento }}</span>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    </div>
  </main>
</div>

<app-cita-modal #citaModal (saveSuccess)="onSaveSuccess()"></app-cita-modal>
```

- [ ] **Step 3: Crear SCSS de CitasComponent**

```scss
:host {
  display: block;
}
```

- [ ] **Step 4: Crear Rutas de Citas (`citas.routes.ts`)**

```typescript
import { Routes } from '@angular/router';

export const citasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./citas').then((m) => m.CitasComponent),
  },
];
```

- [ ] **Step 5: Vincular ruta de Citas en `app.routes.ts`**
Registrar la ruta lazy `/citas` protegida con el guard de autenticación.

- [ ] **Step 6: Compilar y validar el módulo de citas**

Run: `npx ng build --configuration development`
Expected: DONE (0 errors)

- [ ] **Step 7: Commit**

```bash
git add src/app/features/citas/src/app/app.routes.ts
git commit -m "feat: implement appointments list and grid views in /features/citas"
```

---

### Task 5: Modal de Agenda de Citas (`CitaModalComponent`)

**Files:**
- Create: `src/app/features/citas/cita-modal/cita-modal.ts`
- Create: `src/app/features/citas/cita-modal/cita-modal.html`
- Create: `src/app/features/citas/cita-modal/cita-modal.scss`

**Interfaces:**
- `CitaModalComponent` expone métodos `open(cita?: Cita)` y `close()`.
- Emite un `@Output` `saveSuccess: void` tras crear/editar/eliminar una cita satisfactoriamente.

- [ ] **Step 1: Crear CitaModalComponent (TS)**

```typescript
import { Component, ChangeDetectionStrategy, output, viewChild, ElementRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CitaService, Cita } from '../../../core/services/cita.service';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';

@Component({
  selector: 'app-cita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  // Buscador reactivo de pacientes
  readonly searchControl = new FormControl('');
  readonly patients$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => from(this.patientService.getPatients(term || '')))
  );

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
      
      // Buscar paciente correspondiente
      if (cita.paciente_id) {
        this.patientService.getPatients('').then((list) => {
          const p = list.find((item) => item.id === cita.paciente_id);
          if (p) this.selectPatient(p);
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
      this.searchControl.setValue('');
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

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.searchControl.setValue(patient.nombre_completo);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.selectedPatient()) return;

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
      this.saveSuccess.emit();
      this.close();
    } catch (err) {
      console.error(err);
    }
  }

  async onDelete(): Promise<void> {
    const id = this.selectedCitaId();
    if (!id) return;
    try {
      await this.citaService.deleteCita(id);
      this.saveSuccess.emit();
      this.close();
    } catch (err) {
      console.error(err);
    }
  }
}
```

- [ ] **Step 2: Crear HTML de CitaModalComponent**

```html
<dialog #dialogRef class="backdrop:bg-black/50 p-0 rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full bg-white transition-all overflow-hidden focus:outline-none">
  <header class="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
    <h3 class="text-lg font-bold text-neutral-900">
      {{ isEditing() ? 'Editar Cita' : 'Nueva Cita' }}
    </h3>
    <button (click)="close()" class="text-neutral-400 hover:text-neutral-600">&times;</button>
  </header>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
    <!-- Buscador de Pacientes -->
    <div>
      <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Paciente</label>
      @if (selectedPatient()) {
        <div class="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl p-3">
          <div>
            <h5 class="text-sm font-semibold text-sky-900">{{ selectedPatient()?.nombre_completo }}</h5>
            <span class="text-xs text-sky-700">Documento: {{ selectedPatient()?.numero_documento }}</span>
          </div>
          <button type="button" (click)="selectedPatient.set(null)" class="text-xs text-red-600 font-bold hover:underline">Cambiar</button>
        </div>
      } @else {
        <input type="text" [formControl]="searchControl" placeholder="Buscar paciente por nombre o documento..." class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
        
        @if (searchControl.value) {
          <div class="bg-white border border-neutral-200 rounded-xl mt-1.5 max-h-48 overflow-y-auto divide-y divide-neutral-100 shadow-lg">
            @for (p of patients$ | async; track p.id) {
              <div (click)="selectPatient(p)" class="p-3 hover:bg-neutral-50 cursor-pointer text-sm">
                <p class="font-bold text-neutral-800">{{ p.nombre_completo }}</p>
                <p class="text-xs text-neutral-500">Doc: {{ p.numero_documento }}</p>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Fecha y Hora -->
    <div>
      <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Fecha y Hora</label>
      <input type="datetime-local" formControlName="fecha_hora" class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
    </div>

    <!-- Duración y Tratamiento -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Duración (min)</label>
        <input type="number" formControlName="duracion_minutos" class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
      </div>
      <div>
        <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Tratamiento</label>
        <input type="text" formControlName="tipo_tratamiento" placeholder="Ej. Calza, Limpieza" class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
      </div>
    </div>

    <!-- Estado y Canal de origen -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Estado</label>
        <select formControlName="estado" class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="atendida">Atendida</option>
          <option value="cancelada">Cancelada</option>
          <option value="no_asistio">No asistió</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Canal</label>
        <select formControlName="canal_origen" class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
          <option value="manual">Manual</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="portal">Portal</option>
        </select>
      </div>
    </div>

    <!-- Notas -->
    <div>
      <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Notas</label>
      <textarea formControlName="notes" rows="2" placeholder="Notas adicionales..." class="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"></textarea>
    </div>

    <!-- Acciones -->
    <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100">
      @if (isEditing()) {
        <button type="button" (click)="onDelete()" class="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition-colors mr-auto">
          Eliminar
        </button>
      }
      <button type="button" (click)="close()" class="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm transition-colors">
        Cancelar
      </button>
      <button type="submit" [disabled]="form.invalid || !selectedPatient()" class="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
        Guardar
      </button>
    </div>
  </form>
</dialog>
```

- [ ] **Step 3: Crear SCSS de CitaModalComponent**

```scss
:host {
  display: block;
}
```

- [ ] **Step 4: Compilar y validar el modal**

Run: `npx ng build --configuration development`
Expected: DONE (0 errors)

- [ ] **Step 5: Commit**

```bash
git add src/app/features/citas/cita-modal/
git commit -m "feat: implement CitaModalComponent with reactive patient autocomplete"
```
