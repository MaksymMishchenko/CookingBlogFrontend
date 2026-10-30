import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { firstValueFrom } from 'rxjs';
import { PostAdminDetailsDto, UpdatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { PageStatus } from '../../shared/interfaces/global.interface';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';
import { UI_COMMON_BUTTONS, UI_ERROR_MESSAGES, UI_SUCCESS_MESSAGES } from '../../core/constants/ui-messages.constants';

interface EditPageState {
  post: PostAdminDetailsDto;
  categories: CategoryListDto[] | undefined;
  status: PageStatus;
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

  public messages = UI_ERROR_MESSAGES.FORMS;
  public buttons = UI_COMMON_BUTTONS;

  private editState = signal<EditPageState>({
    post: this.resolvedPost,
    categories: undefined,
    status: 'loading'
  });

  public serverError = signal<unknown>(null);
  public isSubmitting = signal(false);

  public viewState = computed(() => {
    const state = this.editState();
    return {
      status: state.status,
      categories: state.categories,
      currentPost: state.post,
      isLoading: state.status === 'loading',
      hasError: state.status === 'error' || state.status === 'empty',
      isSubmitting: this.isSubmitting()
    };
  });

  ngOnInit() {
    this.loadCategories();
  }

  private async loadCategories() {
    this.editState.update(state => ({ ...state, status: 'loading' }));

    try {
      const categories = await firstValueFrom(this.categoryService.getCategories());

      if (!categories || categories.length === 0) {
        this.editState.update(state => ({ ...state, status: 'empty' }));
        return;
      }

      this.editState.update(state => ({
        ...state,
        categories,
        status: 'success'
      }));
    } catch (err) {
      this.editState.update(state => ({ ...state, status: 'error' }));
    }
  }

  async onUpdatePost(data: UpdatePostRequest) {
    this.isSubmitting.set(true);
    this.serverError.set(null);
    try {
      await firstValueFrom(this.adminPostService.updatePost(this.postId, data));
      this.alertService.success(UI_SUCCESS_MESSAGES.UPDATED('Post'));
      await this.router.navigate(['/', ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
    } catch (err) {
      this.serverError.set(err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public retryLoad() {
    this.loadCategories();
  }

  public onFormCancel() {
    this.router.navigate(['/', ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
  }
}