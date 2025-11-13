import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse, Post } from "../../components/interfaces";
import { map } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";

@Injectable({
    providedIn: 'root'
})
export class PostsService extends BaseService {

    getPosts(pageNumber: number = 1, pageSize: number = 10)
        : Observable<{ posts: Post[]; totalCount: number; pageNumber: number; pageSize: number; }> {
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
                })));
    }
}