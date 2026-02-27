import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PostsService } from '../shared/services/post/posts.service';
import { filter, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-post-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.scss'
})
export class PostPageComponent {
  private postsService = inject(PostsService);

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
}
