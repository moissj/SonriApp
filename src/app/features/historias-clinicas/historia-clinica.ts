import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
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
  imports: [CardComponent, EmptyStateComponent, EvolucionesComponent, OdontogramaComponent, ExamenIngresoComponent],
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

  pacienteId!: string;

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

  goBack(): void {
    this.location.back();
  }
}
