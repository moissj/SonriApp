import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  WritableSignal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ExamenIngresoService,
  ChecklistEntry,
  ExploracionFacial,
  HistoriaDental,
  HistoriaClinicaInicial,
} from './examen-ingreso.service';
import {
  ANTECEDENTES_NOMBRES,
  TEJIDOS_NOMBRES,
  DEFAULT_HISTORIA_DENTAL,
  DEFAULT_EXPLORACION_FACIAL,
  buildDefaultChecklist,
} from './examen-ingreso.constantes';
import { ChecklistItemComponent } from './checklist-item/checklist-item';
import { ExploracionFacialComponent } from './exploracion-facial/exploracion-facial';
import { aplicarTodosHd } from './funciones/aplicar-todos-hd.funcion';

@Component({
  selector: 'app-examen-ingreso',
  standalone: true,
  imports: [FormsModule, ChecklistItemComponent, ExploracionFacialComponent],
  templateUrl: './examen-ingreso.html',
  styleUrl: './examen-ingreso.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenIngresoComponent implements OnInit {
  private readonly svc = inject(ExamenIngresoService);

  readonly pacienteId = input.required<string>();

  readonly loading = signal(true);
  readonly saving  = signal(false);
  readonly saved   = signal(false);
  readonly error   = signal<string | null>(null);

  // ── State signals para cada sección ─────────────────────────────────────

  readonly antecedentes = signal<ChecklistEntry[]>(
    buildDefaultChecklist(ANTECEDENTES_NOMBRES)
  );
  readonly obsAntecedentes = signal('');
  readonly tomaPresion     = signal('');
  readonly temperatura     = signal<string>('');

  readonly tejidos = signal<ChecklistEntry[]>(
    buildDefaultChecklist(TEJIDOS_NOMBRES)
  );
  readonly obsTejidos = signal('');

  readonly respiracion = signal<string | null>(null);
  readonly deglucion   = signal<string | null>(null);
  readonly fonacion    = signal<string | null>(null);
  readonly succion     = signal<string | null>(null);

  readonly hd = signal<HistoriaDental>({ ...DEFAULT_HISTORIA_DENTAL });
  readonly exploracionFacial = signal<ExploracionFacial>({ ...DEFAULT_EXPLORACION_FACIAL });
  readonly planTratamiento = signal('');

  patchEntry(list: WritableSignal<ChecklistEntry[]>, idx: number, patch: Partial<ChecklistEntry>): void {
    list.update((l) => l.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  }

  patchHd(field: keyof HistoriaDental, patch: Partial<HistoriaDental[keyof HistoriaDental]>): void {
    this.hd.update((prev) => ({
      ...prev,
      [field]: { ...prev[field], ...patch },
    }));
  }

  setAllAntecedentes(valor: 'si' | 'no'): void {
    this.antecedentes.update((list) => list.map((e) => ({ ...e, valor })));
  }

  setAllTejidos(valor: 'normal' | 'alterado'): void {
    this.tejidos.update((list) => list.map((e) => ({ ...e, valor })));
  }

  setAllHistoriaDental(valor: 'si' | 'no'): void {
    this.hd.update((prev) => aplicarTodosHd(prev, valor));
  }

  readonly antecedentesNombres = ANTECEDENTES_NOMBRES;
  readonly tejidosNombres      = TEJIDOS_NOMBRES;

  // ── Ciclo de vida ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const hci = await this.svc.getOrNull(this.pacienteId());
      if (hci) this.hydrate(hci);
    } catch (e) {
      console.error(e);
      this.error.set('No se pudo cargar el examen de ingreso.');
    } finally {
      this.loading.set(false);
    }
  }

  private hydrate(hci: HistoriaClinicaInicial): void {
    if (hci.antecedentes_salud?.length) {
      this.antecedentes.set(
        ANTECEDENTES_NOMBRES.map((n, i) => hci.antecedentes_salud[i] ?? { nombre: n, valor: null, observacion: '' })
      );
    }
    this.obsAntecedentes.set(hci.obs_antecedentes ?? '');
    this.tomaPresion.set(hci.toma_presion ?? '');
    this.temperatura.set(hci.temperatura_corporal?.toString() ?? '');

    if (hci.tejidos_blandos?.length) {
      this.tejidos.set(
        TEJIDOS_NOMBRES.map((n, i) => hci.tejidos_blandos[i] ?? { nombre: n, valor: null, observacion: '' })
      );
    }
    this.obsTejidos.set(hci.obs_tejidos_blandos ?? '');
    this.respiracion.set(hci.respiracion ?? null);
    this.deglucion.set(hci.deglucion ?? null);
    this.fonacion.set(hci.fonacion ?? null);
    this.succion.set(hci.succion ?? null);

    if (hci.historia_dental && Object.keys(hci.historia_dental).length) {
      this.hd.set({ ...DEFAULT_HISTORIA_DENTAL, ...hci.historia_dental } as HistoriaDental);
    }
    this.exploracionFacial.set({ ...DEFAULT_EXPLORACION_FACIAL, ...(hci.exploracion_facial ?? {}) });
    this.planTratamiento.set(hci.plan_tratamiento ?? '');
  }

  // ── Guardar ──────────────────────────────────────────────────────────────

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.svc.upsert(this.pacienteId(), {
        antecedentes_salud:  this.antecedentes(),
        obs_antecedentes:    this.obsAntecedentes(),
        toma_presion:        this.tomaPresion(),
        temperatura_corporal: this.temperatura() ? parseFloat(this.temperatura()) : null,
        tejidos_blandos:     this.tejidos(),
        obs_tejidos_blandos: this.obsTejidos(),
        respiracion:         this.respiracion(),
        deglucion:           this.deglucion(),
        fonacion:            this.fonacion(),
        succion:             this.succion(),
        historia_dental:     this.hd(),
        exploracion_facial:  this.exploracionFacial(),
        plan_tratamiento:    this.planTratamiento(),
      });
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    } catch (e) {
      console.error(e);
      this.error.set('Error al guardar. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  // ── Hábitos orales ───────────────────────────────────────────────────────

  readonly habitosOrales: { key: keyof HistoriaDental; label: string }[] = [
    { key: 'succion_digital', label: 'Succión digital' },
    { key: 'habito_lengua',   label: 'Hábito de lengua' },
    { key: 'habito_unas',     label: 'Hábito de comerse las uñas' },
    { key: 'chupete',         label: 'Chupete' },
  ];

  readonly hdExtras: { key: keyof HistoriaDental; label: string; obs?: string }[] = [
    { key: 'supernumerarios', label: 'Supernumerarios', obs: 'Descripción…' },
    { key: 'sellantes',       label: 'Sellantes',       obs: 'Descripción…' },
    { key: 'uso_seda',        label: 'Uso de seda dental' },
    { key: 'uso_enjuague',    label: 'Uso de enjuague bucal', obs: 'Frecuencia…' },
  ];
  readonly vecesDia = ['1', '2', '3', '4', '5', '6'];

  getHdValor(key: keyof HistoriaDental): string | null {
    return this.hd()[key].valor ?? null;
  }

  toggleHdValor(key: keyof HistoriaDental, v: string): void {
    this.patchHd(key, { valor: this.hd()[key].valor === v ? null : v });
  }
}
