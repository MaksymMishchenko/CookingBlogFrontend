import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { BasePostService } from "./base-post.service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import {    
    PagedResult,    
    PostQueryOptions,
    PostDetailDto as PublicPostDetailDto,
    PostListDto as PublicPostListDto
} from "../../interfaces/post.interface";
import { SingleApiResponse } from "../../interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class PublicPostsService extends BasePostService {       

    getPosts<T = PublicPostListDto>(
        options: PostQueryOptions = {
            pagination: { pageNumber: 1, pageSize: 10 }
        }
    ): Observable<PagedResult<T>> {
        return this.fetchPagedData<T>(
            API_ENDPOINTS.PUBLIC_POSTS,
            options
        );
    }

    getPostBySlug(categorySlug: string, postSlug: string): Observable<PublicPostDetailDto | null> {
        return this.http.get<SingleApiResponse<PublicPostDetailDto>>(this.buildUrl(`${API_ENDPOINTS.PUBLIC_POSTS}/${categorySlug}/${postSlug}`)
        ).pipe(
            map(response => response.data)
        );
    }
}