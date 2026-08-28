import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import {    
    PagedResult,
    PaginationParams,
    PostDetailDto,
    PostListDto
} from "../../interfaces/post.interface";
import { SingleApiResponse } from "../../interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class PostsService extends BaseService {       

    getPosts<T = PostListDto>(
        pagination: PaginationParams = { pageNumber: 1, pageSize: 10 },
        filters: { searchTerm?: string; categorySlug?: string } = {}
    ): Observable<PagedResult<T>> {
        return this.fetchPagedData<T, typeof filters>(
            API_ENDPOINTS.POSTS,
            pagination,
            filters,
            (f, params) => {
                if (f.searchTerm?.trim()) {
                    params = params.set('search', f.searchTerm.trim());
                }
                if (f.categorySlug?.trim()) {
                    params = params.set('categorySlug', f.categorySlug.trim());
                }
                return params;
            }
        );
    }

    getPostBySlug(categorySlug: string, postSlug: string): Observable<PostDetailDto | null> {
        return this.http.get<SingleApiResponse<PostDetailDto>>(this.buildUrl(`${API_ENDPOINTS.POSTS}/${categorySlug}/${postSlug}`)
        ).pipe(
            map(response => response.data)
        );
    }
}