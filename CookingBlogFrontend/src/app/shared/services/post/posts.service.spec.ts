import { provideHttpClient, withFetch } from "@angular/common/http";
import { PostsService } from "./posts.service";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../../environments/environment";
import {
    createMockBaseResponse,
    createMockPostBySlugDetailsResponse,
    createMockPostCreatedDtoResponse,
    createMockPostDetailsResponse,
    createPostMock,
    updatedMockPostDtoResponse,
    updatedPostMock
} from "../../../core/tests/fixtures/post.fixture";
import { PostListDto } from "../../interfaces/post.interface";
import { PagedApiResponse } from "../../interfaces/global.interface";

const API_URL = environment.apiUrl;
const POSTS_ENDPOINT = '/posts';
const ADMIN_POSTS_ENDPOINT = '/admin/posts';

describe('PostsService (Unit tests)', () => {
    let postsService: PostsService;
    let httpMock: HttpTestingController;

    const POST_BY_ID_URL = (id: number) => `${API_URL}${ADMIN_POSTS_ENDPOINT}/${id}`;
    const POST_BY_SLUG_URL = (catSlug: string, postSlug: string) => `${API_URL}${POSTS_ENDPOINT}/${catSlug}/${postSlug}`;

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

    describe('getPosts parameters', () => {

        it('should use default pagination when no params provided', () => {
            // Arrange
            const expectedUrl = `${API_URL}${POSTS_ENDPOINT}?pageNumber=1&pageSize=10`;

            // Act
            postsService.getPosts().subscribe();

            // Assert
            const req = httpMock.expectOne(expectedUrl);
            expect(req.request.params.get('pageNumber')).toBe('1');
            expect(req.request.params.get('pageSize')).toBe('10');
            req.flush({ data: [], totalCount: 0 });
        });

        it('should trim and include search term in query params', () => {
            // Act
            postsService.getPosts(undefined, { searchTerm: '   coffee   ' }).subscribe();

            // Assert            
            const req = httpMock.expectOne(request =>
                request.url.includes(POSTS_ENDPOINT) &&
                request.params.get('search') === 'coffee');
                
            expect(req.request.params.get('search')).toBe('coffee');
            req.flush({ data: [], totalCount: 0 });
        });

        it('should map API response to PagedPostResult correctly', () => {
            // Arrange
            const mockDataList = [
                { id: 1, title: 'Post 1', commentsCount: 5 } as PostListDto,
                { id: 2, title: 'Post 2', commentsCount: 3 } as PostListDto
            ];

            const mockResponse: PagedApiResponse<PostListDto> = {
                success: true,
                message: 'Success',
                data: mockDataList,
                totalCount: 50,
                pageNumber: 2,
                pageSize: 15,
                appliedFilters: { search: 'desserts' }
            };

            // Act
            postsService.getPosts(
                { pageNumber: 1, pageSize: 10 },
                { searchTerm: 'desserts' }
            ).subscribe(result => {
                // Assert
                expect(result.items).toEqual(mockDataList);
                expect(result.items[0].commentsCount).toBe(5);
                expect(result.totalCount).toBe(50);
                expect(result.pageNumber).toBe(2);
                expect(result.pageSize).toBe(15);
                expect(result.searchQuery).toBe('desserts');
            });

            const req = httpMock.expectOne(request => request.urlWithParams.includes('search=desserts'));
            req.flush(mockResponse);
        });

        it('should use default values when response fields are missing', () => {
            // Arrange
            const mockResponse = {
                success: true,
                message: 'Success'
            };

            // Act
            postsService.getPosts({ pageNumber: 3, pageSize: 25 }).subscribe(result => {
                // Assert
                expect(result.items).toEqual([]);
                expect(result.totalCount).toBe(0);
                expect(result.pageNumber).toBe(3);
                expect(result.pageSize).toBe(25);
                expect(result.searchQuery).toBeUndefined();
            });

            const req = httpMock.expectOne(request => request.urlWithParams.includes('pageNumber=3'));
            req.flush(mockResponse);
        });

        it('should work with custom generic type', () => {
            // Arrange
            interface CustomPost extends PostListDto {
                customField: string;
            }

            const mockResponse: PagedApiResponse<CustomPost> = {
                success: true,
                message: 'Success',
                data: [{
                    id: 1,
                    title: 'Custom Post',
                    customField: 'test value'
                } as CustomPost],
                totalCount: 1,
                pageNumber: 1,
                pageSize: 10
            };

            // Act
            postsService.getPosts<CustomPost>().subscribe(result => {
                // Assert
                expect(result.items[0].customField).toBe('test value');
            });

            const req = httpMock.expectOne(request => request.url.includes(POSTS_ENDPOINT));
            req.flush(mockResponse);
        });

        it('should handle empty or null dataList', () => {
            // Arrange
            const emptyResponse = {
                success: true,
                totalCount: 0
            };

            // Act & Assert
            postsService.getPosts().subscribe(result => {
                expect(result.items).toEqual([]);
                expect(result.totalCount).toBe(0);
            });

            let req = httpMock.expectOne(request => request.url.includes(POSTS_ENDPOINT));
            req.flush(emptyResponse);
        });

        it('should return empty result and NOT throw error when status is 404', (done) => {
            // Act
            postsService.getPosts().subscribe({
                next: (result) => {
                    // Assert
                    expect(result.items.length).toBe(0);
                    expect(result.totalCount).toBe(0);
                    done();
                },
                error: () => fail('should not have thrown an error for 404')
            });

            // Arrange
            const req = httpMock.expectOne(request => request.url.includes(POSTS_ENDPOINT));
            req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        });
    });

    describe('getPostById', () => {
        it('should fetch post by id', () => {
            // Arrange
            const postId = 1;
            const mockApiResponse = createMockPostDetailsResponse(postId);
            const expectedPost = mockApiResponse.data;

            // Act
            postsService.getPostById(postId).subscribe(response => {
                // Assert
                expect(response).toEqual(expectedPost!);
            });

            const req = httpMock.expectOne(`${POST_BY_ID_URL(postId)}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockApiResponse);
        });

        it('should return null on 404 (Not Found) error', (done) => {
            // Arrange
            const postId = 999;

            // Act
            postsService.getPostById(postId).subscribe({
                next: (response) => {
                    // Assert
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

        it('should return post data when request is successful', (done) => {
            // Arrange
            const mockResponse = createMockPostDetailsResponse(1);

            // Act
            postsService.getPostById(1).subscribe(response => {
                // Assert
                expect(response).toEqual(mockResponse.data);
                done();
            });

            const req = httpMock.expectOne(`${POST_BY_ID_URL(1)}`);
            req.flush(mockResponse);
        });

        it('should return null if response data is missing', (done) => {
            // Act
            postsService.getPostById(1).subscribe(response => {
                // Assert
                expect(response).toBeNull();
                done();
            });

            // Arrange
            const req = httpMock.expectOne(`${POST_BY_ID_URL(1)}`);
            req.flush({ data: null });
        });
    });

    describe('getPostBySlug', () => {

        it('should fetch post by slug', () => {
            // Arrange
            const catSlug = "soup";
            const postSlug = 'test-post-slug';
            const mockApiResponse = createMockPostBySlugDetailsResponse(catSlug, postSlug);
            const expectedPost = mockApiResponse.data;

            // Act
            postsService.getPostBySlug(catSlug, postSlug).subscribe(response => {
                // Assert
                expect(response).toEqual(expectedPost!);
            });

            const req = httpMock.expectOne(`${POST_BY_SLUG_URL(catSlug, postSlug)}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockApiResponse);
        });

        it('should return null on 404 (Not Found) error', (done) => {
            // Arrange
            const catSlug = "not-found-category";
            const postSlug = 'test-post-slug-not-found';

            // Act
            postsService.getPostBySlug(catSlug, postSlug).subscribe({
                next: (response) => {
                    // Assert
                    expect(response).toBeNull();
                    done();
                },
                error: (error) => {
                    fail(`Expected to return null, but received an error: ${error.message}`);
                }
            });

            const req = httpMock.expectOne(`${POST_BY_SLUG_URL(catSlug, postSlug)}`);
            req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        });
    });

    describe('createPost', () => {

        it('should create new post successfully', () => {
            // Arrange
            const postId = 1;
            const fixedDate = new Date().toISOString();
            const post = createPostMock(postId, fixedDate);
            const mockApiResponse = createMockPostCreatedDtoResponse(postId, fixedDate);

            // Act
            postsService.createPost(post).subscribe(response => {
                // Assert
                expect(response).toEqual(post);
            });

            const req = httpMock.expectOne(`${API_URL}${ADMIN_POSTS_ENDPOINT}`);
            expect(req.request.method).toBe('POST');
            req.flush(mockApiResponse);
        });
    });

    describe('updatePost', () => {

        it('should update existing post successfully', () => {
            // Arrange
            const postId = 1;
            const fixedDate = new Date().toISOString();
            const updatedPost = updatedPostMock(postId, fixedDate);
            const mockApiResponse = updatedMockPostDtoResponse(postId, fixedDate);
            const expectedUrl = `${API_URL}${ADMIN_POSTS_ENDPOINT}/${postId}`;

            // Act
            postsService.updatePost(postId, updatedPost).subscribe(response => {
                // Assert
                expect(response.id).toBe(postId);
                expect(response.title).toBe(updatedPost.title);
                expect(response.createdAt).toEqual(updatedPost.createdAt);
                expect(response).toEqual(updatedPost);
            });

            const req = httpMock.expectOne(expectedUrl);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(updatedPost);
            req.flush(mockApiResponse);
        });
    });

    describe('deletePost', () => {

        it('should delete existing post by id', () => {
            // Arrange
            const postId = 1;
            const mockApiResponse = createMockBaseResponse();
            const expectedUrl = `${API_URL}${ADMIN_POSTS_ENDPOINT}/${postId}`;

            // Act
            postsService.deletePost(postId).subscribe(response => {
                // Assert
                expect(response.success).toEqual(mockApiResponse.success);
                expect(response.message).toEqual(mockApiResponse.message);
            });

            const req = httpMock.expectOne(expectedUrl);
            expect(req.request.method).toBe('DELETE');
            req.flush(mockApiResponse);
        });
    });
});