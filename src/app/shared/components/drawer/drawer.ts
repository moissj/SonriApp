import { ChangeDetectionStrategy, Component, ElementRef, effect, input, model, viewChild } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/** Panel lateral derecho. Uso: `<app-drawer [(abierto)]="x" titulo="..."> cuerpo <div pie>acciones</div> </app-drawer>` */
@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrar()' },
  template: `
    @if (abierto()) {
      <div class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/40 motion-safe:animate-[fadeIn_150ms_ease-out]" (click)="cerrar()" aria-hidden="true"></div>
        <section
          #panel
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="titulo() || null"
          class="relative flex h-full w-full sm:max-w-md flex-col bg-white shadow-xl focus:outline-none motion-safe:animate-[drawerIn_200ms_ease-out]"
        >
          <header class="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2">
            <h2 class="text-sm font-semibold text-slate-900">{{ titulo() }}</h2>
            <button
              type="button"
              (click)="cerrar()"
              aria-label="Cerrar"
              class="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <lucide-icon name="x" [size]="18" aria-hidden="true" />
            </button>
          </header>
          <div class="flex-1 overflow-y-auto px-3 py-3"><ng-content /></div>
          <footer class="border-t border-slate-200 px-3 py-2 empty:hidden"><ng-content select="[pie]" /></footer>
        </section>
      </div>
    }
  `,
  styles: `
    @keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `,
})
export class DrawerComponent {
  readonly abierto = model<boolean>(false);
  readonly titulo = input('');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    effect(() => {
      const el = this.panel();
      if (el) queueMicrotask(() => el.nativeElement.focus());
    });
  }

  cerrar(): void {
    if (this.abierto()) this.abierto.set(false);
  }
}
