import { Observable, of, Subject } from "rxjs";
import { HomePageComponent } from "./home-page.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { provideRouter } from "@angular/router";
import { PostsService } from "../shared/services/post/posts.service";
import { createPostsServiceResult } from "../core/tests/fixtures/post.fixture";
import { PageChangeDetails } from "../shared/interfaces/global.interface";
import { Post } from "../shared/interfaces/post.interface";

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
            const customPage = 1;
            const customSize = 3;
            mockPosts(customPage, customSize);

            // Act
            fixture.detectChanges();

            // Assert
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(customPage, component.pageSize);
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
            const initialPosts = [{ id: 1, title: 'Post 1' }] as Post[];
            component.posts = initialPosts;

            const newPosts = [{ id: 2, title: 'Post 2' }] as Post[];
            postsServiceSpy.getPosts.and.returnValue(of({ posts: newPosts, totalCount: 2, pageNumber: 2, pageSize: 10 }));

            // Act
            component.loadPosts(2, false);

            // Assert
            expect(component.posts.length).toBe(2);
            expect(component.posts).toEqual([...initialPosts, ...newPosts]);
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
            const pageNumber = 2;
            const pageSize = 3;
            const pageChangeDetails: PageChangeDetails = { page: 2, replace: true };
            mockPosts(pageNumber, pageSize);

            const scrollToSpy = spyOn(window, 'scrollTo').and.callFake((options: any) => { });

            // Act
            component.onPageChanged(pageChangeDetails);

            // Assert
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(2, component.pageSize);
            expect(scrollToSpy).toHaveBeenCalled();
        });

        it('should call loadPosts but NOT scroll when onPageChanged is called with replace: false (Line 63)', () => {
            // Arrange
            const pageNumber = 3;
            const pageSize = 3;
            const pageChangeDetails: PageChangeDetails = { page: 3, replace: false };
            mockPosts(pageNumber, pageSize);

            const scrollToSpy = spyOn(window, 'scrollTo').and.callFake((options: any) => { });

            // Act
            component.onPageChanged(pageChangeDetails);

            // Assert            
            expect(scrollToSpy).not.toHaveBeenCalled();
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(3, component.pageSize);
        });

        it('should scroll to top and call loadPosts when onPageChanged is called with replace: true (Line 63-64)', () => {
            // Arrange
            const pageNumber = 2;
            const pageSize = 3;
            const pageChangeDetails: PageChangeDetails = { page: 2, replace: true };
            mockPosts(pageNumber, pageSize);
            const scrollToSpy = spyOn(window, 'scrollTo').and.callFake((options: any) => { });

            // Act
            component.onPageChanged(pageChangeDetails);

            // Assert           
            expect(scrollToSpy).toHaveBeenCalled();
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(2, component.pageSize);
        });
    });

    describe('onModeChanged', () => {
        it('should load posts but NOT scroll when onModeChanged is called with isDesktop: false (Covers Line 58)', () => {
            // Arrange
            const pageNumber = 1;
            const pageSize = 3;
            mockPosts(pageNumber, pageSize);

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
            const pageNumber = 1;
            const pageSize = 3;
            mockPosts(pageNumber, pageSize);

            spyOn(window, 'scrollTo');

            // Act
            component.onModeChanged(true);
            fixture.detectChanges();

            // Assert
            expect(component.isDesktopMode).toBeTrue();
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(1, component.pageSize);
            expect(window.scrollTo).toHaveBeenCalled();
        });
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
            expect(compiled.querySelectorAll('app-post').length).toBe(serviceResultFixture.posts.length);
            expect(compiled.querySelector('p.center')).toBeFalsy();
            expect(compiled.querySelector('[cy-data="no-posts-message"]')).toBeFalsy();
        });

        it('should show "No posts found..." when service returns empty', () => {
            // Arrange
            postsServiceSpy.getPosts.and.returnValue(of({ posts: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));

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