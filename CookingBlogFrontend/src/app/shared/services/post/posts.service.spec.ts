import { provideHttpClient, withFetch } from "@angular/common/http";
import { PostsService } from "./posts.service";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../../environments/environment";
import { apiResponseFixture } from "../../../core/tests/fixtures/api-response.fixture";

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
        postsService.getPosts().subscribe(response => {
            expect(response.posts.length).toBe(apiResponseFixture.dataList!.length);
            expect(response.posts).toEqual(apiResponseFixture.dataList!);
        });

        const req = httpMock.expectOne(`${DEFAULT_URL}`);

        expect(req.request.method).toBe('GET');

        req.flush(apiResponseFixture);
    });

    it('should send correct pagination parameters when custom values are provided', () => {
        const customPage = 5;
        const customSize = 25;

        postsService.getPosts(customPage, customSize).subscribe(response => {
            expect(response.posts.length).toBe(apiResponseFixture.dataList!.length);

            expect(response.pageNumber).toBe(apiResponseFixture.pageNumber);
            expect(response.pageSize).toBe(apiResponseFixture.pageSize);
        });

       const expectedUrlWithParams = `${API_URL}${POSTS_ENDPOINT}?pageNumber=${customPage}&pageSize=${customSize}`;
        const req = httpMock.expectOne(expectedUrlWithParams);

        expect(req.request.params.get('pageNumber')).toBe(customPage.toString());
        expect(req.request.params.get('pageSize')).toBe(customSize.toString());

        req.flush(apiResponseFixture);
    });

    it('should use default/passed parameters if API response lacks pagination fields', () => {
        const incompleteResponse = {
            dataList: apiResponseFixture.dataList,
            totalCount: apiResponseFixture.dataList!.length,
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

        postsService.getPosts().subscribe(response => {
            expect(response.totalCount).toBe(apiResponseFixture.totalCount);
        });

        const req = httpMock.expectOne(`${DEFAULT_URL}`);

        req.flush(apiResponseFixture);
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