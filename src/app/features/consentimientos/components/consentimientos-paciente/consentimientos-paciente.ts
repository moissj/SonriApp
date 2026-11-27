import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { AlertComponent } from '../../../../shared/components/alert/alert';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';
import { CatalogoConsentimiento, ConsentimientoPaciente } from '../../models/consentimiento.model';
import { ConsentimientoService } from '../../services/consentimiento.service';
import { CatalogoConsentimientoService } from '../../services/catalogo-consentimiento.service';
import { validarArchivoConsentimiento } from '../../funciones/validar-archivo.funcion';
import { ConsentimientoImprimibleComponent } from '../consentimiento-imprimible/consentimiento-imprimible';

const hoyBogota = (): string => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());

@Component({
  selector: 'app-consentimientos-paciente',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    AlertComponent,
    EmptyStateComponent,
    ConfirmModalComponent,
    ConsentimientoImprimibleComponent,
  ],
  templateUrl: './consentimientos-paciente.html',
  styleUrl: './consentimientos-paciente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentimientosPacienteComponent implements OnInit {
  private readonly servicio = inject(ConsentimientoService);
  private readonly catalogoServicio = inject(CatalogoConsentimientoService);

  readonly pacienteId = input.required<string>();
  readonly paciente = input<{ nombre: string; documento: string }>({ nombre: '', documento: '' });

  readonly lista = signal<ConsentimientoPaciente[]>([]);
  readonly catalogo = signal<CatalogoConsentimiento[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);
  readonly subiendo = signal(false);
  readonly nuevo = signal(false);
  readonly seleccionado = signal<CatalogoConsentimiento | null>(null);
  readonly anulando = signal<ConsentimientoPaciente | null>(null);

  catalogoId = '';
  fechaFirma = hoyBogota();
  motivo = '';
  private archivo: File | null = null;
  private readonly modal = viewChild.required(ConfirmModalComponent);

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [lista, catalogo] = await Promise.all([
        this.servicio.listarPorPaciente(this.pacienteId()),
        this.catalogoServicio.listarActivos(),
      ]);
      this.lista.set(lista);
      this.catalogo.set(catalogo);
    } catch {
      this.error.set('No se pudieron cargar los consentimientos.');
    } finally {
      this.cargando.set(false);
    }
  }

  elegirCatalogo(id: string): void {
    this.seleccionado.set(this.catalogo().find((c) => c.id === id) ?? null);
  }

  elegirArchivo(ev: Event): void {
    this.archivo = (ev.target as HTMLInputElement).files?.[0] ?? null;
  }

  imprimir(): void {
    // Aísla la impresión al consentimiento (no arrastra el odontograma de la misma ficha)
    document.body.classList.add('print-consentimiento');
    const limpiar = (): void => {
      document.body.classList.remove('print-consentimiento');
      window.removeEventListener('afterprint', limpiar);
    };
    window.addEventListener('afterprint', limpiar);
    window.print();
  }

  async subir(): Promise<void> {
    const catalogo = this.seleccionado();
    const archivo = this.archivo;
    if (!catalogo || !archivo || !this.fechaFirma) return this.errorAccion.set('Selecciona formato, archivo y fecha.');
    const v = validarArchivoConsentimiento(archivo);
    if (!v.ok) return this.errorAccion.set(v.error ?? 'Archivo no válido.');
    this.subiendo.set(true);
    this.errorAccion.set(null);
    try {
      const creado = await this.servicio.subir({ pacienteId: this.pacienteId(), catalogo, archivo, fechaFirma: this.fechaFirma });
      this.lista.update((l) => [creado, ...l]);
      this.cerrarNuevo();
    } catch {
      this.errorAccion.set('No se pudo subir el consentimiento. Inténtalo de nuevo.');
    } finally {
      this.subiendo.set(false);
    }
  }

  private cerrarNuevo(): void {
    this.nuevo.set(false);
    this.seleccionado.set(null);
    this.catalogoId = '';
    this.archivo = null;
    this.fechaFirma = hoyBogota();
  }

  async ver(c: ConsentimientoPaciente): Promise<void> {
    this.errorAccion.set(null);
    try {
      window.open(await this.servicio.urlFirmada(c.archivoPath), '_blank', 'noopener');
    } catch {
      this.errorAccion.set('No se pudo abrir el archivo.');
    }
  }

  pedirAnular(c: ConsentimientoPaciente): void {
    this.anulando.set(c);
    this.motivo = '';
  }

  confirmarAnular(): void {
    if (this.motivo.trim()) this.modal().open();
  }

  async anular(): Promise<void> {
    const c = this.anulando();
    if (!c) return;
    try {
      await this.servicio.anular(c.id, this.motivo);
      this.lista.update((l) => l.map((x) => (x.id === c.id ? { ...x, estado: 'anulado', motivoAnulacion: this.motivo.trim() } : x)));
      this.anulando.set(null);
    } catch {
      this.errorAccion.set('No se pudo anular el consentimiento.');
    }
  }

  fecha(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
