import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPageComponent } from './dashboard-page.component';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { POST_SORT_FIELDS, SORT_DIRECTIONS } from '../../core/constants/sorting.constants';

describe('DashboardPageComponent', () => {
    let component: DashboardPageComponent;
    let fixture: ComponentFixture<DashboardPageComponent>;
    let adminPostServiceSpy: jasmine.SpyObj<AdminPostService>;

    const mockQueryParams = of({ categoryId: '2' });

    const mockPagedResult = {
        items: [
            { id: 1, title: 'Test Post', author: 'Admin', categoryId: 2, categorySlug: 'tech', categoryName: 'Tech', slug: 'test-post', createdAt: '2026-01-01', isActive: true }
        ],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10
    };

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('AdminPostService', ['getAdminPosts']);
        spy.getAdminPosts.and.returnValue(of(mockPagedResult));

        await TestBed.configureTestingModule({
            imports: [DashboardPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: AdminPostService, useValue: spy },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: mockQueryParams }
                }
            ]
        }).compileComponents();

        adminPostServiceSpy = TestBed.inject(AdminPostService) as jasmine.SpyObj<AdminPostService>;
        fixture = TestBed.createComponent(DashboardPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should render link for active post and span for draft post', () => {
        // Arrange
        const activePostResult = {
            ...mockPagedResult,
            items: [{ ...mockPagedResult.items[0], isActive: true, title: 'Active Post' }]
        };

        adminPostServiceSpy.getAdminPosts.and.returnValue(of(activePostResult));

        // Act
        component.loadPosts(1, true);
        fixture.detectChanges();

        // Assert
        let compiled = fixture.nativeElement as HTMLElement;
        let link = compiled.querySelector('td:first-child a');
        let span = compiled.querySelector('td span.text-muted');

        expect(link).toBeTruthy();
        expect(link?.textContent?.trim()).toBe('Active Post');
        expect(span).toBeFalsy();

        // Arrange (for draft state)
        const draftPostResult = {
            ...mockPagedResult,
            items: [{ ...mockPagedResult.items[0], isActive: false, title: 'Draft Post' }]
        };
        adminPostServiceSpy.getAdminPosts.and.returnValue(of(draftPostResult));

        // Act
        component.loadPosts(1, true);
        fixture.detectChanges();

        // Assert
        compiled = fixture.nativeElement as HTMLElement;
        link = compiled.querySelector('td:first-child a');
        span = compiled.querySelector('td span.text-muted');

        expect(link).toBeFalsy();
        expect(span).toBeTruthy();
        expect(span?.textContent?.trim()).toBe('Draft Post');
    });

    it('should load posts and update signals on init based on query params', () => {
        // Arrange & Act (Happens during component initialization in beforeEach/fixtures)

        // Assert
        expect(adminPostServiceSpy.getAdminPosts).toHaveBeenCalledWith(
            jasmine.objectContaining({
                pagination: { pageNumber: 1, pageSize: 10 },
                filters: jasmine.objectContaining({ categoryId: 2 })
            })
        );
        expect(component.posts().length).toBe(1);
        expect(component.totalPostsCount()).toBe(1);
        expect(component.viewState()).toBe('data');
    });

    it('should handle backend error state correctly', () => {
        // Arrange
        adminPostServiceSpy.getAdminPosts.and.returnValue(throwError(() => new Error('Error')));

        // Act
        component.loadPosts(1, true);

        // Assert
        expect(component.viewState()).toBe('error');
        expect(component.statusMessage()).toContain('Failed');
    });

    it('should handle empty posts state correctly when no filters are active', () => {
        // Arrange       
        component.searchControl.setValue('');
        component.statusControl.setValue(null);
        component.categoryControl.setValue(null);

        adminPostServiceSpy.getAdminPosts.and.returnValue(of({
            items: [],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 10
        }));

        // Act
        component.loadPosts(1, true);

        // Assert
        expect(component.viewState()).toBe('empty-total');
    });

    it('should handle empty filtered posts state correctly when filters are active', () => {
        // Arrange     
        component.searchControl.setValue('non-existent-post');

        adminPostServiceSpy.getAdminPosts.and.returnValue(of({
            items: [],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 10
        }));

        // Act
        component.loadPosts(1, true);

        // Assert
        expect(component.viewState()).toBe('empty-filtered');
    });

    it('should update desktop mode and scroll on mode change', () => {
        // Arrange
        spyOn(window, 'scrollTo');

        // Act
        component.onModeChanged(true);

        // Assert
        expect(component.isDesktopMode()).toBeTrue();
        expect(window.scrollTo as any).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('should trigger sorting when clicking on Title header and update parameters', () => {
        // Arrange
        const compiled = fixture.nativeElement as HTMLElement;
        const sortHeader = compiled.querySelector('.sortable-header') as HTMLElement;
        expect(sortHeader).toBeTruthy();

        // Act
        sortHeader.click();
        fixture.detectChanges();

        // Assert
        expect(component.currentSortField()).toBe(POST_SORT_FIELDS.TITLE);
        expect(component.currentSortDirection()).toBe(SORT_DIRECTIONS.ASC);
        expect(adminPostServiceSpy.getAdminPosts).toHaveBeenCalledWith(
            jasmine.objectContaining({
                sort: {
                    sortBy: POST_SORT_FIELDS.TITLE,
                    sortDirection: SORT_DIRECTIONS.ASC
                }
            })
        );
        expect(sortHeader.textContent).toContain('▲');

        // Act
        sortHeader.click();
        fixture.detectChanges();

        // Assert
        expect(component.currentSortField()).toBe(POST_SORT_FIELDS.TITLE);
        expect(component.currentSortDirection()).toBe(SORT_DIRECTIONS.DESC);
        expect(sortHeader.textContent).toContain('▼');

        // Act
        sortHeader.click();
        fixture.detectChanges();

        // Assert
        expect(component.currentSortField()).toBeUndefined();
        expect(component.currentSortDirection()).toBeUndefined();
    });

    it('should trigger sorting when clicking on Date header and update parameters', () => {
        // Arrange
        const compiled = fixture.nativeElement as HTMLElement;
        const sortHeaders = compiled.querySelectorAll('.sortable-header') as NodeListOf<HTMLElement>;

        const dateHeader = sortHeaders[1];
        expect(dateHeader).toBeTruthy();
        expect(dateHeader.textContent).toContain('Date');

        // Act
        dateHeader.click();
        fixture.detectChanges();

        // Assert
        expect(component.currentSortField()).toBe(POST_SORT_FIELDS.CREATED_AT);
        expect(component.currentSortDirection()).toBe(SORT_DIRECTIONS.ASC);
        expect(adminPostServiceSpy.getAdminPosts).toHaveBeenCalledWith(
            jasmine.objectContaining({
                sort: {
                    sortBy: POST_SORT_FIELDS.CREATED_AT,
                    sortDirection: SORT_DIRECTIONS.ASC
                }
            })
        );
        expect(dateHeader.textContent).toContain('▲');

        // Act
        dateHeader.click();
        fixture.detectChanges();

        // Assert
        expect(component.currentSortField()).toBe(POST_SORT_FIELDS.CREATED_AT);
        expect(component.currentSortDirection()).toBe(SORT_DIRECTIONS.DESC);
        expect(dateHeader.textContent).toContain('▼');

        // Act
        dateHeader.click();
        fixture.detectChanges();

        // Assert
        expect(component.currentSortField()).toBeUndefined();
        expect(component.currentSortDirection()).toBeUndefined();
    });
});