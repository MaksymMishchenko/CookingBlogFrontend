import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CategoryListDto } from '../../../../shared/services/category/category.interface';
import { PostAdminDetailsDto, PostFormValue } from '../../../../shared/interfaces/post.interface';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss'
})
export class PostFormComponent {
  private fb = inject(NonNullableFormBuilder);

  public categories = input<CategoryListDto[]>([]);
  public postData = input<PostAdminDetailsDto | null>(null);
  public disabled = input<boolean>(false);
  public mode = input<'create' | 'edit'>('create');
  public postSubmit = output<PostFormValue>();
  public formCancel = output<void>();

  protected submitLabel = computed(() =>
    this.mode() === 'edit' ? 'Update post' : 'Create post'
  );

  protected form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    content: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(2500)]],
    author: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    imageUrl: ['', [Validators.required]],
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
          author: data.author,
          imageUrl: data.imageUrl,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          slug: data.slug,
          categoryId: data.categoryId,
          isActive: data.isActive
        });
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const postData = this.form.getRawValue() as PostFormValue;
    this.postSubmit.emit(postData);
  }

  onCancel() {
    this.formCancel.emit();
  }
}