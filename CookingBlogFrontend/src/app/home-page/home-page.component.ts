import { Component, OnInit } from '@angular/core';
import { PostComponent } from "../shared/components/post/post.component";
import { Post } from '../shared/components/interfaces';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PostsService } from '../shared/services/post/posts.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PostComponent, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  paginatedPosts$: Observable<{ posts: Post[]; totalCount: number; pageNumber: number; pageSize: number }> | undefined;

  constructor(private postService: PostsService) { }

  ngOnInit(): void {
    this.paginatedPosts$ = this.postService.getPosts();
  }
}
