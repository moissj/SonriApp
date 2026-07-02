import { Component, ChangeDetectionStrategy, input, output, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  title = input<string>('Confirmación');
  message = input<string>('¿Estás seguro de realizar esta acción?');
  confirmText = input<string>('Aceptar');
  cancelText = input<string>('Cancelar');

  confirm = output<void>();
  cancel = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');

  open(): void {
    this.dialog()?.nativeElement.showModal();
  }

  close(): void {
    this.dialog()?.nativeElement.close();
  }

  onConfirm(): void {
    this.confirm.emit();
    this.close();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close();
  }
}
