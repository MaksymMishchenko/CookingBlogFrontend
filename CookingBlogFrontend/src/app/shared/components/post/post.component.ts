import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Post } from '../interfaces';
import { CommonModule } from '@angular/common';

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