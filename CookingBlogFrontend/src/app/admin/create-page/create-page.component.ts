import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { PostsService } from '../../shared/services/post/posts.service';
import { Router } from '@angular/router';
import { CreatePostRequest } from '../../shared/interfaces/post.interface';
import { AlertService } from '../../shared/services/alert/alert.service';
import { firstValueFrom } from 'rxjs';
import { CategoryListDto } from '../../shared/services/category/category.interface';

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [PostFormComponent],
  templateUrl: './create-page.component.html',
  styleUrl: './create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePageComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private postService = inject(PostsService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  public categories = signal<CategoryListDto[] | undefined>(undefined);
  public categoriesError = signal<boolean>(false);
  public categoriesLoading = signal<boolean>(true);

  public isSubmitting = signal(false);

  ngOnInit() {
    this.loadCategories();
  }

  private async loadCategories() {
    this.categoriesLoading.set(true);
    this.categoriesError.set(false);

    try {     
      const data = await firstValueFrom(this.categoryService.getCategories());
     
      if (!data || data.length === 0) {
        throw new Error('No categories received');
      }

      this.categories.set(data);
    } catch (err) {
      this.categoriesError.set(true);     
    } finally {
      this.categoriesLoading.set(false);
    }
  }

  async onCreatePost(data: CreatePostRequest) {
    this.isSubmitting.set(true);
    try {
      await firstValueFrom(this.postService.createPost(data));
      await this.router.navigate(['/admin/dashboard']);
      this.alertService.success('Post has been created successfully!');
    } catch (err) {
      this.alertService.error('Failed to create post');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}