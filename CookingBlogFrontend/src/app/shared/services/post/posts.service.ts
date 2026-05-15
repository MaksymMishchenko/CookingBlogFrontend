import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import {
    CreatedPostDto,
    CreatePostRequest,
    FilterParams,
    PagedResult,
    PaginationParams,
    PostAdminDetailsDto,
    PostDetailDto,
    PostListDto,
    UpdatedPostDto,
    UpdatePostRequest
} from "../../interfaces/post.interface";
import { BaseResponse, PagedApiResponse, SingleApiResponse } from "../../interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class PostsService extends BaseService {

    getPosts<T = PostListDto>(
        pagination: PaginationParams = { pageNumber: 1, pageSize: 10 },
        filters: FilterParams = {})
        : Observable<PagedResult<T>> {

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

        return this.http.get<PagedApiResponse<T>>(this.buildUrl(API_ENDPOINTS.POSTS), { params: httpParams })
            .pipe(
                map(response => (
                    {
                        items: response.data || [],
                        totalCount: response.totalCount || 0,
                        pageNumber: response.pageNumber || pagination.pageNumber,
                        pageSize: response.pageSize || pagination.pageSize,
                        searchQuery: response.appliedFilters?.search || searchTerm || undefined
                    } as PagedResult<T>))
            );
    }

    getPostById(id: number): Observable<PostAdminDetailsDto | null> {
        return this.http.get<SingleApiResponse<PostAdminDetailsDto>>(this.buildUrl(`${API_ENDPOINTS.ADMINPOSTS}/${id}`)
        ).pipe(
            map(response => response.data)
        );
    }

    getPostBySlug(categorySlug: string, postSlug: string): Observable<PostDetailDto | null> {
        return this.http.get<SingleApiResponse<PostDetailDto>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${categorySlug}/${postSlug}`)
        ).pipe(
            map(response => response.data)
        );
    }

    createPost(post: CreatePostRequest): Observable<CreatedPostDto> {
        return this.http.post<SingleApiResponse<CreatedPostDto>>(this.buildUrl(API_ENDPOINTS.ADMINPOSTS),
            post
        ).pipe(
            map(response => response.data!)
        );
    }

    updatePost(postId: number, post: UpdatePostRequest): Observable<UpdatedPostDto> {
        return this.http.patch<SingleApiResponse<UpdatedPostDto>>(
            this.buildUrl(`${API_ENDPOINTS.ADMINPOSTS}/${postId}`),
            post
        ).pipe(
            map(response => response.data!)
        );
    }

    deletePost(postId: number): Observable<BaseResponse> {
        return this.http.delete<BaseResponse>(this.buildUrl(`${API_ENDPOINTS.ADMINPOSTS}/${postId}`));
    }
}