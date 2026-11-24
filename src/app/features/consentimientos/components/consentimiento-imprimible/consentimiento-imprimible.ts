import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-consentimiento-imprimible',
  standalone: true,
  templateUrl: './consentimiento-imprimible.html',
  styleUrl: './consentimiento-imprimible.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentimientoImprimibleComponent {
  readonly titulo = input.required<string>();
  readonly cuerpo = input.required<string>();
  readonly pacienteHeader = input.required<{ nombre: string; documento: string }>();
}
