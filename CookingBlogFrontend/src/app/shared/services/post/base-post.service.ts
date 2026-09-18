import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedResult, PostQueryOptions } from '../../interfaces/post.interface';
import { map, Observable } from 'rxjs';
import { PagedApiResponse } from '../../interfaces/global.interface';
import { BaseService } from '../../../core/services/base/base.service';

@Injectable()

export abstract class BasePostService extends BaseService {

  private removeEmptyParams(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
  }

  protected fetchPagedData<T>(
    endpoint: string,
    options: PostQueryOptions
  ): Observable<PagedResult<T>> {

    const { searchTerm, ...otherFilters } = options.filters || {};

    const rawParams = {
      pageNumber: options.pagination?.pageNumber ?? 1,
      pageSize: options.pagination?.pageSize ?? 10,
      ...(searchTerm?.trim() ? { search: searchTerm.trim() } : {}),
      ...this.removeEmptyParams(otherFilters),
      ...this.removeEmptyParams(options.sort || {})
    };

    const httpParams = new HttpParams({ fromObject: rawParams });

    return this.http.get<PagedApiResponse<T>>(this.buildUrl(endpoint), { params: httpParams })
      .pipe(
        map(response => ({
          items: response.data || [],
          totalCount: response.totalCount || 0,
          pageNumber: response.pageNumber || options.pagination.pageNumber,
          pageSize: response.pageSize || options.pagination.pageSize,
          searchQuery: response.appliedFilters?.search || searchTerm?.trim() || undefined
        } as PagedResult<T>))
      );
  }
}