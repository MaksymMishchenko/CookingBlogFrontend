import { Injectable } from "@angular/core";
import { BaseService } from "../../../../core/services/base/base.service";
import { API_ENDPOINTS } from "../../../../core/constants/api-endpoints";
import { AuthorDto } from "../../../user.interface";
import { map, Observable } from "rxjs";
import { SingleApiResponse } from "../../../../shared/interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService {

    getAllAuthors(): Observable<AuthorDto[]> {
        return this.http.get<SingleApiResponse<AuthorDto[]>>(
            this.buildUrl(API_ENDPOINTS.USER.AUTHORS)
        ).pipe(            
            map(response => response.data ?? [])            
        );
    }
}