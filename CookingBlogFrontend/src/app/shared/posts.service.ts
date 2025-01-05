import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private http: HttpClient) { }

  apiUrl = 'https://localhost:7030/api/posts'

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl)
  }
}
