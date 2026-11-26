import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PublicPostsService } from '../shared/services/post/public-post.service';
import { catchError, filter, finalize, of, switchMap, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AuthService } from '../shared/services/auth/auth.service';
import { CommentsComponent } from '../shared/components/comments/components/comments/comments.component';
import { UI_ERROR_MESSAGES } from '../core/constants/ui-messages.constants';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-post-page',
  standalone: true,
  imports: [DatePipe, CommentsComponent],
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.scss'
})
export class PostPageComponent {
  private postsService = inject(PublicPostsService);
  private authService = inject(AuthService);

  private titleService = inject(Title);
  private metaService = inject(Meta);
  private destroyRef = inject(DestroyRef);

  private readonly siteName = 'CookingBlog';
  private readonly defaultTitle = 'CookingBlog — Delicious Recipes & Culinary Tips';
  private readonly defaultDescription = 'Explore easy recipes, cooking tips, and culinary inspiration on CookingBlog.';
  private readonly postFallbackDescription = 'Read this recipe and cooking guide on CookingBlog.';

  userId = this.authService.userIdSignal;

  private _isLoading = signal(true);
  private _isBackendError = signal(false);

  categorySlug = input.required<string>();
  postSlug = input.required<string>();

  private routeParams = computed(() => ({
    cat: this.categorySlug(),
    post: this.postSlug()
  }));

  viewState = computed(() => {
    if (this._isLoading()) return 'loading';
    if (this._isBackendError()) return 'error';
    if (!this.post()) return 'empty';
    return 'data';
  });

  statusMessage = computed(() => {
    switch (this.viewState()) {
      case 'error': return UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('post');
      case 'empty': return UI_ERROR_MESSAGES.DYNAMIC.EMPTY('post');
      default: return null;
    }
  });

  private _retryTrigger = signal(0);

  post = toSignal(
    toObservable(computed(() => ({
      params: this.routeParams(),
      retry: this._retryTrigger()
    }))).pipe(
      filter(({ params }) => !!params.cat && !!params.post),
      tap(() => {
        this._isLoading.set(true);
        this._isBackendError.set(false);
      }),
      switchMap(({ params }) => this.postsService.getPostBySlug(params.cat, params.post).pipe(
        catchError(() => {
          this._isBackendError.set(true);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      ))
    )
  );

  commentCount = signal(0);

  constructor() {
    effect(() => {
      const p = this.post();
      if (p) {
        this.commentCount.set(p.commentCount);

        const baseTitle = p.metaTitle?.trim() || p.title;
        const pageTitle = this.formatPageTitle(baseTitle);
        const description = p.metaDescription?.trim() || this.postFallbackDescription;

        this.titleService.setTitle(pageTitle);
        this.metaService.updateTag({ name: 'description', content: description });
      }
    }, { allowSignalWrites: true });

    this.destroyRef.onDestroy(() => {
      this.titleService.setTitle(this.defaultTitle);
      this.metaService.updateTag({ name: 'description', content: this.defaultDescription });
    });
  }

  private formatPageTitle(rawTitle: string): string {
    const clean = rawTitle.trim();
    if (!clean) {
      return this.siteName;
    }

    const dashSuffix = ` - ${this.siteName}`;
    const pipeSuffix = ` | ${this.siteName}`;
    const lower = clean.toLowerCase();

    if (lower.endsWith(dashSuffix.toLowerCase()) || lower.endsWith(pipeSuffix.toLowerCase())) {
      return clean;
    }

    return `${clean}${dashSuffix}`;
  }

  loadPost(): void {
    this._retryTrigger.update(v => v + 1);
  }

  handleCountChange(delta: number) {
    this.commentCount.update(current => current + delta);
  }
}