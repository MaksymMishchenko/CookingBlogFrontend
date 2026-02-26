import { Injectable } from '@angular/core';
import { BaseService } from '../../../core/base/base-service';
import { catchError, map, Observable, of, retry, timer } from 'rxjs';
import { ListApiResponse } from '../../interfaces/global.interface';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { CategoryListDto } from './category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService {

  getCategories(): Observable<CategoryListDto[]> {
    return this.http.get<ListApiResponse<CategoryListDto>>(
      this.buildUrl(API_ENDPOINTS.CATEGORIES)
    ).pipe(
      retry({
        count: 2,
        delay: (_, retryCount) => {
          return timer(retryCount * 2000);
        }
      }),
      map(response => {
        return (response.data || []).map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug
        } as CategoryListDto));
      }),
      catchError(() => {
        return of([]);
      })
    );
  }
}