import { Observable, of } from "rxjs";
import { HomePageComponent } from "./home-page.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { provideRouter } from "@angular/router";
import { PostsService } from "../shared/services/post/posts.service";
import { createPostsServiceResult } from "../core/tests/fixtures/posts-dynamic.fixture";

describe('HomePageComponent (Integration Test)', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;
    let mockPostsServiceSpy: jasmine.SpyObj<PostsService>;

    beforeEach(() => {
        mockPostsServiceSpy = jasmine.createSpyObj('PostsService', ['getPosts']);

        TestBed.configureTestingModule({
            imports: [HomePageComponent],
            providers: [
                { provide: PostsService, useValue: mockPostsServiceSpy },
                provideRouter([])
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })

        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
    });

    it('should call getPosts on initialization', () => {
        mockPostsServiceSpy.getPosts.and.returnValue(of());
        fixture.detectChanges();
        expect(mockPostsServiceSpy.getPosts).toHaveBeenCalled();

    });

    it('should show loading template initially', () => {
        mockPostsServiceSpy.getPosts.and.returnValue(new Observable());
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('p.center')?.textContent).toContain('Loading...');
        expect(compiled.querySelectorAll('app-post').length).toBe(0);
    });

    it('should render the correct number of post components after data is loaded', () => {
        const customPage = 1;
        const customSize = 3;

        const serviceResultFixture = createPostsServiceResult(customPage, customSize);

        mockPostsServiceSpy.getPosts.and.returnValue(of(serviceResultFixture));
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelectorAll('app-post').length).toBe(serviceResultFixture.posts.length);
        expect(compiled.querySelector('p.center')).toBeFalsy();
    });
});