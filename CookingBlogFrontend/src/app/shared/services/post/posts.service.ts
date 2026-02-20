import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpContext, HttpParams } from "@angular/common/http";
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import {
    CreatedPostDto,
    CreatePostRequest,
    FilterParams,
    PagedPostResult,
    PaginationParams,
    PostAdminDetailsDto,
    PostDetailDto,
    PostListDto,
    UpdatedPostDto,
    UpdatePostRequest
} from "../../interfaces/post.interface";
import { BaseResponse, PagedApiResponse, SingleApiResponse } from "../../interfaces/global.interface";
import { USER_MESSAGES } from "../error/error.constants";
import { SKIP_GLOBAL_ERROR } from "../../../core/http/http-context-token";

@Injectable({
    providedIn: 'root'
})
export class PostsService extends BaseService {

    getPosts<T = PostListDto>(
        pagination: PaginationParams = { pageNumber: 1, pageSize: 10 },
        filters: FilterParams = {})
        : Observable<PagedPostResult<T>> {

        const { searchTerm, categorySlug } = filters;

        let httpParams = new HttpParams()
            .set('pageNumber', pagination.pageNumber.toString())
            .set('pageSize', pagination.pageSize.toString());

        if (searchTerm?.trim()) {
            httpParams = httpParams.set('search', searchTerm.trim());
        }

        if (categorySlug?.trim()) {
            httpParams = httpParams.set('categorySlug', categorySlug.trim());
        }

        return this.http.get<PagedApiResponse<T>>(this.buildUrl(API_ENDPOINTS.POSTS), {
            params: httpParams,
            context: new HttpContext().set(SKIP_GLOBAL_ERROR, true)
        }).pipe(
            map(response => (
                {
                    posts: response.data || [],
                    totalCount: response.totalCount || 0,
                    pageNumber: response.pageNumber || pagination.pageNumber,
                    pageSize: response.pageSize || pagination.pageSize,
                    searchQuery: response.appliedFilters?.search || searchTerm || undefined
                } as PagedPostResult<T>)),
            catchError(error => {
                if (error.status === 404) {
                    return of({
                        posts: [],
                        totalCount: 0,
                        pageNumber: pagination.pageNumber,
                        pageSize: pagination.pageSize
                    } as PagedPostResult<T>);
                }

                return throwError(() => error);
            })
        );
    }

    getPostById(id: number): Observable<PostAdminDetailsDto | null> {
        return this.http.get<SingleApiResponse<PostAdminDetailsDto>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${id}`),
            { context: new HttpContext().set(SKIP_GLOBAL_ERROR, true) }
        ).pipe(
            map(response => response.data || null),
            catchError(error => {
                if (error.status === 404) {
                    return of(null);
                }
                return throwError(() => error);
            })
        );
    }

    getPostBySlug(categorySlug: string, postSlug: string): Observable<PostDetailDto | null> {
        return this.http.get<SingleApiResponse<PostDetailDto>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${categorySlug}/${postSlug}`),
            { context: new HttpContext().set(SKIP_GLOBAL_ERROR, true) }
        ).pipe(
            map(response => response.data || null),
            catchError(error => {
                if (error.status === 404) {
                    return of(null);
                }
                return throwError(() => error);
            })
        );
    }

    createPost(post: CreatePostRequest): Observable<CreatedPostDto> {
        return this.http.post<SingleApiResponse<CreatedPostDto>>(this.buildUrl(API_ENDPOINTS.POSTS),
            post,
            { context: new HttpContext().set(SKIP_GLOBAL_ERROR, true) }
        ).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error(USER_MESSAGES.INTERNAL_ERROR);
                }
                return response.data;
            }),
            catchError(error => {
                return throwError(() => error);
            })
        );
    }

    updatePost(postId: number, post: UpdatePostRequest): Observable<UpdatedPostDto> {
        return this.http.patch<SingleApiResponse<UpdatedPostDto>>(
            this.buildUrl(`${API_ENDPOINTS.POSTS}/${postId}`),
            post,
            { context: new HttpContext().set(SKIP_GLOBAL_ERROR, true) }
        ).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error(USER_MESSAGES.INTERNAL_ERROR);
                }
                return response.data;
            }),
            catchError(error => {
                return throwError(() => error);
            })
        );
    }

    deletePost(postId: number): Observable<BaseResponse> {
        return this.http.delete<BaseResponse>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${postId}`),
            { context: new HttpContext().set(SKIP_GLOBAL_ERROR, true) }
        ).pipe(
            map(res => {
                if (!res.success) {
                    throw new Error(res.message || USER_MESSAGES.UNKNOWN_ERROR);
                }
                return res;
            }),
            catchError(error => {
                return throwError(() => error);
            })
        );
    }    
}