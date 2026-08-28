import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";

import { PostAdminDetailsDto } from "../../../shared/interfaces/post.interface";
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
}