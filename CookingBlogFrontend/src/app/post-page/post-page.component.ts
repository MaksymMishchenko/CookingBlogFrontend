import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PostsService } from '../shared/services/post/posts.service';
import { filter, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AuthService } from '../shared/services/auth/auth.service';
import { CommentsComponent } from '../shared/components/comments/components/comments/comments.component';

@Component({
  selector: 'app-post-page',
  standalone: true,
  imports: [DatePipe, CommentsComponent],
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.scss'
})
export class PostPageComponent {
  private postsService = inject(PostsService);
  private authService = inject(AuthService);

  userId = this.authService.userIdSignal;

  categorySlug = input.required<string>();
  postSlug = input.required<string>();

  private routeParams = computed(() => ({
    cat: this.categorySlug(),
    post: this.postSlug()
  }));

  post = toSignal(
    toObservable(this.routeParams).pipe(      
      filter(p => !!p.cat && !!p.post),
      switchMap(p => this.postsService.getPostBySlug(p.cat, p.post))
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

  handleCountChange(delta: number) {
    this.commentCount.update(current => current + delta);
  }
}
