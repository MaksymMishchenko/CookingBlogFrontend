import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageService, UploadImageResponse } from '../../../../shared/services/image/image.service';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';
import { VALIDATION_MESSAGES } from '../../../../core/constants/validation.constants';
import { ValidationError } from '../../../../shared/services/error/error.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { INSERT_IMAGE_MODAL_TEXTS } from './insert-image-modal.constants';
import { UI_COMMON_BUTTONS } from '../../../../core/constants/ui-messages.constants';
import { ALLOWED_IMAGE_TYPES, imageMaxSize, imageType, MAX_IMAGE_SIZE_BYTES } from '../../../../shared/validators/image.validators';

@Component({
  selector: 'app-insert-image-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './insert-image-modal.component.html',
  styleUrls: ['./insert-image-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsertImageModalComponent {
  private fb = inject(NonNullableFormBuilder);
  private imageService = inject(ImageService);
  private destroyRef = inject(DestroyRef);

  public serverError = signal<string | null>(null);
  public altServerError = signal<string | null>(null);

  public closeModal = output<void>();
  public imageUploaded = output<UploadImageResponse>();

  public isSubmitting = signal(false);
  protected readonly msg = VALIDATION_MESSAGES;
  protected readonly texts = INSERT_IMAGE_MODAL_TEXTS;
  protected readonly buttons = UI_COMMON_BUTTONS;

  public form = this.fb.group({
    contentImage: [null as File | null,
    [
      Validators.required,
      imageMaxSize(MAX_IMAGE_SIZE_BYTES),
      imageType(ALLOWED_IMAGE_TYPES)
    ]],
    alt: ['', [Validators.minLength(3), Validators.maxLength(200)]]
  });

  constructor() {
    this.form.controls.contentImage.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.serverError.set(null));

    this.form.controls.alt.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.altServerError.set(null));
  }

  public onClose(): void {
    if (this.isSubmitting()) return;
    this.closeModal.emit();
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const file = this.form.controls.contentImage.value!;
    const alt = this.form.controls.alt.value;

    this.isSubmitting.set(true);
    this.serverError.set(null);
    this.altServerError.set(null);

    this.imageService.uploadContentImage(file, alt)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: UploadImageResponse) => {
          this.isSubmitting.set(false);
          this.imageUploaded.emit(response);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.applyServerError(error);
        }
      });
  }

  private applyServerError(err: unknown) {
    this.serverError.set(null);
    this.altServerError.set(null);

    if (err instanceof ValidationError) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        for (const [key, messages] of Object.entries(err.errors)) {
          if (!messages?.length) continue;

          const errorText = messages.join(' ');
          const normalizedKey = key.toLowerCase();

          if (normalizedKey === 'contentimage') {
            this.serverError.set(errorText);
            this.form.controls.contentImage.markAsTouched();
          } else if (normalizedKey === 'alt') {
            this.altServerError.set(errorText);
            this.form.controls.alt.markAsTouched();
          }
        }
      }
    }
  }

  public onFileCleared(): void {
    this.serverError.set(null);
  }
}