import { Component, inject, OnInit } from '@angular/core';
import { PostComponent } from "../shared/components/post/post.component";
import { CommonModule } from '@angular/common';
import { PostsService } from '../shared/services/post/posts.service';
import { Post } from '../shared/interfaces/post.interface';
import { AdaptivePaginationComponent } from '../shared/components/adaptive-pagination/adaptive-pagination.component';
import { PageChangeDetails } from '../shared/interfaces/global.interface';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, PostComponent, AdaptivePaginationComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  postService = inject(PostsService);
  posts: Post[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPostsCount = 0;
  isLoading = false;
  isDesktopMode = false;
  isBackendError = false; 

  ngOnInit(): void {
    this.loadPosts(1, true);
  }

  loadPosts(page: number, replaceData: boolean) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.isBackendError = false;
    this.postService.getPosts(page, this.pageSize).subscribe({
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

    if (isDesktop) {
      this.loadPosts(1, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {

      this.loadPosts(1, true);
    }
  }

  onPageChanged(details: PageChangeDetails): void {
    if (details.replace) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.loadPosts(details.page, details.replace);
  }
}