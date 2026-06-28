import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CategoryListDto } from '../../../../shared/services/category/category.interface';
import { CreatePostRequest } from '../../../../shared/interfaces/post.interface';

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
  public disabled = input<boolean>(false);  
  public postSubmit = output<CreatePostRequest>();

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

  submit() {
    if (this.form.invalid) return;

    const postData = this.form.getRawValue();
    this.postSubmit.emit(postData);
  }
}