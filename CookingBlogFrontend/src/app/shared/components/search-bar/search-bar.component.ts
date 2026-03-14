import { Component, ElementRef, HostListener, signal, computed, ChangeDetectionStrategy, inject, DestroyRef, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { PaginationParams, PostSearchDto } from '../../interfaces/post.interface';
import { SearchService } from '../../services/search/search.service';

@Component({
    selector: 'app-search-bar',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './search-bar.component.html',
    styleUrl: './search-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
    private readonly router = inject(Router);
    private readonly elementRef = inject(ElementRef);
    protected readonly searchService = inject(SearchService);
    private readonly destroyRef = inject(DestroyRef);

    private readonly PREVIEW_PAGINATION: PaginationParams = { pageNumber: 1, pageSize: 3 };

    searchControl = new FormControl(this.searchService.searchTerm(), { nonNullable: true });

    searchResults = signal<PostSearchDto[]>([]);
    totalResults = signal(0);
    showDropdown = signal(false);

    noResults = computed(() =>
        this.searchResults().length === 0 &&
        this.searchControl.value.trim().length >= 3 &&
        !this.searchService.isLoading()
    );

    constructor() {
        effect(() => {
            this.searchControl.setValue(
                this.searchService.searchTerm(),
                { emitEvent: false }
            );
        });
    }

    ngOnInit(): void {
        this.setupSearchPipeline();
    }

    private setupSearchPipeline(): void {
        this.searchControl.valueChanges
            .pipe(
                map(query => query.trim()),
                debounceTime(300),
                distinctUntilChanged(),
                tap(query => {
                    this.searchService.setSearchTerm(query);

                    if (query.length < 3) {
                        this.resetUI();
                    }
                }),
                filter(query => query.trim().length >= 3),
                switchMap(() => this.searchService.getPosts(this.PREVIEW_PAGINATION)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(response => {
                this.searchResults.set(response.items);
                this.totalResults.set(response.totalCount);
                this.showDropdown.set(response.items.length > 0 || this.noResults());
            });
    }

    private resetUI(): void {
        this.searchResults.set([]);
        this.showDropdown.set(false);
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.showDropdown.set(false);
        }
    }

    clearSearch(): void {
        this.searchControl.setValue('');
        this.resetUI();
    }

    viewAllResults(): void {
        const query = this.searchControl.value.trim();
        if (query.length >= 3) {
            this.showDropdown.set(false);
            this.router.navigate(['/search'], { queryParams: { q: query } });
        }
    }

    selectResult(): void {
        this.showDropdown.set(false);
    }

    preventClose(event: Event): void {
        event.stopPropagation();
    }
}
