import { Component, OnInit } from '@angular/core';
import { PostComponent } from "../shared/components/post/post.component";
import { PostsService } from '../shared/services/posts.service';
import { Post } from '../shared/components/interfaces';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PostComponent, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  posts$: Observable<Post[]> | undefined;

  constructor(private postService: PostsService) { }

  ngOnInit(): void {
    this.posts$ = this.postService.getPosts();
  }
}
