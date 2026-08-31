import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import {
    AdminPostListDto,
    CreatedPostDto,
    CreatePostRequest,
    PagedResult,
    PaginationParams,
    PostAdminDetailsDto,
    UpdatedPostDto,
    UpdatePostRequest
} from "../../../shared/interfaces/post.interface";
import { BaseResponse, SingleApiResponse } from "../../../shared/interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class AdminPostService extends BaseService {

    getAdminPosts(
        pagination: PaginationParams = { pageNumber: 1, pageSize: 10 },
        filters: { searchTerm?: string; categoryId?: number } = {}
    ): Observable<PagedResult<AdminPostListDto>> {
        return this.fetchPagedData<AdminPostListDto, typeof filters>(
            API_ENDPOINTS.ADMIN_POSTS,
            pagination,
            filters,
            (f, params) => {
                if (f.searchTerm?.trim()) {
                    params = params.set('search', f.searchTerm.trim());
                }
                if (f.categoryId !== undefined && f.categoryId !== null) {
                    params = params.set('categoryId', f.categoryId.toString());
                }
                return params;
            }
        );
    }

    getPostById(id: number): Observable<PostAdminDetailsDto | null> {
        return this.http.get<SingleApiResponse<PostAdminDetailsDto>>(this.buildUrl(`${API_ENDPOINTS.ADMIN_POSTS}/${id}`)
        ).pipe(
            map(response => response.data)
        );
    }

    createPost(post: CreatePostRequest): Observable<CreatedPostDto> {
        return this.http.post<SingleApiResponse<CreatedPostDto>>(this.buildUrl(API_ENDPOINTS.ADMIN_POSTS),
            post
        ).pipe(
            map(response => response.data!)
        );
    }

    updatePost(postId: number, post: UpdatePostRequest): Observable<UpdatedPostDto> {
        return this.http.put<SingleApiResponse<UpdatedPostDto>>(
            this.buildUrl(`${API_ENDPOINTS.ADMIN_POSTS}/${postId}`),
            post
        ).pipe(
            map(response => response.data!)
        );
    }

    deletePost(postId: number): Observable<BaseResponse> {
        return this.http.delete<BaseResponse>(this.buildUrl(`${API_ENDPOINTS.ADMIN_POSTS}/${postId}`));
    }
    
}