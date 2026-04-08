import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../shared/services/category/categories.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-page.component.html',
  styleUrl: './create-page.component.scss'
})
export class CreatePageComponent {
  private fb = inject(NonNullableFormBuilder);
  private categoryService = inject(CategoryService);

  public categories = toSignal(this.categoryService.getCategories(), { initialValue: [] });

  protected form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2500)]],
    author: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    imageUrl: ['', [Validators.required]],
    metaTitle: ['', Validators.maxLength(100)],
    metaDescription: ['', Validators.maxLength(200)],
    slug: ['', Validators.maxLength(200)],
    categoryId: ['', [Validators.required]],
    isActive: [false as boolean, [Validators.required]]
  });

  submit() {
    if (this.form.invalid) return;
    // const postData = this.form.getRawValue();    
  }
}
