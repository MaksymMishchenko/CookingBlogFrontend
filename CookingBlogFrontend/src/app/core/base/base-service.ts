import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { BaseFilters, PagedResult, PaginationParams } from '../../shared/interfaces/post.interface';
import { map, Observable } from 'rxjs';
import { PagedApiResponse } from '../../shared/interfaces/global.interface';

@Injectable()

export abstract class BaseService {

  protected readonly baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) { }

  protected buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  protected fetchPagedData<T, TFilters extends BaseFilters>(
    endpoint: string,
    pagination: PaginationParams,
    filters: TFilters,
    paramBuilder: (filters: TFilters, params: HttpParams) => HttpParams
  ): Observable<PagedResult<T>> {
    let httpParams = new HttpParams()
      .set('pageNumber', (pagination.pageNumber ?? 1).toString())
      .set('pageSize', (pagination.pageSize ?? 10).toString());

    httpParams = paramBuilder(filters, httpParams);

    return this.http.get<PagedApiResponse<T>>(this.buildUrl(endpoint), { params: httpParams })
      .pipe(
        map(response => ({
          items: response.data || [],
          totalCount: response.totalCount || 0,
          pageNumber: response.pageNumber || pagination.pageNumber,
          pageSize: response.pageSize || pagination.pageSize,
          searchQuery: response.appliedFilters?.search || filters.searchTerm || undefined
        } as PagedResult<T>))
      );
  }
  
}