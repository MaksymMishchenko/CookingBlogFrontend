import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PublicPostsService } from '../shared/services/post/public-post.service';
import { catchError, filter, finalize, of, switchMap, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AuthService } from '../shared/services/auth/auth.service';
import { CommentsComponent } from '../shared/components/comments/components/comments/comments.component';
import { UI_ERROR_MESSAGES } from '../core/constants/ui-messages.constants';

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
      }
    }, { allowSignalWrites: true });
  }

  loadPost(): void {
    this._retryTrigger.update(v => v + 1);
  }

  handleCountChange(delta: number) {
    this.commentCount.update(current => current + delta);
  }
}