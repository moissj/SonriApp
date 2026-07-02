import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  viewChild,
  ElementRef,
} from '@angular/core';

/**
 * Modal genérico reutilizable basado en el elemento nativo <dialog>.
 * Proyecta contenido libre (formularios, etc.) mediante <ng-content>.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  title = input<string>('');

  closed = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');

  open(): void {
    this.dialog()?.nativeElement.showModal();
  }

  close(): void {
    this.dialog()?.nativeElement.close();
    this.closed.emit();
  }
}
