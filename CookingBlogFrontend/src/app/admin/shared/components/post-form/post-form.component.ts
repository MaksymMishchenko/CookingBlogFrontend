import { NgClass } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CategoryListDto } from '../../../../shared/services/category/category.interface';
import { CreatePostRequest, PostAdminDetailsDto } from '../../../../shared/interfaces/post.interface';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';
import { ALLOWED_IMAGE_TYPES, imageMaxSize, imageType, MAX_IMAGE_SIZE } from '../../../../shared/validators/image.validators';

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

  public postSubmit = output<CreatePostRequest>();
  public formCancel = output<void>();
  
  public existingImageUrl = signal<string | null>(null);

  protected submitLabel = computed(() =>
    this.mode() === 'edit' ? 'Update post' : 'Create post'
  );

  protected form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    content: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(2500)]],
    image: [null as File | string | null, [
      Validators.required,
      imageMaxSize(MAX_IMAGE_SIZE),
      imageType(ALLOWED_IMAGE_TYPES)
    ]],
    previewImageAlt: ['', Validators.maxLength(200)],
    metaTitle: ['', Validators.maxLength(100)],
    metaDescription: ['', Validators.maxLength(200)],
    slug: ['', [Validators.required, Validators.maxLength(200)]],
    categoryId: [null as number | null, [Validators.required]],
    isActive: [false as boolean, [Validators.required]]
  });

  constructor() {
    effect(() => {
      const data = this.postData();
      if (data) {
        this.form.patchValue({
          title: data.title,
          description: data.description,
          content: data.content,
          image: data.previewImageUrl ?? null, 
          previewImageAlt: data.previewImageAlt ?? '',
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          slug: data.slug,
          categoryId: data.categoryId,
          isActive: data.isActive
        });
        
        this.existingImageUrl.set(data.previewImageUrl ?? null);
      }
    }, { allowSignalWrites: true });
  }
  
  public onImageSelected(file: File | null) {
    const ctrl = this.form.controls.image;
    ctrl.setValue(file);
    ctrl.markAsTouched();
    ctrl.markAsDirty();
    if (file === null) {
      this.existingImageUrl.set(null);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { image, ...fields } = this.form.getRawValue();

    this.postSubmit.emit({
      ...fields,
      categoryId: fields.categoryId as number,
      previewImage: image instanceof File ? image : null
    });
  }

  onCancel() {
    this.formCancel.emit();
  }
}
