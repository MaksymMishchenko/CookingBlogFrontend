import { Component, OnInit } from '@angular/core';
import { PostComponent } from "../shared/components/post/post.component";
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PostsService } from '../shared/services/post/posts.service';
import { PostsResult } from '../shared/interfaces/post.interface';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PostComponent, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  paginatedPosts$: Observable<PostsResult> | undefined;

  constructor(private postService: PostsService) { }

  ngOnInit(): void {
    this.paginatedPosts$ = this.postService.getPosts();
  }
}
