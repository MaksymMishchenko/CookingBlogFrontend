import { HttpContext, HttpParams, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CommentCreatedDto,
  CommentDto,
  CommentScrollResponse,
  CommentScrollResult,
  CommentSubmitEvent,
  CommentUpdatedDto,
  InfiniteScrollParams
} from '../../interfaces/comment.interface';
import { BaseService } from '../../../core/base/base-service';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { BaseResponse, SingleApiResponse } from '../../interfaces/global.interface';
import { AUTH_REDIRECT } from '../../../core/http/auth-context';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends BaseService {

  getComments(
    postId: number,
    params: InfiniteScrollParams = { pageSize: 5, lastId: null }
  ): Observable<CommentScrollResult> {

    let httpParams = new HttpParams().set('pageSize', params.pageSize.toString());

    if (params.lastId != null) {
      httpParams = httpParams.set('lastId', params.lastId.toString());
    }

    const url = `${this.buildUrl(API_ENDPOINTS.POSTS)}/${postId}/comments`;

    return this.http.get<CommentScrollResponse<CommentDto>>(url, {
      params: httpParams
    }).pipe(
      map(response => (
        {
          comments: response.data || [],
          lastId: response.lastId ?? null,
          hasNextPage: response.hasNextPage || false,
          totalCount: response.totalCount || 0
        } as CommentScrollResult)),
      catchError(error => {
        if (error.status === HttpStatusCode.NotFound) { 
          return of({
            comments: [],
            lastId: null,
            hasNextPage: false,
            totalCount: 0
          } as CommentScrollResult);
        }
        return throwError(() => error);
      })
    );
  }

  createComment(postId: number, comment: CommentSubmitEvent): Observable<CommentCreatedDto> {
    const url = `${this.buildUrl(API_ENDPOINTS.COMMENTS)}/${postId}`;
    return this.http.post<SingleApiResponse<CommentCreatedDto>>(url, comment, {
      context: new HttpContext()
        .set(AUTH_REDIRECT, false)
    })
      .pipe(
        map(response => response.data!));
  }

  updateComment(commentId: number, content: string): Observable<CommentUpdatedDto> {
    const url = `${this.buildUrl(API_ENDPOINTS.COMMENTS)}/${commentId}`;
    return this.http.put<SingleApiResponse<CommentUpdatedDto>>(url, { content: content }, {
      context: new HttpContext()
        .set(AUTH_REDIRECT, false)
    })
      .pipe(map(response => response.data!));
  }

  deleteComment(id: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.buildUrl(API_ENDPOINTS.COMMENTS)}/${id}`, {
      context: new HttpContext()
        .set(AUTH_REDIRECT, false)
    });
  }
}
