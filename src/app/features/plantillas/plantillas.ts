import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import {
  PlantillaService,
  Plantilla,
  TipoPlantilla,
} from '../../core/services/plantilla.service';
import { AlertComponent } from '../../shared/components/alert/alert';

interface TipoMeta {
  tipo: TipoPlantilla;
  titulo: string;
  descripcion: string;
  icono: string;
}

/** Placeholders disponibles para insertar en las plantillas */
const PLACEHOLDERS = ['{nombre}', '{fecha}', '{hora}', '{consultorio}'] as const;

@Component({
  selector: 'app-plantillas',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './plantillas.html',
  styleUrl: './plantillas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantillasComponent {
  private readonly plantillaService = inject(PlantillaService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /** Tipo que se está guardando actualmente (para el spinner del botón) */
  readonly savingTipo = signal<TipoPlantilla | null>(null);
  /** Tipo que se acaba de guardar (para el mensaje transitorio de éxito) */
  readonly savedTipo = signal<TipoPlantilla | null>(null);

  readonly placeholders = PLACEHOLDERS;

  /** Metadatos de presentación por cada tipo base de plantilla */
  readonly tiposMeta: TipoMeta[] = [
    {
      tipo: 'confirmacion',
      titulo: 'Confirmación de cita',
      descripcion: 'Se envía cuando confirmas una cita con el paciente.',
      icono: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      tipo: 'recordatorio',
      titulo: 'Recordatorio de cita',
      descripcion: 'Recuérdale al paciente su próxima cita con antelación.',
      icono: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      tipo: 'bienvenida',
      titulo: 'Mensaje de bienvenida',
      descripcion: 'Da la bienvenida a los pacientes nuevos de tu consultorio.',
      icono: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
  ];

  /** Plantillas cargadas indexadas por id de tipo */
  private readonly plantillas = signal<Record<string, Plantilla>>({});

  /** Texto original (para detectar cambios) */
  private readonly originalTexto = signal<Record<string, string>>({});

  /** Texto en edición por tipo */
  readonly editModel = signal<Record<string, string>>({});

  /** Textarea enfocada actualmente, para insertar placeholders en el cursor */
  private focusedTextarea: HTMLTextAreaElement | null = null;
  private focusedTipo: TipoPlantilla | null = null;

  /** Indica si un tipo tiene cambios sin guardar */
  readonly isDirty = computed(() => {
    const edit = this.editModel();
    const original = this.originalTexto();
    return (tipo: TipoPlantilla) => (edit[tipo] ?? '') !== (original[tipo] ?? '');
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const lista = await this.plantillaService.loadOrSeed();
      const porTipo: Record<string, Plantilla> = {};
      const textos: Record<string, string> = {};
      for (const p of lista) {
        porTipo[p.tipo] = p;
        textos[p.tipo] = p.texto;
      }
      this.plantillas.set(porTipo);
      this.originalTexto.set(textos);
      this.editModel.set({ ...textos });
    } catch (err) {
      console.error('Error cargando plantillas:', err);
      this.errorMessage.set('No pudimos cargar tus plantillas. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  onInput(tipo: TipoPlantilla, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.editModel.update((prev) => ({ ...prev, [tipo]: value }));
    this.savedTipo.set(null);
  }

  onFocus(tipo: TipoPlantilla, event: FocusEvent): void {
    this.focusedTextarea = event.target as HTMLTextAreaElement;
    this.focusedTipo = tipo;
  }

  /** Inserta un placeholder en la posición del cursor de la plantilla indicada */
  insertPlaceholder(tipo: TipoPlantilla, placeholder: string): void {
    const current = this.editModel()[tipo] ?? '';

    // Si la textarea de este tipo está enfocada, insertar en el cursor
    if (this.focusedTipo === tipo && this.focusedTextarea) {
      const el = this.focusedTextarea;
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;
      const nuevo = current.slice(0, start) + placeholder + current.slice(end);
      this.editModel.update((prev) => ({ ...prev, [tipo]: nuevo }));

      // Reposicionar el cursor después del placeholder insertado
      queueMicrotask(() => {
        const pos = start + placeholder.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      });
    } else {
      // Si no está enfocada, añadir al final con un espacio
      const sep = current.length > 0 && !current.endsWith(' ') ? ' ' : '';
      this.editModel.update((prev) => ({ ...prev, [tipo]: current + sep + placeholder }));
    }
    this.savedTipo.set(null);
  }

  async save(tipo: TipoPlantilla): Promise<void> {
    const plantilla = this.plantillas()[tipo];
    if (!plantilla) return;

    this.savingTipo.set(tipo);
    this.errorMessage.set(null);
    try {
      const texto = this.editModel()[tipo] ?? '';
      await this.plantillaService.updatePlantilla(plantilla.id, texto);
      this.originalTexto.update((prev) => ({ ...prev, [tipo]: texto }));
      this.savedTipo.set(tipo);
    } catch (err) {
      console.error('Error guardando plantilla:', err);
      this.errorMessage.set('No se pudo guardar la plantilla. Intenta de nuevo.');
    } finally {
      this.savingTipo.set(null);
    }
  }

  /** Restaura el texto editado al último valor guardado */
  reset(tipo: TipoPlantilla): void {
    const original = this.originalTexto()[tipo] ?? '';
    this.editModel.update((prev) => ({ ...prev, [tipo]: original }));
    this.savedTipo.set(null);
  }
}
