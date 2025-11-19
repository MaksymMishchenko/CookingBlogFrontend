import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import { Post, PostsResult } from "../../interfaces/post.interface";
import { ApiResponse } from "../../interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class PostsService extends BaseService {

    getPosts(pageNumber: number = 1, pageSize: number = 10)
        : Observable<PostsResult> {
        const params = new HttpParams()
            .set('pageNumber', pageNumber)
            .set('pageSize', pageSize);

        return this.http.get<ApiResponse<Post>>(this.buildUrl(API_ENDPOINTS.POSTS), { params })
            .pipe(
                map(response => ({
                    posts: response.dataList || [],
                    totalCount: response.totalCount || 0,
                    pageNumber: response.pageNumber || pageNumber,
                    pageSize: response.pageSize || pageSize
                } as PostsResult)));
    }

    getPostById(id: number): Observable<Post | null> {
        return this.http.get<ApiResponse<Post>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${id}`))
            .pipe(
                map(response => response.data || null),                
                catchError(error => {
                    if (error.status === 404) {
                        return of(null);
                    }
                    throw error;
                })
            );
    }

    getPostBySlug(postSlug: string): Observable<Post | null> {
        return this.http.get<ApiResponse<Post>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${postSlug}`))
            .pipe(
                map(response => response.data || null),                
                catchError(error => {
                    if (error.status === 404) {
                        return of(null);
                    }
                    throw error;
                })
            );
    }

    createPost(post: Post): Observable<ApiResponse<Post>> {
        return this.http.post<ApiResponse<Post>>(this.buildUrl(`${API_ENDPOINTS.POSTS}`), post);
    }

    updatePost(post: Post): Observable<ApiResponse<Post>> {
        return this.http.patch<ApiResponse<Post>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${post.id}`), post);
    }

    deletePost(postId: number): Observable<ApiResponse<Post>> {
        return this.http.delete<ApiResponse<Post>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${postId}`));
    }
}