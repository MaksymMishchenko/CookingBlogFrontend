import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  title = input<string>('Confirm Action');
  message = input<string>('Are you sure you want to perform this action?');
  confirmText = input<string>('Confirm');
  cancelText = input<string>('Cancel');
  confirmButtonType = input<'danger' | 'primary'>('danger');
  maxWidth = input<string>('400px');
  isLoading = input<boolean>(false);

  confirm = output<void>();
  cancel = output<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    if (!this.isLoading()) {
      this.cancel.emit();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && !this.isLoading()) {
      this.cancel.emit();
    }
  }
}