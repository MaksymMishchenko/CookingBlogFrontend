import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { catchError, finalize, map, of, filter } from 'rxjs';

import {
  FilterParams,
  PagedResult,
  PaginationParams,
  PostSearchDto
} from '../../interfaces/post.interface';

import { PostsService } from '../post/posts.service';

@Injectable({ providedIn: 'root' })
export class SearchService {

  private postService = inject(PostsService);
  private router = inject(Router);

  readonly searchTerm = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.listenRouteChanges();
  }

  setSearchTerm(query: string) {
    this.searchTerm.set(query.trim().slice(0, 100));
  }

  clear() {
    this.searchTerm.set('');
  }

  getPosts(
    pagination: PaginationParams,
    extraFilters: FilterParams = {}
  ) {
    this.isLoading.set(true);

    const filters: FilterParams = {
      searchTerm: this.searchTerm(),
      ...extraFilters
    };

    return this.postService.getPosts<PostSearchDto>(pagination, filters).pipe(
      map(res => ({
        ...res,
        items: res.items.map(p => ({
          ...p,
          searchSnippet:
            p.searchSnippet ||
            p.description ||
            'No description available'
        }))
      })),
      finalize(() => this.isLoading.set(false)),
      catchError(() =>
        of({
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: pagination.pageSize
        } as PagedResult<PostSearchDto>)
      )
    );
  }

  private listenRouteChanges() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {

        const leavingSearchPage =
          this.router.url.startsWith('/search') &&
          !event.url.startsWith('/search');

        if (leavingSearchPage) {
          this.clear();
        }
      });
  }
}