import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { Router } from '@angular/router';
import { CreatePostRequest } from '../../shared/interfaces/post.interface';
import { AlertService } from '../../shared/services/alert/alert.service';
import { firstValueFrom } from 'rxjs';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { PageStatus } from '../../shared/interfaces/global.interface';
import { UI_COMMON_BUTTONS, UI_ERROR_MESSAGES, UI_SUCCESS_MESSAGES } from '../../core/constants/ui-messages.constants';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';

interface CreatePageState {
  categories: CategoryListDto[] | undefined;
  status: PageStatus;
}

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
  private adminPostService = inject(AdminPostService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  public serverError = signal<unknown>(null);
  public isSubmitting = signal(false);

  public messages = UI_ERROR_MESSAGES.FORMS;
  public buttons = UI_COMMON_BUTTONS;

  private createState = signal<CreatePageState>({
    categories: undefined,
    status: 'loading'
  });

  public viewState = computed(() => {
    const state = this.createState();
    return {
      status: state.status,
      categories: state.categories,
      isLoading: state.status === 'loading',
      hasError: state.status === 'error' || state.status === 'empty',
      isSubmitting: this.isSubmitting()
    };
  });

  ngOnInit() {
    this.loadCategories();
  }

  private async loadCategories() {
    this.createState.update(state => ({ ...state, status: 'loading' }));

    try {
      const categories = await firstValueFrom(this.categoryService.getCategories());

      if (!categories || categories.length === 0) {
        this.createState.update(state => ({ ...state, status: 'empty' }));
        return;
      }

      this.createState.update(state => ({
        ...state,
        categories,
        status: 'success'
      }));
    } catch (err) {
      this.createState.update(state => ({ ...state, status: 'error' }));
    }
  }

  async onCreatePost(data: CreatePostRequest) {
    this.isSubmitting.set(true);
    this.serverError.set(null);
    try {
      await firstValueFrom(this.adminPostService.createPost(data));
      this.alertService.success(UI_SUCCESS_MESSAGES.CREATED('Post'));
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