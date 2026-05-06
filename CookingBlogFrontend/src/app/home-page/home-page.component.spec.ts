import { of, Subject, throwError } from "rxjs";
import { HomePageComponent } from "./home-page.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { provideRouter } from "@angular/router";
import { PostsService } from "../shared/services/post/posts.service";
import { createPostCardMock, createPostsServiceResult } from "../core/tests/fixtures/post.fixture";
import { PageChangeDetails } from "../shared/interfaces/global.interface";
import { PostListDto } from "../shared/interfaces/post.interface";
import { UI_COMMON_MESSAGES, UI_ERROR_MESSAGES } from "../core/constants/ui-messages.constants";

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
        });

        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
    });

    function mockPosts(page = 1, size = 3) {
        postsServiceSpy.getPosts.and.returnValue(of(createPostsServiceResult(page, size)));
    }

    describe('ngOnInit()', () => {
        it('should call getPosts on initialization', () => {
            mockPosts(1, 10);
            fixture.detectChanges();

            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                { pageNumber: 1, pageSize: 10 },
                { categorySlug: undefined }
            );
        });
    });

    describe('loadPosts()', () => {
        it('should not call getPosts if already loading', () => {
            mockPosts();
            component['_isLoading'].set(true);

            component.loadPosts(2, false);

            expect(postsServiceSpy.getPosts).not.toHaveBeenCalled();
        });

        it('should replace posts when replaceData is true', () => {
            const initialPosts: PostListDto[] = [createPostCardMock(1)];
            component.posts.set(initialPosts);

            const newPosts: PostListDto[] = [createPostCardMock(2)];
            postsServiceSpy.getPosts.and.returnValue(of({
                items: newPosts,
                totalCount: 1,
                pageNumber: 1,
                pageSize: 10
            }));

            component.loadPosts(1, true);

            expect(component.posts()).toEqual(newPosts);
            expect(component.viewState()).toBe('data');
        });

        it('should append posts when replaceData is false', () => {
            const initialPosts: PostListDto[] = [createPostCardMock(1)];
            component.posts.set(initialPosts);

            const newPosts: PostListDto[] = [createPostCardMock(2)];
            postsServiceSpy.getPosts.and.returnValue(of({
                items: newPosts,
                totalCount: 2,
                pageNumber: 2,
                pageSize: 10
            }));

            component.loadPosts(2, false);

            expect(component.posts()).toEqual([...initialPosts, ...newPosts]);
        });

        it('should set error state and stop loading on error', () => {
            postsServiceSpy.getPosts.and.returnValue(throwError(() => new Error('error')));

            component.loadPosts(1, true);

            expect(component.viewState()).toBe('error');
            expect(component['_isLoading']()).toBeFalse();
            expect(component.statusMessage()).toBe(UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('posts'));
        });
    });

    describe('onModeChanged()', () => {
        it('should update isDesktopMode and scroll when true', () => {
            const scrollToSpy = spyOn(window, 'scrollTo');
            mockPosts();

            fixture.detectChanges();
            postsServiceSpy.getPosts.calls.reset();

            component.onModeChanged(true);

            expect(component.isDesktopMode()).toBeTrue();
            expect(postsServiceSpy.getPosts).not.toHaveBeenCalled();
            expect(scrollToSpy as any).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        });
    });

    describe('onPageChanged()', () => {
        it('should scroll and load posts when replace is true', () => {
            mockPosts(2, 10);
            const scrollToSpy = spyOn(window, 'scrollTo');
            const details: PageChangeDetails = { page: 2, replace: true };

            component.onPageChanged(details);

            expect(scrollToSpy).toHaveBeenCalled();
            expect(postsServiceSpy.getPosts).toHaveBeenCalledWith(
                { pageNumber: 2, pageSize: 10 },
                { categorySlug: undefined }
            );
        });
    });

    describe('Template rendering (Integration)', () => {

        it('should show loading template while request is pending', () => {
            const pendingSubject = new Subject<any>();
            postsServiceSpy.getPosts.and.returnValue(pendingSubject);

            component.loadPosts(1, true);
            fixture.detectChanges();

            const loadingElement = fixture.nativeElement.querySelector('[cy-data="loading"]');
            expect(loadingElement).toBeTruthy();
            expect(component.viewState()).toBe('loading');
            expect(loadingElement.textContent.trim()).toBe(UI_COMMON_MESSAGES.LOADING);
        });

        it('should show empty state when no posts returned', () => {
            postsServiceSpy.getPosts.and.returnValue(of({
                items: [], totalCount: 0, pageNumber: 1, pageSize: 10
            }));

            fixture.detectChanges();

            expect(component.viewState()).toBe('empty');
            const emptyMsg = fixture.nativeElement.querySelector('[cy-data="no-posts-message"]');
            expect(emptyMsg.textContent).toContain('No posts found');
        });

        it('should render posts and pagination when data is available', () => {
            mockPosts(1, 3);
            fixture.detectChanges();

            expect(component.viewState()).toBe('data');
            expect(fixture.nativeElement.querySelectorAll('app-post').length).toBe(3);
            expect(fixture.nativeElement.querySelector('app-adaptive-pagination')).toBeTruthy();
        });

        it('should show error message and hide post list on backend failure', () => {
            postsServiceSpy.getPosts.and.returnValue(throwError(() => new Error('API error')));

            fixture.detectChanges();

            expect(component.viewState()).toBe('error');
            const errorElement = fixture.nativeElement.querySelector('[cy-data="error-message"]');
            expect(errorElement).toBeTruthy();
            expect(errorElement.textContent).toContain(UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('posts'));
            expect(fixture.nativeElement.querySelector('[cy-data="post-list-container"]')).toBeFalsy();
        });
    });
});