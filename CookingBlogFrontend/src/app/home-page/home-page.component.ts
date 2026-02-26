import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { PostComponent } from "../shared/components/post/post.component";
import { CommonModule } from '@angular/common';
import { PostsService } from '../shared/services/post/posts.service';
import { FilterParams, PaginationParams, PostListDto } from '../shared/interfaces/post.interface';
import { AdaptivePaginationComponent } from '../shared/components/adaptive-pagination/adaptive-pagination.component';
import { PageChangeDetails } from '../shared/interfaces/global.interface';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, PostComponent, AdaptivePaginationComponent, SearchBarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  postService = inject(PostsService);
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  posts: PostListDto[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPostsCount = 0;
  isLoading = false;
  isDesktopMode = false;
  isBackendError = false;

  currentCategorySlug = signal<string | null>(null);

  ngOnInit(): void {    
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef)) 
      .subscribe(params => {
        const slug = params['slug'] || null;
        this.currentCategorySlug.set(slug);
        this.loadPosts(1, true);
      });
  }

  loadPosts(page: number, replaceData: boolean) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.isBackendError = false;

    const requestParams: PaginationParams = {
      pageNumber: page,
      pageSize: this.pageSize,
    };

    const params: FilterParams = {
      categorySlug: this.currentCategorySlug() || undefined
    };

    this.postService.getPosts(requestParams, params).subscribe({
      next: (res) => {
        this.totalPostsCount = res.totalCount;
        this.currentPage = page;

        if (replaceData) {
          this.posts = res.posts;
        } else {
          this.posts = [...this.posts, ...res.posts];
        }
        this.isLoading = false;
        this.isBackendError = false;
      },
      error: () => {
        this.isLoading = false;
        this.isBackendError = true;
      }
    });
  }

  onModeChanged(isDesktop: boolean): void {
    this.isDesktopMode = isDesktop;
    this.loadPosts(1, true);

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