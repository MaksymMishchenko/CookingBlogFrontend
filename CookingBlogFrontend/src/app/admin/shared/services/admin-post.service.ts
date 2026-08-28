import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";

import {
    CreatedPostDto,
    CreatePostRequest,
    PostAdminDetailsDto,
    UpdatedPostDto,
    UpdatePostRequest
} from "../../../shared/interfaces/post.interface";
import { SingleApiResponse } from "../../../shared/interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class AdminPostService extends BaseService {
    getPostById(id: number): Observable<PostAdminDetailsDto | null> {
        return this.http.get<SingleApiResponse<PostAdminDetailsDto>>(this.buildUrl(`${API_ENDPOINTS.ADMINPOSTS}/${id}`)
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
        return this.http.put<SingleApiResponse<UpdatedPostDto>>(
            this.buildUrl(`${API_ENDPOINTS.ADMINPOSTS}/${postId}`),
            post
        ).pipe(
            map(response => response.data!)
        );
    }
}