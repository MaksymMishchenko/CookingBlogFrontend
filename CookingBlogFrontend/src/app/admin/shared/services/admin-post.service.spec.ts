import { provideHttpClient, withFetch } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { AdminPostService } from "./admin-post.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../../environments/environment";
import { createMockPostDetailsResponse } from "../../../core/tests/fixtures/post.fixture";

const API_URL = environment.apiUrl;
const ADMIN_POSTS_ENDPOINT = '/admin/posts';

describe('AdminPostService (Unit tests)', () => {
    let adminPostsService: AdminPostService;
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

        adminPostsService = TestBed.inject(AdminPostService);
        httpMock = TestBed.inject(HttpTestingController);

    });

    afterEach(() => {
        httpMock.verify();
    })

    describe('getPostById', () => {
        it('should fetch post by id', () => {
            // Arrange
            const postId = 1;
            const mockApiResponse = createMockPostDetailsResponse(postId);
            const expectedPost = mockApiResponse.data;

            // Act
            adminPostsService.getPostById(postId).subscribe(response => {
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
            adminPostsService.getPostById(1).subscribe(response => {
                // Assert
                expect(response).toEqual(mockResponse.data);
                done();
            });

            const req = httpMock.expectOne(`${POST_BY_ID_URL(1)}`);
            req.flush(mockResponse);
        });
    });
});