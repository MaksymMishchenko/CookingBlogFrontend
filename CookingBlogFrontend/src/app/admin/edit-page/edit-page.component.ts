import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { PostsService } from '../../shared/services/post/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PostAdminDetailsDto, UpdatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post.service';

interface EditPostState {
  post: PostAdminDetailsDto | null;
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
  private postService = inject(PostsService);
  private adminPostService = inject(AdminPostService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);
 
  private editState = signal<EditPostState>({
    post: null,
    categories: undefined,
    loading: true,
    error: false
  });

  public isSubmitting = signal(false);
  private postId!: number;
 
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
    this.loadData();
  }

  private async loadData() {
    const postIdRaw = this.route.snapshot.paramMap.get('id');
    this.postId = Number(postIdRaw);

    if (!postIdRaw || isNaN(this.postId)) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.editState.set({ post: null, categories: undefined, loading: true, error: false });

    try {
      const res = await firstValueFrom(
        forkJoin({
          post: this.adminPostService.getPostById(this.postId),
          categories: this.categoryService.getCategories()
        })
      );

      if (!res.post || !res.categories || res.categories.length === 0) {
        throw new Error('Required data is missing');
      }

      this.editState.set({
        post: res.post,
        categories: res.categories,
        loading: false,
        error: false
      });
    } catch (err) {
      this.editState.set({ post: null, categories: undefined, loading: false, error: true });
    }
  }

  async onUpdatePost(data: UpdatePostRequest) {
    this.isSubmitting.set(true);
    try {
      await firstValueFrom(this.postService.updatePost(this.postId, data));
      this.alertService.success('Post has been updated successfully!');
      await this.router.navigate(['/admin/dashboard']);
    } catch (err) {
      this.alertService.error('Failed to update post');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public retryLoad() {
    this.loadData();
  }

  public onFormCancel() {
    this.router.navigate(['/admin/dashboard']);
  }
}