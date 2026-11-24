import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EpsService, Eps, RegimenEps } from '../../core/services/eps.service';
import { CardComponent } from '../../shared/components/card/card';
import { AlertComponent } from '../../shared/components/alert/alert';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-configuracion-eps',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, AlertComponent, EmptyStateComponent],
  templateUrl: './configuracion-eps.html',
  styleUrl: './configuracion-eps.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionEpsComponent implements OnInit {
  private readonly epsService = inject(EpsService);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  readonly eps = signal<Eps[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly seeding = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly contributivas = computed(() => this.eps().filter((e) => e.regimen === 'contributivo'));
  readonly subsidiadas = computed(() => this.eps().filter((e) => e.regimen === 'subsidiado'));
  readonly especiales = computed(() => this.eps().filter((e) => e.regimen === 'especial'));

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    regimen: ['contributivo' as RegimenEps, [Validators.required]],
  });

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.eps.set(await this.epsService.getAllEps());
    } catch (err) {
      console.error('Error cargando EPS:', err);
      this.error.set('No se pudo cargar el catálogo de EPS.');
    } finally {
      this.loading.set(false);
    }
  }

  async agregar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      const { nombre, regimen } = this.form.getRawValue();
      const nueva = await this.epsService.addEps(nombre, regimen);
      this.eps.update((prev) => [...prev, nueva]);
      this.form.reset({ nombre: '', regimen });
      this.success.set('EPS agregada al catálogo.');
    } catch (err: any) {
      console.error('Error agregando EPS:', err);
      if (err.code === '23505') {
        this.error.set('Esa EPS ya existe en ese régimen.');
      } else {
        this.error.set('No se pudo agregar la EPS.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActiva(e: Eps): Promise<void> {
    const nuevo = !e.activa;
    try {
      await this.epsService.setActiva(e.id, nuevo);
      this.eps.update((prev) => prev.map((x) => (x.id === e.id ? { ...x, activa: nuevo } : x)));
    } catch (err) {
      console.error('Error actualizando EPS:', err);
      this.error.set('No se pudo actualizar la EPS.');
    }
  }

  async cargarComunes(): Promise<void> {
    this.seeding.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      const n = await this.epsService.seedComunes();
      if (n > 0) {
        this.eps.set(await this.epsService.getAllEps());
        this.success.set(`Se cargaron ${n} EPS al catálogo.`);
      } else {
        this.success.set('Ya tenías todas las EPS del set base.');
      }
    } catch (err) {
      console.error('Error cargando EPS comunes:', err);
      this.error.set('No se pudo cargar el set base de EPS.');
    } finally {
      this.seeding.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
