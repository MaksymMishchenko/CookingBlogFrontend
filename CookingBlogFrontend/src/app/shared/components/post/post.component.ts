import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { PostsService } from '../../posts.service';
import { Post } from '../interfaces';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  pSub: Subscription | undefined;

  constructor(private postService: PostsService) { }

  ngOnInit() {
    this.pSub = this.postService.getPosts().subscribe(posts => {
      this.posts = posts;
      console.log(posts);
    });
  }

  ngOnDestroy(): void {
    if (this.pSub) {
      this.pSub.unsubscribe();
    }
  }
}