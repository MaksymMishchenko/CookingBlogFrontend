import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Post } from '../../interfaces/post.interface';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent { 
  @Input() post!: Post
}