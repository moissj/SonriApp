import { ChangeDetectionStrategy, Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';
import { InputComponent } from '../../../../shared/components/input/input';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { CatalogoConsentimiento } from '../../models/consentimiento.model';
import { CatalogoConsentimientoService } from '../../services/catalogo-consentimiento.service';

@Component({
  selector: 'app-catalogo-admin',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, ConfirmModalComponent, InputComponent],
  templateUrl: './catalogo-admin.html',
  styleUrl: './catalogo-admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogoAdminComponent implements OnInit {
  private readonly servicio = inject(CatalogoConsentimientoService);
  private readonly modal = viewChild.required<ModalComponent>('modalForm');
  private readonly confirmar = viewChild.required<ConfirmModalComponent>('confirmarEstado');

  readonly items = signal<CatalogoConsentimiento[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorGuardar = signal('');
  readonly guardando = signal(false);
  readonly editando = signal<CatalogoConsentimiento | null>(null);
  readonly objetivo = signal<CatalogoConsentimiento | null>(null);

  readonly form = new FormGroup({
    tipo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)] }),
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cuerpo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set('');
    try {
      this.items.set(await this.servicio.listarTodos());
    } catch {
      this.errorCarga.set('No se pudo cargar el catálogo.');
    } finally {
      this.cargando.set(false);
    }
  }

  abrir(item: CatalogoConsentimiento | null): void {
    this.editando.set(item);
    this.errorGuardar.set('');
    this.form.reset({ tipo: item?.tipo ?? '', titulo: item?.titulo ?? '', cuerpo: item?.cuerpo ?? '' });
    if (item) this.form.controls.tipo.disable();
    else this.form.controls.tipo.enable();
    this.modal().open();
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorGuardar.set('');
    const { tipo, titulo, cuerpo } = this.form.getRawValue();
    const actual = this.editando();
    try {
      if (actual) await this.servicio.editar(actual.id, { titulo, cuerpo });
      else await this.servicio.crear({ tipo, titulo, cuerpo });
      this.modal().close();
      await this.cargar();
    } catch {
      this.errorGuardar.set('No se pudo guardar. Intenta de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }

  pedirCambioEstado(item: CatalogoConsentimiento): void {
    this.objetivo.set(item);
    this.confirmar().open();
  }

  async confirmarCambioEstado(): Promise<void> {
    const item = this.objetivo();
    if (!item) return;
    try {
      await this.servicio.activar(item.id, !item.activo);
      await this.cargar();
    } catch {
      this.errorCarga.set('No se pudo cambiar el estado.');
    }
  }
}
