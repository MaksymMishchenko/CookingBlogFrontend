import { Component, ElementRef, HostListener, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../services/post/posts.service';
import { FilterParams, PaginationParams, PostSearchDto } from '../../interfaces/post.interface';

@Component({
    selector: 'app-search-bar',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './search-bar.component.html',
    styleUrl: './search-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
    private readonly SEARCH_PAGINATION: PaginationParams = { pageNumber: 1, pageSize: 3 };

    searchControl = new FormControl('', { nonNullable: true });

    searchResults = signal<PostSearchDto[]>([]);
    totalResults = signal(0);
    searchQuery = signal("");
    isLoading = signal(false);
    showDropdown = signal(false);
        
    noResults = computed(() => 
        this.searchResults().length === 0 && 
        this.searchControl.value.trim().length >= 3 && 
        !this.isLoading()
    );

    constructor(
        private postService: PostsService,
        private elementRef: ElementRef) {

        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                map(query => query.trim()),
                distinctUntilChanged(),
                tap(query => {
                    if (query.length < 3) {
                        this.resetUI();
                    }
                }),
                filter(query => query.length >= 3),
                tap(() => this.isLoading.set(true)),
                switchMap(query => {
                    const filters: FilterParams = { searchTerm: query };
                    return this.postService.getPosts<PostSearchDto>(this.SEARCH_PAGINATION, filters)
                        .pipe(
                            catchError(() => {
                                this.resetUI();
                                return of(null);
                            })
                        );
                }),

                takeUntilDestroyed()
            )
            .subscribe(response => {
                this.isLoading.set(false);
                if (!response) {
                    return;
                }
                this.searchResults.set(response.posts);                
                this.showDropdown.set(response.posts.length > 0 || this.noResults());
                this.totalResults.set(response.totalCount);
                this.searchQuery.set(response.searchQuery || this.searchControl.value);
            });
    }

    private resetUI(): void {
        this.searchResults.set([]);
        this.showDropdown.set(false);        
        this.isLoading.set(false);
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.showDropdown.set(false);
        }
    }

    selectResult(): void {
        this.showDropdown.set(false);
    }

    clearSearch(): void {
        this.searchControl.setValue('');
        this.resetUI();
    }

    preventClose(event: Event): void {
        event.stopPropagation();
    }
}
