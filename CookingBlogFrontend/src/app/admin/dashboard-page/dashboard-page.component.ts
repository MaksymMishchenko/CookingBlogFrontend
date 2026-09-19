import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AdminPostListDto, PostQueryOptions, PostSortField, SortDirection } from '../../shared/interfaces/post.interface';
import { DatePipe } from '@angular/common';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UI_COMMON_MESSAGES, UI_ERROR_MESSAGES } from '../../core/constants/ui-messages.constants';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, tap } from 'rxjs';
import { AdaptivePaginationComponent } from '../../shared/components/adaptive-pagination/adaptive-pagination.component';
import { PageChangeDetails } from '../../shared/interfaces/global.interface';
import { AlertService } from '../../shared/services/alert/alert.service';
import { POST_SORT_FIELDS, SORT_DIRECTIONS } from '../../core/constants/sorting.constants';
import { SearchService } from '../../shared/services/search/search.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../shared/services/category/categories.service';
import { UserService } from '../shared/services/user/user.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, RouterLink, AdaptivePaginationComponent, ReactiveFormsModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent implements OnInit {

  readonly sortFields = POST_SORT_FIELDS;
  readonly sortDirections = SORT_DIRECTIONS;

  adminPostsService = inject(AdminPostService);
  private readonly route = inject(ActivatedRoute);
  private readonly alertService = inject(AlertService);
  protected readonly searchService = inject(SearchService);
  protected readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  posts = signal<AdminPostListDto[]>([]);

  currentPage = signal(1);
  pageSize = signal(10);
  totalPostsCount = signal(0);
  isDesktopMode = signal(false);
  currentSortField = signal<PostSortField | undefined>(undefined);
  currentSortDirection = signal<SortDirection | undefined>(undefined);

  private readonly categoryService = inject(CategoryService);

  private readonly categoriesRaw = toSignal(
    this.categoryService.getCategories().pipe(
      catchError(() => of(null))
    ),
    { initialValue: undefined }
  );

  categories = computed(() => {
    const value = this.categoriesRaw();
    return Array.isArray(value) ? value : [];
  });

  private readonly authorsRaw = toSignal(
    this.userService.getAllAuthors().pipe(
      catchError(() => of(null))
    ),
    { initialValue: undefined }
  );

  authors = computed(() => {
    const value = this.authorsRaw();
    return Array.isArray(value) ? value : [];
  });

  private _isLoading = signal(false);
  private _isBackendError = signal(false);
  private _currentCategoryId = signal<number | null>(null);

  categoryControl = new FormControl<number | string | null>(null);
  statusControl = new FormControl<string | null>(null);
  authorControl = new FormControl<string | null>(null);
  searchControl = new FormControl('', { nonNullable: true });
  searchQuery = signal('');
  currentStatus = signal<boolean | null>(null);
  currentAuthorId = signal<string | null>(null);

  hasActiveFilters = computed(() => {
    return (
      this._currentCategoryId() !== null ||
      this.searchQuery().trim().length > 0 ||
      this.currentStatus() !== null ||
      this.currentAuthorId() !== null
    );
  });

  viewState = computed(() => {
    if (this._isLoading()) return 'loading';
    if (this._isBackendError()) return 'error';
    if (this.posts().length === 0) {
      return this.hasActiveFilters() ? 'empty-filtered' : 'empty-total';
    }
    return 'data';
  });

  statusMessage = computed(() => {
    switch (this.viewState()) {
      case 'loading':
        return UI_COMMON_MESSAGES.LOADING;
      case 'error':
        return UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('posts');
      case 'empty-total':
        return UI_ERROR_MESSAGES.DYNAMIC.EMPTY('posts');
      case 'empty-filtered':
        return UI_ERROR_MESSAGES.POSTS.NO_MATCHING_POSTS;
      default:
        return null;
    }
  });

  // TODO: #53 Extract filtering and debounce business logic from component to shared service
  //  https://github.com/MaksymMishchenko/CookingBlogFrontend/issues/53
  private setupSearchPipeline(): void {
    this.searchControl.valueChanges
      .pipe(
        map(query => query.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        tap(query => {
          this.searchQuery.set(query);
          this.loadPosts(1, true);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  ngOnInit(): void {
    this.setupSearchPipeline();

    this.categoryControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(categoryId => {
        const parsedId = (categoryId && categoryId !== 'null' && categoryId !== '') ? Number(categoryId) : null;
        this._currentCategoryId.set(parsedId);
        this.loadPosts(1, true);
      });

    this.statusControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(statusValue => {
        let parsedStatus: boolean | null = null;

        if (statusValue === 'true') parsedStatus = true;
        if (statusValue === 'false') parsedStatus = false;

        this.currentStatus.set(parsedStatus);
        this.loadPosts(1, true);
      });

    this.authorControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(authorId => {
        const parsedAuthorId = (authorId && authorId !== 'null' && authorId !== '') ? authorId : null;// десь в сервісі вже є перевірка
        this.currentAuthorId.set(parsedAuthorId);
        this.loadPosts(1, true);
      });

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const catId = params['categoryId'] ? Number(params['categoryId']) : null;
        this._currentCategoryId.set(catId);
        this.categoryControl.setValue(catId, { emitEvent: false });
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
        categoryId: this._currentCategoryId() || undefined,
        searchTerm: this.searchQuery() || undefined,
        onlyActive: this.currentStatus() ?? undefined,
        authorId: this.currentAuthorId() || undefined
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

  onSort(field: PostSortField): void {
    if (this.currentSortField() !== field) {
      this.currentSortField.set(field);
      this.currentSortDirection.set(this.sortDirections.ASC);
    } else {
      if (this.currentSortDirection() === this.sortDirections.ASC) {
        this.currentSortDirection.set(this.sortDirections.DESC);
      } else if (this.currentSortDirection() === this.sortDirections.DESC) {
        this.currentSortField.set(undefined);
        this.currentSortDirection.set(undefined);
      } else {
        this.currentSortDirection.set(this.sortDirections.ASC);
      }
    }

    this.loadPosts(1, true);
  }

  clearAllFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchQuery.set('');
    this.categoryControl.setValue(null, { emitEvent: false });
    this._currentCategoryId.set(null);
    this.statusControl.setValue(null, { emitEvent: false });
    this.currentStatus.set(null);
    this.authorControl.setValue(null, { emitEvent: false });
    this.currentAuthorId.set(null);

    this.loadPosts(1, true);
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