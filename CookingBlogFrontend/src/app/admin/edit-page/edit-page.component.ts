import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { firstValueFrom } from 'rxjs';
import { PostAdminDetailsDto, UpdatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { BusinessError, ValidationError } from '../../shared/services/error/error.types';
import { HttpStatusCode } from '@angular/common/http';

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

  public formErrors = signal<string[]>([]);

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
    this.formErrors.set([]);
    try {
      await firstValueFrom(this.adminPostService.updatePost(this.postId, data));
      this.alertService.success('Post has been updated successfully!');
      await this.router.navigate(['/admin/dashboard']);
    } catch (err) {
      this.handleFormError(err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleFormError(err: unknown) {
    let messages: string[] = [];

    if (err instanceof ValidationError) {
      if (err.status === HttpStatusCode.PayloadTooLarge) return;

      messages = err.errors && Object.keys(err.errors).length > 0
        ? Object.values(err.errors).flat()
        : [err.message];
    } else if (err instanceof BusinessError) {
      messages = [err.message];
    } else {
      return;
    }

    this.formErrors.set(messages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public retryLoad() {
    this.loadCategories();
  }

  public onFormCancel() {
    this.router.navigate(['/admin/dashboard']);
  }
}