import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { CategoryService } from '../shared/services/category/categories.service';
import { PostSearchDto } from '../shared/interfaces/post.interface';
import { PageChangeDetails } from '../shared/interfaces/global.interface';
import { AdaptivePaginationComponent } from '../shared/components/adaptive-pagination/adaptive-pagination.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchService } from '../shared/services/search/search.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdaptivePaginationComponent
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPageComponent implements OnInit {
  private categoryService = inject(CategoryService);
  protected searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

 searchControl = new FormControl(this.searchService.searchTerm(), { nonNullable: true });

  posts = signal<PostSearchDto[]>([]);
  currentPage = signal(1);
  pageSize = 10;
  totalPostsCount = signal(0);  
  isDesktopMode = signal(false);
  isBackendError = signal(false);

  categories = toSignal(this.categoryService.getCategories(), { initialValue: [] });
  selectedCategorySlug = signal<string | null>(null);

  @Input('q') set q(value: string) {
    const query = value?.trim() || '';
    this.searchService.setSearchTerm(query);
    this.searchControl.setValue(query, { emitEvent: false });
    this.getSearchResults(1, true);
  }

  ngOnInit(): void {
    this.setupLiveSearch();

    if (this.posts().length === 0 && this.searchService.searchTerm()) {
      this.getSearchResults(1, true);
    }
  }

  private setupLiveSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.searchService.setSearchTerm(value);
      this.getSearchResults(1, true);
    });
  }

  selectCategory(categorySlug: string) {
    const newSlug = this.selectedCategorySlug() === categorySlug ? null : categorySlug;
    this.selectedCategorySlug.set(newSlug);
    this.getSearchResults(1, true);
  }

  getSearchResults(page: number, replaceData: boolean) {    
    this.isBackendError.set(false);

    this.searchService.getPosts(
      { pageNumber: page, pageSize: this.pageSize },
      { categorySlug: this.selectedCategorySlug() ?? undefined }
    ).subscribe({
      next: (res) => {
        this.totalPostsCount.set(res.totalCount);
        this.currentPage.set(page);

        if (replaceData) {
          this.posts.set(res.posts);
        } else {
          this.posts.update(prev => [...prev, ...res.posts]);
        }
      },
      error: () => this.isBackendError.set(true)
    });
  }

  onModeChanged(isDesktop: boolean): void {
    this.isDesktopMode.set(isDesktop);
    this.getSearchResults(1, true);
    if (isDesktop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageChanged(details: PageChangeDetails): void {
    if (details.replace) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.getSearchResults(details.page, details.replace);
  }
}