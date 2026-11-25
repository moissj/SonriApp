import { LucideAngularModule } from 'lucide-angular';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
  Injector,
  afterNextRender,
  effect,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  HistoriasClinicasService,
  CabeceraPaciente,
} from '../../core/services/historias-clinicas.service';
import { CardComponent } from '../../shared/components/card/card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { EvolucionesComponent } from './evoluciones/evoluciones';
import { OdontogramaComponent } from '../pacientes/detalle/odontograma/odontograma';
import { ExamenIngresoComponent } from './examen-ingreso/examen-ingreso';

@Component({
  selector: 'app-historia-clinica-completa',
  standalone: true,
  imports: [LucideAngularModule, CardComponent, EmptyStateComponent, EvolucionesComponent, OdontogramaComponent, ExamenIngresoComponent],
  templateUrl: './historia-clinica.html',
  styleUrl: './historia-clinica.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoriaClinicaCompletaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly historiasService = inject(HistoriasClinicasService);

  readonly paciente = signal<CabeceraPaciente | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly secciones = [
    { id: 'examen-ingreso', etiqueta: 'Examen de ingreso' },
    { id: 'evoluciones', etiqueta: 'Evoluciones' },
    { id: 'ayudas-diagnosticas', etiqueta: 'Ayudas diagnósticas' },
    { id: 'odontograma', etiqueta: 'Odontograma' },
    { id: 'consentimiento', etiqueta: 'Consentimiento' },
  ] as const;
  readonly seccionActiva = signal<string>('examen-ingreso');

  private readonly injector = inject(Injector);
  private observer?: IntersectionObserver;

  pacienteId!: string;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
    effect(() => {
      if (!this.paciente()) return;
      afterNextRender(() => this.observarSecciones(), { injector: this.injector });
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('pacienteId');
    if (!id) {
      this.error.set('Paciente no válido.');
      this.loading.set(false);
      return;
    }
    this.pacienteId = id;
    this.loadCabecera();
  }

  private async loadCabecera(): Promise<void> {
    this.loading.set(true);
    try {
      this.paciente.set(await this.historiasService.getCabeceraPaciente(this.pacienteId));
    } catch (err) {
      console.error('Error cargando la cabecera del paciente:', err);
      this.error.set('No se pudo cargar la información del paciente.');
    } finally {
      this.loading.set(false);
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  getAge(birthdate: string | null | undefined): number | null {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  irASeccion(event: Event, id: string): void {
    event.preventDefault();
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
    this.seccionActiva.set(id);
  }

  private observarSecciones(): void {
    this.observer?.disconnect();
    // Franja superior (bajo cabecera+índice) como zona de "sección actual".
    this.observer = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.find((e) => e.isIntersecting);
        if (visible) this.seccionActiva.set(visible.target.id);
      },
      { rootMargin: '-140px 0px -60% 0px' },
    );
    for (const s of this.secciones) {
      const el = document.getElementById(s.id);
      if (el) this.observer.observe(el);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
