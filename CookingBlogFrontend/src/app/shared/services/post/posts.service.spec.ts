import { provideHttpClient, withFetch } from "@angular/common/http";
import { PostsService } from "./posts.service";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../../environments/environment";
import { createDynamicPostsResponse, createMockPost, createMockPostItemResponse, createPostList } from "../../../core/tests/fixtures/post.fixture";

const API_URL = environment.apiUrl;
const POSTS_ENDPOINT = '/posts';

describe('PostsService (Unit tests)', () => {
    let postsService: PostsService;
    let httpMock: HttpTestingController;

    const DEFAULT_URL = `${API_URL}${POSTS_ENDPOINT}?pageNumber=1&pageSize=10`;
    const CUSTOM_PAGE_URL = `${API_URL}${POSTS_ENDPOINT}?pageNumber=3&pageSize=10`;
    const POST_BY_ID_URL = (id: number) => `${API_URL}${POSTS_ENDPOINT}/${id}`;
    const POST_BY_SLUG_URL = (postSlug: string) => `${API_URL}${POSTS_ENDPOINT}/${postSlug}`;

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

    it('should fetch post by id', () => {
        const postId = 1;
        const mockApiResponse = createMockPostItemResponse(postId);

        const expectedPost = mockApiResponse.data;

        postsService.getPostById(postId).subscribe(response => {
            expect(response).toEqual(expectedPost!);
        });

        const req = httpMock.expectOne(`${POST_BY_ID_URL(postId)}`);

        expect(req.request.method).toBe('GET');

        req.flush(mockApiResponse);
    });

    it('should return null on 404 (Not Found) error', (done) => {
        const postId = 999;

        postsService.getPostById(postId).subscribe({
            next: (response) => {
                expect(response).toBeNull();
                done();
            },
            error: (error) => {
                fail(`Expected to return null, but received an error: ${error.message}`);
            }
        });

        const req = httpMock.expectOne(`${POST_BY_ID_URL(postId)}`);

        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should re-throw non-404 errors (e.g., 500 Internal Server Error)', (done) => {
        const postId = 1;

        postsService.getPostById(postId).subscribe({
            next: () => {
                fail('Expected an error, but received a successful response.');
            },
            error: (error) => {
                expect(error.status).toBe(500);
                expect(error.statusText).toBe('Internal Server Error');
                done();
            }
        });

        const req = httpMock.expectOne(`${POST_BY_ID_URL(postId)}`);

        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should fetch post by slug', () => {
        const postSlug = 'test-post-slug';
        const mockApiResponse = createMockPostItemResponse(postSlug);

        const expectedPost = mockApiResponse.data;

        postsService.getPostBySlug(postSlug).subscribe(response => {
            expect(response).toEqual(expectedPost!);
        });

        const req = httpMock.expectOne(`${POST_BY_SLUG_URL(postSlug)}`);

        expect(req.request.method).toBe('GET');

        req.flush(mockApiResponse);
    });

    it('should return null on 404 (Not Found) error', (done) => {
        const postSlug = 'test-post-slug-not-found';

        postsService.getPostBySlug(postSlug).subscribe({
            next: (response) => {
                expect(response).toBeNull();
                done();
            },
            error: (error) => {
                fail(`Expected to return null, but received an error: ${error.message}`);
            }
        });

        const req = httpMock.expectOne(`${POST_BY_SLUG_URL(postSlug)}`);

        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should re-throw non-404 errors (e.g., 500 Internal Server Error)', (done) => {
        const postSlug = 'test-post-slug-not-found';

        postsService.getPostBySlug(postSlug).subscribe({
            next: () => {
                fail('Expected an error, but received a successful response.');
            },
            error: (error) => {
                expect(error.status).toBe(500);
                expect(error.statusText).toBe('Internal Server Error');
                done();
            }
        });

        const req = httpMock.expectOne(`${POST_BY_SLUG_URL(postSlug)}`);

        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should create new post successfully', () => {
        const postId = 1;
        const post = createMockPost(postId);
        const mockApiResponse = createMockPostItemResponse(postId);

        postsService.createPost(post).subscribe(response => {
            expect(response.data).toEqual(post);
        });

        const req = httpMock.expectOne(`${API_URL}${POSTS_ENDPOINT}`);

        expect(req.request.method).toBe('POST');

        req.flush(mockApiResponse);
    });

    it('should propagate a 400 Bad Request error on createPost method', () => {
        const post = createMockPost(1);
        const mockStatus = 400;
        const mockStatusText = 'Bad Request';
        const mockErrorMessage = 'Title field cannot be empty.';

        let caughtError: any;

        postsService.createPost(post).subscribe({
            next: () => fail('Expected an error, but got successful response.'),
            error: (error) => {
                caughtError = error;
                expect(error.status).toBe(mockStatus);
            }
        });

        const req = httpMock.expectOne(`${API_URL}${POSTS_ENDPOINT}`);

        expect(req.request.method).toBe('POST');

        req.flush(mockErrorMessage, {
            status: mockStatus,
            statusText: mockStatusText
        });

        expect(caughtError).toBeDefined();
        expect(caughtError.error).toBe(mockErrorMessage);
    });

    it('should handle 500 error on createPost method', () => {
        const postId = 1;
        const post = createMockPost(postId);
        postsService.createPost(post).subscribe({
            next: () => fail('expected an error'),
            error: (error) => {
                expect(error.status).toBe(500);
            }
        });

        const req = httpMock.expectOne(`${API_URL}${POSTS_ENDPOINT}`);
        req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should update existing post successfully', () => {
        const postId = 1;

        const postToUpdate = createMockPost(postId);
        postToUpdate.title = "Updated Title";

        const mockApiResponse = createMockPostItemResponse(postId);
        mockApiResponse.data = postToUpdate;

        postsService.updatePost(postToUpdate).subscribe(response => {

            expect(response.data!.createAt.getTime())
                .toEqual(mockApiResponse.data!.createAt.getTime());

            expect(response.data!.comments[0].createAt.getTime())
                .toEqual(mockApiResponse.data!.comments[0].createAt.getTime());

            const expectedDataWithoutDates = { ...mockApiResponse.data, createAt: null, comments: null };
            const actualDataWithoutDates = { ...response.data, createAt: null, comments: null };

            expect(actualDataWithoutDates).toEqual(expectedDataWithoutDates);
        });

        const expectedUrl = `${API_URL}${POSTS_ENDPOINT}/${postId}`;
        const req = httpMock.expectOne(expectedUrl);

        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(postToUpdate);

        req.flush(mockApiResponse);
    });

    it('should propagate a 400 Bad Request error on updatePost method', () => {
        const postId = 1;

        const postToUpdate = createMockPost(postId);
        postToUpdate.title = "Updated Title";

        const mockApiResponse = createMockPostItemResponse(postId);
        mockApiResponse.data = postToUpdate;

        const mockStatus = 400;
        const mockStatusText = 'Bad Request';
        const mockErrorMessage = 'Title field cannot be empty.';

        let caughtError: any;

        postsService.updatePost(postToUpdate).subscribe({
            next: () => fail('Expected an error, but got successful response.'),
            error: (error) => {
                caughtError = error;
                expect(error.status).toBe(mockStatus);

                expect(caughtError).toBeDefined();
                expect(caughtError.error).toBe(mockErrorMessage);
            }
        });

        const req = httpMock.expectOne(`${API_URL}${POSTS_ENDPOINT}/${postId}`);

        expect(req.request.method).toBe('PATCH');

        req.flush(mockErrorMessage, {
            status: mockStatus,
            statusText: mockStatusText
        });
    });

    it('should handle 500 error on updatePost method', () => {
        const postId = 1;
        const post = createMockPost(postId);
        postsService.updatePost(post).subscribe({
            next: () => fail('expected an error'),
            error: (error) => {
                expect(error.status).toBe(500);
            }
        });

        const req = httpMock.expectOne(`${API_URL}${POSTS_ENDPOINT}/${postId}`);
        req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should delete existing post by id', () => {
        const postId = 1;
        const mockApiResponse = createMockPostItemResponse(postId);

        postsService.deletePost(postId).subscribe(response => {

            expect(response.entityId).toEqual(mockApiResponse.entityId!);
        });

        const expectedUrl = `${API_URL}${POSTS_ENDPOINT}/${postId}`;
        const req = httpMock.expectOne(expectedUrl);

        expect(req.request.method).toBe('DELETE');
        req.flush(mockApiResponse);
    });

    it('should handle 500 error on deletePost method', () => {
        const postId = 1;        

        postsService.deletePost(postId).subscribe({
            next: () => fail('expected an error'),
            error: (error) => {
                expect(error.status).toBe(500);
            }
        });

        const req = httpMock.expectOne(`${API_URL}${POSTS_ENDPOINT}/${postId}`);
        req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

});