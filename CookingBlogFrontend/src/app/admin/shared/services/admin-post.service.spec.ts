import { provideHttpClient, withFetch } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { AdminPostService } from "./admin-post.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../../environments/environment";
import {
    createMockBaseResponse,
    createMockPostCreatedDtoResponse,
    createMockPostDetailsResponse,
    createPostMock,
    updatedMockPostDtoResponse,
    updatedPostMock
} from "../../../core/tests/fixtures/post.fixture";
import { PagedApiResponse } from "../../../shared/interfaces/global.interface";
import { AdminPostListDto } from "../../../shared/interfaces/post.interface";

const API_URL = environment.apiUrl;
const ADMIN_POSTS_ENDPOINT = '/admin/posts';

describe('AdminPostService (Unit tests)', () => {
    let adminPostService: AdminPostService;
    let httpMock: HttpTestingController;

    const POST_BY_ID_URL = (id: number) => `${API_URL}${ADMIN_POSTS_ENDPOINT}/${id}`;

    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                AdminPostService,
                provideHttpClient(withFetch()),
                provideHttpClientTesting()
            ]
        });

        adminPostService = TestBed.inject(AdminPostService);
        httpMock = TestBed.inject(HttpTestingController);

    });

    afterEach(() => {
        httpMock.verify();
    })

    describe('getAdminPosts parameters', () => {

        it('should use default pagination when no params provided', () => {
            // Arrange
            const expectedUrl = `${API_URL}${ADMIN_POSTS_ENDPOINT}?pageNumber=1&pageSize=10`;

            // Act
            adminPostService.getAdminPosts().subscribe();

            // Assert
            const req = httpMock.expectOne(expectedUrl);
            expect(req.request.params.get('pageNumber')).toBe('1');
            expect(req.request.params.get('pageSize')).toBe('10');
            req.flush({ data: [], totalCount: 0 });
        });

        it('should include only categoryId in query params when searchTerm is omitted', () => {
            // Act
            adminPostService.getAdminPosts(undefined, { categoryId: 3 }).subscribe();

            // Assert            
            const req = httpMock.expectOne(request =>
                request.url.includes(ADMIN_POSTS_ENDPOINT) &&
                !request.params.has('search') &&
                request.params.get('categoryId') === '3');

            expect(req.request.params.has('search')).toBeFalse();
            expect(req.request.params.get('categoryId')).toBe('3');
            req.flush({ data: [], totalCount: 0 });
        });

        it('should trim and include search term and categoryId in query params', () => {
            // Act
            adminPostService.getAdminPosts(undefined, { searchTerm: '   angular   ', categoryId: 5 }).subscribe();

            // Assert            
            const req = httpMock.expectOne(request =>
                request.url.includes(ADMIN_POSTS_ENDPOINT) &&
                request.params.get('search') === 'angular' &&
                request.params.get('categoryId') === '5');

            expect(req.request.params.get('search')).toBe('angular');
            expect(req.request.params.get('categoryId')).toBe('5');
            req.flush({ data: [], totalCount: 0 });
        });

        it('should map API response to PagedResult correctly', () => {
            // Arrange
            const mockDataList: AdminPostListDto[] = [
                { id: 1, title: 'Admin Post 1', author: 'Admin', categoryId: 2, categoryName: 'Tech', createdAt: '2026-01-01', isActive: true },
                { id: 2, title: 'Admin Post 2', author: 'Admin', categoryId: 2, categoryName: 'Tech', createdAt: '2026-01-02', isActive: false }
            ];

            const mockResponse: PagedApiResponse<AdminPostListDto> = {
                success: true,
                message: 'Success',
                data: mockDataList,
                totalCount: 20,
                pageNumber: 1,
                pageSize: 10,
                appliedFilters: { search: 'Tech' }
            };

            // Act
            adminPostService.getAdminPosts(
                { pageNumber: 1, pageSize: 10 },
                { searchTerm: 'Tech', categoryId: 2 }
            ).subscribe(result => {
                // Assert
                expect(result.items).toEqual(mockDataList);
                expect(result.items.length).toBe(2);
                expect(result.totalCount).toBe(20);
                expect(result.pageNumber).toBe(1);
                expect(result.pageSize).toBe(10);
                expect(result.searchQuery).toBe('Tech');
            });

            const req = httpMock.expectOne(request => request.urlWithParams.includes('categoryId=2'));
            req.flush(mockResponse);
        });

        it('should use default values when response fields are missing', () => {
            // Arrange
            const mockResponse = {
                success: true,
                message: 'Success'
            };

            // Act
            adminPostService.getAdminPosts({ pageNumber: 2, pageSize: 5 }).subscribe(result => {
                // Assert
                expect(result.items).toEqual([]);
                expect(result.totalCount).toBe(0);
                expect(result.pageNumber).toBe(2);
                expect(result.pageSize).toBe(5);
                expect(result.searchQuery).toBeUndefined();
            });

            const req = httpMock.expectOne(request => request.urlWithParams.includes('pageNumber=2'));
            req.flush(mockResponse);
        });
    });

    describe('getPostById', () => {
        it('should fetch post by id', () => {
            // Arrange
            const postId = 1;
            const mockApiResponse = createMockPostDetailsResponse(postId);
            const expectedPost = mockApiResponse.data;

            // Act
            adminPostService.getPostById(postId).subscribe(response => {
                // Assert
                expect(response).toEqual(expectedPost!);
            });

            const req = httpMock.expectOne(`${POST_BY_ID_URL(postId)}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockApiResponse);
        });

        it('should return post data when request is successful', (done) => {
            // Arrange
            const mockResponse = createMockPostDetailsResponse(1);

            // Act
            adminPostService.getPostById(1).subscribe(response => {
                // Assert
                expect(response).toEqual(mockResponse.data);
                done();
            });

            const req = httpMock.expectOne(`${POST_BY_ID_URL(1)}`);
            req.flush(mockResponse);
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
            adminPostService.createPost(post).subscribe(response => {
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
            adminPostService.updatePost(postId, updatedPost).subscribe(response => {
                // Assert
                expect(response.id).toBe(postId);
                expect(response.title).toBe(updatedPost.title);
                expect(response.createdAt).toEqual(updatedPost.createdAt);
                expect(response).toEqual(updatedPost);
            });

            const req = httpMock.expectOne(expectedUrl);
            expect(req.request.method).toBe('PUT');
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
            adminPostService.deletePost(postId).subscribe(response => {
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