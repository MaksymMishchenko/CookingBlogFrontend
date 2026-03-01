import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, map, of } from 'rxjs';
import { FilterParams, PagedResult, PaginationParams, PostSearchDto } from '../../interfaces/post.interface';
import { PostsService } from '../post/posts.service';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private postService = inject(PostsService);

  readonly searchTerm = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  setSearchTerm(query: string) {
    this.searchTerm.set(query.trim().slice(0, 100));
  }

  getPosts(pagination: PaginationParams, extraFilters: FilterParams = {}) {
    this.isLoading.set(true);
    
    const filters: FilterParams = {        
      searchTerm: this.searchTerm(),
      ...extraFilters 
    };

    return this.postService.getPosts<PostSearchDto>(pagination, filters).pipe(
      map(res => ({
        ...res,
        posts: res.items.map(p => ({
          ...p,          
          searchSnippet: p.searchSnippet || p.description || 'No description available'
        }))
      })),
      finalize(() => this.isLoading.set(false)),      
      catchError(() => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 } as PagedResult<PostSearchDto>))
    );
  }
}