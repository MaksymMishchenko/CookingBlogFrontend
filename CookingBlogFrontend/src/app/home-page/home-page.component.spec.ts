import { Observable, of, Subject } from "rxjs";
import { HomePageComponent } from "./home-page.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { provideRouter } from "@angular/router";
import { PostsService } from "../shared/services/post/posts.service";
import { createPostCardMock, createPostsServiceResult } from "../core/tests/fixtures/post.fixture";
import { PageChangeDetails } from "../shared/interfaces/global.interface";
import { PaginationParams, PostListDto } from "../shared/interfaces/post.interface";

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;
    let postsServiceSpy: jasmine.SpyObj<PostsService>;

    beforeEach(() => {
        postsServiceSpy = jasmine.createSpyObj('PostsService', ['getPosts']);

        TestBed.configureTestingModule({
            imports: [HomePageComponent],
            providers: [
                { provide: PostsService, useValue: postsServiceSpy },
                provideRouter([])
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })

        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
    });

    function mockPosts(page = 1, size = 3) {
        postsServiceSpy.getPosts.and.returnValue(of(createPostsServiceResult(page, size)));
    }

    describe('ngOnInit()', () => {
        it('should call getPosts on initialization', () => {
            // Arrange
            const paginationParams: PaginationParams = {
                pageNumber: 1,
                pageSize: 3
            };

            component.pageSize = paginationParams.pageSize;
            mockPosts(paginationParams.pageNumber, paginationParams.pageSize);

            // Act
            fixture.detectChanges();

            // Assert           
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                paginationParams,
                { categorySlug: undefined }
            );
        });

    });

    describe('loadPosts()', () => {
        it('should return immediately if isLoading is true (Line 30)', () => {
            mockPosts();
            component.isLoading = true;
            component.loadPosts(2, false);

            expect(postsServiceSpy.getPosts).not.toHaveBeenCalled();
            expect(component.isLoading).toBeTrue();
        });

        it('should append posts when replaceData is false', () => {
            // Arrange            
            const initialPosts: PostListDto[] = [createPostCardMock(1)];
            component.posts = initialPosts;

            const newPosts: PostListDto[] = [createPostCardMock(2)];

            postsServiceSpy.getPosts.and.returnValue(of({
                items: newPosts,
                totalCount: 2,
                pageNumber: 2,
                pageSize: 10,
                searchQuery: undefined
            }));

            // Act
            component.loadPosts(2, false);

            // Assert
            expect(component.posts.length).toBe(2);
            expect(component.posts).toEqual([...initialPosts, ...newPosts]);

            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                {
                    pageNumber: 2,
                    pageSize: component.pageSize
                },
                {
                    categorySlug: undefined
                }
            );
        });

        it('should set isLoading to false if getPosts fails', () => {
            // Arrange
            postsServiceSpy.getPosts.and.returnValue(new Observable((subscriber) => subscriber.error('error')));

            // Act
            component.loadPosts(1, true);

            // Assert
            expect(component.isLoading).toBeFalse();
        });
    });

    describe('onPageChanged', () => {
        it('should handle pageChange from AdaptivePaginationComponent', () => {
            // Arrange            
            const paginationParams: PaginationParams = {
                pageNumber: 2,
                pageSize: 3
            };

            const pageChangeDetails: PageChangeDetails = { page: 2, replace: true };
            mockPosts(paginationParams.pageNumber, paginationParams.pageSize);

            component.pageSize = paginationParams.pageSize;

            const scrollToSpy = spyOn(window, 'scrollTo').and.callFake((options: any) => { });

            // Act
            component.onPageChanged(pageChangeDetails);

            // Assert            
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                jasmine.objectContaining(paginationParams),
                jasmine.objectContaining({ categorySlug: undefined })
            );
            expect(scrollToSpy).toHaveBeenCalled();
        });

        it('should call loadPosts but NOT scroll when onPageChanged is called with replace: false (Line 63)', () => {
            // Arrange            
            const paginationParams: PaginationParams = {
                pageNumber: 3,
                pageSize: 3
            };

            component.pageSize = paginationParams.pageSize;

            const pageChangeDetails: PageChangeDetails = { page: 3, replace: false };
            mockPosts(paginationParams.pageNumber, paginationParams.pageSize);

            const scrollToSpy = spyOn(window, 'scrollTo').and.callFake((options: any) => { });

            // Act
            component.onPageChanged(pageChangeDetails);

            // Assert            
            expect(scrollToSpy).not.toHaveBeenCalled();
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                paginationParams,
                { categorySlug: undefined }
            );
        });

        it('should scroll to top and call loadPosts when onPageChanged is called with replace: true (Line 63-64)', () => {
            // Arrange           
            const paginationParams: PaginationParams = {
                pageNumber: 2,
                pageSize: 3
            };

            component.pageSize = paginationParams.pageSize;

            const pageChangeDetails: PageChangeDetails = { page: 2, replace: true };
            mockPosts(paginationParams.pageNumber, paginationParams.pageSize);
            const scrollToSpy = spyOn(window, 'scrollTo').and.callFake((options: any) => { });

            // Act
            component.onPageChanged(pageChangeDetails);

            // Assert           
            expect(scrollToSpy).toHaveBeenCalled();
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                paginationParams,
                { categorySlug: undefined }
            );
        });
    });

    describe('onModeChanged', () => {
        it('should load posts but NOT scroll when onModeChanged is called with isDesktop: false (Covers Line 58)', () => {
            // Arrange
            const paginationParams: PaginationParams = {
                pageNumber: 1,
                pageSize: 3
            };

            component.pageSize = paginationParams.pageSize;

            mockPosts(paginationParams.pageNumber, paginationParams.pageSize);

            const scrollToSpy = spyOn(window, 'scrollTo');

            // Act
            component.onModeChanged(false);

            // Assert            
            expect(component.isDesktopMode).toBeFalse();
            expect(postsServiceSpy.getPosts).toHaveBeenCalled();
            expect(scrollToSpy).not.toHaveBeenCalled();
        });

        it('should load posts and scroll on desktop', () => {
            // Arrange
            const paginationParams: PaginationParams = {
                pageNumber: 1,
                pageSize: 3
            };

            component.pageSize = paginationParams.pageSize;
            mockPosts(paginationParams.pageNumber, paginationParams.pageSize);

            const scrollToSpy = spyOn(window, 'scrollTo');
            fixture.detectChanges();
            postsServiceSpy.getPosts.calls.reset();

            // Act
            component.onModeChanged(true);

            // Assert
            expect(component.isDesktopMode).toBeTrue();
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                paginationParams,
                { categorySlug: undefined }
            );

            expect(postsServiceSpy.getPosts).toHaveBeenCalledTimes(1);

            expect(scrollToSpy as any).toHaveBeenCalledWith(jasmine.objectContaining({ top: 0, behavior: 'smooth' }));
        });

        describe('Template / DOM rendering', () => {
            it('should show loading template initially', () => {
                // Arrange
                const loading$ = new Subject<any>();
                postsServiceSpy.getPosts.and.returnValue(loading$);
                fixture.detectChanges();

                const compiled = fixture.nativeElement;
                expect(compiled.querySelector('p.center')?.textContent).toContain('Loading...');
                expect(compiled.querySelectorAll('app-post').length).toBe(0);
            });

            it('should render the correct number of post components after data is loaded', () => {
                const pageNumber = 1;
                const pageSize = 3;
                mockPosts(pageNumber, pageSize);

                const serviceResultFixture = createPostsServiceResult(pageNumber, pageSize);

                fixture.detectChanges();

                const compiled = fixture.nativeElement;
                expect(compiled.querySelectorAll('app-post').length).toBe(serviceResultFixture.items.length);
                expect(compiled.querySelector('p.center')).toBeFalsy();
                expect(compiled.querySelector('[cy-data="no-posts-message"]')).toBeFalsy();
            });

            it('should show "No posts found..." when service returns empty', () => {
                // Arrange
                postsServiceSpy.getPosts.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));

                // Act
                fixture.detectChanges();

                // Assert
                const compiled = fixture.nativeElement;
                expect(compiled.querySelector('[cy-data="no-posts-message"] p.center').textContent)
                    .toContain('No posts found...');
                expect(compiled.querySelectorAll('app-post').length).toBe(0);
            });

            it('should render app-adaptive-pagination component', () => {
                // Arrange
                mockPosts(1, 3);

                // Act
                fixture.detectChanges();
                const compiled = fixture.nativeElement;
                const pagination = compiled.querySelector('app-adaptive-pagination');

                // Assert
                expect(pagination).toBeTruthy();
            });
        });
    });
});