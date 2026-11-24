import { Component, ChangeDetectionStrategy, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AnomaliasPosicion,
  ExploracionFacial,
  LateralidadMordida,
} from '../examen-ingreso.service';

/** Claves de ExploracionFacial cuyo valor es string | null (S/N o enumeración). */
type ClaveValor = {
  [K in keyof ExploracionFacial]: ExploracionFacial[K] extends string | null ? K : never;
}[keyof ExploracionFacial];
type ClaveMordida = 'mordida_abierta' | 'mordida_cruzada' | 'mordida_profunda';
type ClaveAnomalia = Exclude<keyof AnomaliasPosicion, 'descripcion'>;

interface Opcion { v: string; l: string }
interface CampoSelect { key: ClaveValor; label: string; opciones: Opcion[] }
interface CampoSiNo { key: ClaveValor; label: string }

@Component({
  selector: 'app-exploracion-facial',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './exploracion-facial.html',
  styleUrl: './exploracion-facial.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploracionFacialComponent {
  readonly exploracionFacial = model.required<ExploracionFacial>();

  readonly selectsPerfil: CampoSelect[] = [
    { key: 'perfil', label: 'Perfil', opciones: [
      { v: 'recto', l: 'Recto' }, { v: 'concavo', l: 'Cóncavo' }, { v: 'convexo', l: 'Convexo' }] },
    { key: 'forma_cara', label: 'Forma de cara', opciones: [
      { v: 'redonda', l: 'Redonda' }, { v: 'ovalada', l: 'Ovalada' }, { v: 'cuadrada', l: 'Cuadrada' }] },
    { key: 'patron_crecimiento', label: 'Patrón de crecimiento', opciones: [
      { v: 'normo', l: 'Normo' }, { v: 'dolico', l: 'Dólico' }, { v: 'braqui', l: 'Braqui' }] },
    { key: 'nariz', label: 'Nariz', opciones: [
      { v: 'recta', l: 'Recta' }, { v: 'desviacion', l: 'Desviación' }] },
    { key: 'menton', label: 'Mentón', opciones: [
      { v: 'normal', l: 'Normal' }, { v: 'hipotonico', l: 'Hipotónico' }, { v: 'hipertonico', l: 'Hipertónico' }] },
  ];

  readonly selectsOclusion: CampoSelect[] = [
    { key: 'planos_terminales', label: 'Planos terminales', opciones: [
      { v: 'escalon_recto', l: 'Escalón recto' }, { v: 'escalon_mesial', l: 'Escalón mesial' },
      { v: 'escalon_distal', l: 'Escalón distal' }] },
    { key: 'tipo_denticion', label: 'Tipo de dentición', opciones: [
      { v: 'temporal', l: 'Temporal' }, { v: 'mixta', l: 'Mixta' }, { v: 'permanente', l: 'Permanente' }] },
  ];

  readonly siNo: CampoSiNo[] = [
    { key: 'asimetria_facial', label: 'Asimetría facial' },
    { key: 'respirador_oral', label: 'Respirador oral' },
    { key: 'ronca', label: 'Ronca' },
    { key: 'apnea_sueno', label: 'Apnea del sueño' },
    { key: 'uso_cpap', label: 'Uso de CPAP' },
    { key: 'aparato_removible_no_cpap', label: 'Aparato removible (no CPAP)' },
    { key: 'ojeras', label: 'Ojeras' },
  ];

  readonly apneaOpciones: Opcion[] = [
    { v: 'si', l: 'S' }, { v: 'no', l: 'N' }, { v: 'alterada', l: 'A' },
  ];

  readonly mordidas: { key: ClaveMordida; label: string }[] = [
    { key: 'mordida_abierta', label: 'Mordida abierta' },
    { key: 'mordida_cruzada', label: 'Mordida cruzada' },
    { key: 'mordida_profunda', label: 'Mordida profunda' },
  ];

  readonly lateralidades: { sub: 'anterior' | 'posterior' | 'izquierda' | 'derecha'; label: string }[] = [
    { sub: 'anterior', label: 'Anterior' },
    { sub: 'posterior', label: 'Posterior' },
    { sub: 'izquierda', label: 'Izquierda' },
    { sub: 'derecha', label: 'Derecha' },
  ];

  readonly anomalias: { key: ClaveAnomalia; label: string }[] = [
    { key: 'rotaciones', label: 'Rotaciones' },
    { key: 'diastemas', label: 'Diastemas' },
    { key: 'translocaciones', label: 'Translocaciones' },
    { key: 'giroversiones', label: 'Giroversiones' },
    { key: 'ausencias', label: 'Ausencias' },
    { key: 'retenidos', label: 'Retenidos' },
    { key: 'apinamientos', label: 'Apiñamientos' },
  ];

  patch<K extends keyof ExploracionFacial>(key: K, valor: ExploracionFacial[K]): void {
    this.exploracionFacial.update((prev) => ({ ...prev, [key]: valor }));
  }

  /** Tri-estado: pulsar de nuevo el valor activo vuelve a null (no evaluado). */
  toggle(key: ClaveValor, v: string): void {
    this.patch(key, this.exploracionFacial()[key] === v ? null : v);
  }

  patchMordida<S extends keyof LateralidadMordida>(
    key: ClaveMordida, sub: S, valor: LateralidadMordida[S],
  ): void {
    this.patch(key, { ...this.exploracionFacial()[key], [sub]: valor });
  }

  toggleMordida(key: ClaveMordida, v: string): void {
    const actual = this.exploracionFacial()[key].valor;
    this.patchMordida(key, 'valor', actual === v ? null : v);
  }

  patchAnomalia<K extends keyof AnomaliasPosicion>(key: K, valor: AnomaliasPosicion[K]): void {
    this.patch('anomalias', { ...this.exploracionFacial().anomalias, [key]: valor });
  }

  toggleAnomalia(key: ClaveAnomalia, v: string): void {
    const actual = this.exploracionFacial().anomalias[key];
    this.patchAnomalia(key, actual === v ? null : v);
  }
}
