import { Observable, of } from "rxjs";
import { HomePageComponent } from "./home-page.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { provideRouter } from "@angular/router";
import { PostsService } from "../shared/services/post/posts.service";
import { createPostsServiceResult } from "../core/tests/fixtures/post.fixture";

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
        // Arrange
        mockPostsServiceSpy.getPosts.and.returnValue(of());
        fixture.detectChanges();

        // Act
        const result = mockPostsServiceSpy.getPosts;

        // Assert
        expect(result).toHaveBeenCalled();
    });

    it('should show loading template initially', () => {
        // Arrange
        mockPostsServiceSpy.getPosts.and.returnValue(new Observable());

        // Act
        fixture.detectChanges();
        const compiled = fixture.nativeElement;

        // Assert
        expect(compiled.querySelector('p.center')?.textContent).toContain('Loading...');
        expect(compiled.querySelectorAll('app-post').length).toBe(0);
    });

    it('should render the correct number of post components after data is loaded', () => {
        // Arrange
        const customPage = 1;
        const customSize = 3;

        // Act
        const serviceResultFixture = createPostsServiceResult(customPage, customSize);
        mockPostsServiceSpy.getPosts.and.returnValue(of(serviceResultFixture));
        fixture.detectChanges();

        const compiled = fixture.nativeElement;

        // Assert
        expect(compiled.querySelectorAll('app-post').length).toBe(serviceResultFixture.posts.length);
        expect(compiled.querySelector('p.center')).toBeFalsy();
    });
});