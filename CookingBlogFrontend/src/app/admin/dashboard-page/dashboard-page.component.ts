import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AdminPostListDto, PostQueryOptions, PostSortField, SortDirection } from '../../shared/interfaces/post.interface';
import { DatePipe } from '@angular/common';
import { AdminPostService } from '../shared/services/admin-post.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UI_COMMON_MESSAGES, UI_ERROR_MESSAGES } from '../../core/constants/ui-messages.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AdaptivePaginationComponent } from '../../shared/components/adaptive-pagination/adaptive-pagination.component';
import { PageChangeDetails } from '../../shared/interfaces/global.interface';
import { AlertService } from '../../shared/services/alert/alert.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, RouterLink, AdaptivePaginationComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent implements OnInit {

  adminPostsService = inject(AdminPostService);
  private readonly route = inject(ActivatedRoute);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  posts = signal<AdminPostListDto[]>([]);

  currentPage = signal(1);
  pageSize = signal(10);
  totalPostsCount = signal(0);
  isDesktopMode = signal(false);
  currentSortField = signal<PostSortField | undefined>(undefined);
  currentSortDirection = signal<SortDirection | undefined>(undefined);

  private _isLoading = signal(false);
  private _isBackendError = signal(false);
  private _currentCategoryId = signal<number | null>(null);

  viewState = computed(() => {
    if (this._isLoading()) return 'loading';
    if (this._isBackendError()) return 'error';
    if (this.posts().length === 0) return 'empty';
    return 'data';
  });

  statusMessage = computed(() => {
    switch (this.viewState()) {
      case 'loading': return UI_COMMON_MESSAGES.LOADING;
      case 'error': return UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('posts');
      case 'empty': return UI_ERROR_MESSAGES.DYNAMIC.EMPTY('posts');
      default: return null;
    }
  });

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this._currentCategoryId.set(params['categoryId'] ? Number(params['categoryId']) : null);
        this.loadPosts(1, true);
      });
  }

  loadPosts(page: number, replaceData: boolean): void {
    if (this._isLoading()) return;

    this._isLoading.set(true);
    this._isBackendError.set(false);    

    const queryOptions: PostQueryOptions = {
      pagination: {
        pageNumber: page,
        pageSize: this.pageSize(),
      },
      filters: {
        categoryId: this._currentCategoryId() || undefined
      },
      sort: {
        sortBy: this.currentSortField(),
        sortDirection: this.currentSortDirection()
      }
    };

    this.adminPostsService.getAdminPosts(queryOptions)
      .pipe(
        finalize(() => this._isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.totalPostsCount.set(res.totalCount);
          this.currentPage.set(page);
          this.posts.set(replaceData ? res.items : [...this.posts(), ...res.items]);
        },
        error: () => {
          this._isBackendError.set(true);
        }
      });
  }

  onModeChanged(isDesktop: boolean): void {
    this.isDesktopMode.set(isDesktop);
    if (isDesktop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageChanged(details: PageChangeDetails): void {
    if (details.replace) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.loadPosts(details.page, details.replace);
  }

  deletePost(id: number, title: string): void {
    if (!confirm(`Are you sure you want to delete the post "${title}"?`)) {
      return;
    }

    this.adminPostsService.deletePost(id).subscribe({
      next: () => {        
        this.loadPosts(this.currentPage(), true);
        this.alertService.success(`Post "${title}" has been deleted successfully.`);
      }      
    });
  }    
}