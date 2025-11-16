import { provideHttpClient, withFetch } from "@angular/common/http";
import { PostsService } from "./posts.service";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../../environments/environment";
import { createDynamicPostsResponse, createPostList } from "../../../core/tests/fixtures/posts-dynamic.fixture";

const API_URL = environment.apiUrl;
const POSTS_ENDPOINT = '/posts';

describe('PostsService (Unit tests)', () => {
    let postsService: PostsService;
    let httpMock: HttpTestingController;

    const DEFAULT_URL = `${API_URL}${POSTS_ENDPOINT}?pageNumber=1&pageSize=10`;
    const CUSTOM_PAGE_URL = `${API_URL}${POSTS_ENDPOINT}?pageNumber=3&pageSize=10`

    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                PostsService,
                provideHttpClient(withFetch()),
                provideHttpClientTesting()
            ]
        });

        postsService = TestBed.inject(PostsService);
        httpMock = TestBed.inject(HttpTestingController);

    });

    afterEach(() => {
        httpMock.verify();
    })

    it('should fetch posts', () => {

        const customPage = 1;
        const customSize = 10;

        const customFixture = createDynamicPostsResponse(customPage, customSize);

        postsService.getPosts().subscribe(response => {
            expect(response.posts.length).toBe(customFixture.dataList!.length);
            expect(response.posts).toEqual(customFixture.dataList!);
        });

        const req = httpMock.expectOne(`${DEFAULT_URL}`);

        expect(req.request.method).toBe('GET');

        req.flush(customFixture);
    });

    it('should send correct pagination parameters and map correct data for custom size', () => {
        const customPage = 5;
        const customSize = 25;

        const customFixture = createDynamicPostsResponse(customPage, customSize);

        postsService.getPosts(customPage, customSize).subscribe(response => {
            expect(response.posts.length).toBe(customSize);
            expect(response.pageNumber).toBe(customPage);
            expect(response.pageSize).toBe(customSize);
        });

        const expectedUrlWithParams = `${API_URL}${POSTS_ENDPOINT}?pageNumber=${customPage}&pageSize=${customSize}`;
        const req = httpMock.expectOne(expectedUrlWithParams);

        expect(req.request.params.get('pageNumber')).toBe(customPage.toString());
        expect(req.request.params.get('pageSize')).toBe(customSize.toString());

        req.flush(customFixture);
    });

    it('should use default/passed parameters if API response lacks pagination fields', () => {
        const mockDataPosts = createPostList(10);

        const incompleteResponse = {
            dataList: mockDataPosts,
            totalCount: mockDataPosts.length,
        };

        const passedPage = 3;

        postsService.getPosts(passedPage, 10).subscribe(response => {
            expect(response.pageNumber).toBe(passedPage);
        });

        const req = httpMock.expectOne(CUSTOM_PAGE_URL);
        req.flush(incompleteResponse);
    });

    it('should return empty posts array and totalCount 0 when dataList is null/undefined', () => {
        const emptyDataResponse = {
            success: true,
            message: 'No data',
            pageNumber: 1,
            pageSize: 10,
        };

        postsService.getPosts().subscribe(response => {
            expect(response.posts).toEqual([]);
            expect(response.totalCount).toBe(0);
        });

        const req = httpMock.expectOne(`${DEFAULT_URL}`);
        req.flush(emptyDataResponse);
    });

    it('should correctly map totalCount from the API response', () => {

        const customPage = 1;
        const customSize = 25;

        const customFixture = createDynamicPostsResponse(customPage, customSize);

        postsService.getPosts().subscribe(response => {
            expect(response.totalCount).toBe(customFixture.totalCount!);
        });

        const req = httpMock.expectOne(`${DEFAULT_URL}`);

        req.flush(customFixture);
    });

    it('should handle 500 error on getPosts method', () => {
        postsService.getPosts().subscribe({
            next: () => fail('expected an error'),
            error: (error) => {
                expect(error.status).toBe(500);
            }
        });

        const req = httpMock.expectOne(`${DEFAULT_URL}`);
        req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

});