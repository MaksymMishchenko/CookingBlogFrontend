import { Component, OnInit } from '@angular/core';
import { Post } from '../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { PostsService } from '../shared/posts.service';
import { Observable, switchMap } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.scss'
})
export class PostPageComponent {

}
