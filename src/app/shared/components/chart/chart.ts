import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  input,
  viewChild,
  effect,
  OnDestroy,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Envoltura reutilizable de Chart.js. Recibe una configuración de Chart.js
 * y renderiza/actualiza el gráfico. Dale altura desde el contenedor padre.
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnDestroy {
  readonly config = input.required<ChartConfiguration>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    effect(() => {
      const cfg = this.config();
      const canvas = this.canvasRef();
      if (!canvas) return;

      if (this.chart) {
        this.chart.data = cfg.data;
        this.chart.options = cfg.options ?? {};
        this.chart.update();
      } else {
        this.chart = new Chart(canvas.nativeElement, cfg);
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
