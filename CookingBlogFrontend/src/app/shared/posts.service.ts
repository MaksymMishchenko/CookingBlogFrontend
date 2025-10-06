import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, pipe } from "rxjs";
import { Post } from "./components/interfaces";
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    constructor(private http: HttpClient) { }

    private apiUrl = environment.apiUrl;

    getPosts(): Observable<Post[]> {
        return this.http.get<{ dataList: Post[] }>(this.apiUrl)
            .pipe(
                map(response => response.dataList));
    }
}