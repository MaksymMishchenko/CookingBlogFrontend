import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { firstValueFrom } from 'rxjs';
import { PostAdminDetailsDto, UpdatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';

interface EditPostState {
  post: PostAdminDetailsDto;
  categories: CategoryListDto[] | undefined;
  loading: boolean;
  error: boolean;
}

@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [PostFormComponent],
  templateUrl: './edit-page.component.html',
  styleUrl: './edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPageComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private adminPostService = inject(AdminPostService);
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  private resolvedPost: PostAdminDetailsDto = this.route.snapshot.data['postData'];
  public postId: number = this.resolvedPost.id;

  private editState = signal<EditPostState>({
    post: this.resolvedPost,
    categories: undefined,
    loading: true,
    error: false
  });

  public isSubmitting = signal(false);

  public viewState = computed(() => {
    const state = this.editState();
    return {
      categories: state.categories,
      currentPost: state.post,
      isLoading: state.loading,
      hasError: state.error,
      isSubmitting: this.isSubmitting()
    };
  });

  ngOnInit() {
    this.loadCategories();
  }

  private async loadCategories() {
    try {
      const categories = await firstValueFrom(this.categoryService.getCategories());

      if (!categories || categories.length === 0) {
        throw new Error('Categories are missing');
      }

      this.editState.update(state => ({
        ...state,
        categories,
        loading: false,
        error: false
      }));
    } catch (err) {
      this.editState.update(state => ({
        ...state,
        loading: false,
        error: true
      }));
    }
  }

  async onUpdatePost(data: UpdatePostRequest) {
    this.isSubmitting.set(true);
    try {
      await firstValueFrom(this.adminPostService.updatePost(this.postId, data));
      this.alertService.success('Post has been updated successfully!');
      await this.router.navigate(['/admin/dashboard']);
    } catch (err) {
      this.alertService.error('Failed to update post');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public retryLoad() {
    this.loadCategories();
  }

  public onFormCancel() {
    this.router.navigate(['/admin/dashboard']);
  }
}