import { NgClass } from '@angular/common';
import { HttpStatusCode } from '@angular/common/http';
import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CategoryListDto } from '../../../../shared/services/category/category.interface';
import { CreatePostRequest, PostAdminDetailsDto } from '../../../../shared/interfaces/post.interface';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';
import { ALLOWED_IMAGE_TYPES, imageMaxSize, imageType, MAX_IMAGE_SIZE_BYTES } from '../../../../shared/validators/image.validators';
import { BusinessError, ValidationError } from '../../../../shared/services/error/error.types';
import { BACKEND_ERROR_CODES } from '../../../../shared/services/error/error-codes';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, QuillModule, ImageUploadComponent],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss'
})
export class PostFormComponent {
  private fb = inject(NonNullableFormBuilder);

  public categories = input<CategoryListDto[]>([]);
  public postData = input<PostAdminDetailsDto | null>(null);
  public disabled = input<boolean>(false);
  public mode = input<'create' | 'edit'>('create');
  public serverError = input<unknown>(null);
  
  protected fieldServerErrors = signal<Record<string, string>>({});
  
  private readonly businessErrorFieldMap: Record<string, string> = {
    [BACKEND_ERROR_CODES.POST.TITLE_ALREADY_EXISTS]: 'title',
    [BACKEND_ERROR_CODES.POST.SLUG_ALREADY_EXISTS]: 'slug'
  };

  public postSubmit = output<CreatePostRequest>();
  public formCancel = output<void>();

  protected submitLabel = computed(() =>
    this.mode() === 'edit' ? 'Update post' : 'Create post'
  );

  protected form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    content: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(50000)]],
    previewImage: [null as File | string | null, [
      Validators.required,
      imageMaxSize(MAX_IMAGE_SIZE_BYTES),
      imageType(ALLOWED_IMAGE_TYPES)
    ]],
    previewImageAlt: ['', [Validators.minLength(3), Validators.maxLength(200)]],
    metaTitle: ['', [Validators.minLength(10), Validators.maxLength(100)]],
    metaDescription: ['', [Validators.minLength(70), Validators.maxLength(200)]],
    slug: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    ]],
    categoryId: [null as number | null, [Validators.required]],
    isActive: [true as boolean]
  });

  constructor() {
    effect(() => {
      const err = this.serverError();
      untracked(() => this.applyServerError(err));
    });

    effect(() => {
      const data = this.postData();
      if (data) {
        this.form.patchValue({
          title: data.title,
          description: data.description,
          content: data.content,
          previewImage: data.previewImageUrl ?? null,
          previewImageAlt: data.previewImageAlt ?? '',
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          slug: data.slug,
          categoryId: data.categoryId,
          isActive: data.isActive
        });
      }
    }, { allowSignalWrites: true });
    
    Object.keys(this.form.controls).forEach(controlName => {
      const control = this.form.get(controlName);
      control?.valueChanges.subscribe(() => {
        if (this.fieldServerErrors()[controlName]) {
          this.fieldServerErrors.update(errors => {
            const copy = { ...errors };
            delete copy[controlName];
            return copy;
          });
        }
      });
    });
  }

  private applyServerError(err: unknown) {
    this.fieldServerErrors.set({});

    if (!err) return;
    const newFieldErrors: Record<string, string> = {};

    if (err instanceof ValidationError) {
      if (err.status === HttpStatusCode.PayloadTooLarge) return;

      if (err.errors && Object.keys(err.errors).length > 0) {
        for (const [key, messages] of Object.entries(err.errors)) {
          if (!messages?.length) continue;

          const controlName = key.charAt(0).toLowerCase() + key.slice(1);
          const ctrl = this.form.get(controlName);

          if (ctrl) {
            newFieldErrors[controlName] = messages[0];
            ctrl.markAsTouched();
          }
        }
      }
    } else if (err instanceof BusinessError) {
      const controlName = err.errorCode
        ? this.businessErrorFieldMap[err.errorCode]
        : undefined;

      if (controlName) {
        newFieldErrors[controlName] = err.message;
        this.form.get(controlName)?.markAsTouched();
      }
    }

    this.fieldServerErrors.set(newFieldErrors);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { previewImage, ...fields } = this.form.getRawValue();

    this.postSubmit.emit({
      ...fields,
      categoryId: fields.categoryId as number,
      previewImage: previewImage instanceof File ? previewImage : null
    });
  }

  onCancel() {
    this.formCancel.emit();
  }
}
