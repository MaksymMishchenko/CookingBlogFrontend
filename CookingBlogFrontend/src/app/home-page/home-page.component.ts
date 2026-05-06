import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { PostComponent } from "../shared/components/post/post.component";
import { CommonModule } from '@angular/common';
import { PostsService } from '../shared/services/post/posts.service';
import { FilterParams, PaginationParams, PostListDto } from '../shared/interfaces/post.interface';
import { AdaptivePaginationComponent } from '../shared/components/adaptive-pagination/adaptive-pagination.component';
import { PageChangeDetails } from '../shared/interfaces/global.interface';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { UI_COMMON_MESSAGES, UI_ERROR_MESSAGES } from '../core/constants/ui-messages.constants';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, PostComponent, AdaptivePaginationComponent, SearchBarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit {
  private readonly postService = inject(PostsService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  posts = signal<PostListDto[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPostsCount = signal(0);  
  isDesktopMode = signal(false);

  private _isLoading = signal(false);
  private _isBackendError = signal(false);
  private _currentCategorySlug = signal<string | null>(null);  

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
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this._currentCategorySlug.set(params['slug'] || null);
        this.loadPosts(1, true);
      });
  }

  loadPosts(page: number, replaceData: boolean): void {
    if (this._isLoading()) return;

    this._isLoading.set(true);
    this._isBackendError.set(false);

    const pagination: PaginationParams = {
      pageNumber: page,
      pageSize: this.pageSize(),
    };

    const filters: FilterParams = {
      categorySlug: this._currentCategorySlug() || undefined
    };

    this.postService.getPosts(pagination, filters)
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
}