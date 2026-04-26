import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { CommentCreatedDto, CommentSubmitEvent, CommentUpdatedDto } from '../../interfaces/comment.interface';
import { SingleApiResponse } from '../../interfaces/global.interface';
import { AUTH_REDIRECT } from '../../../core/http/auth-context';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should have AUTH_REDIRECT false for mutation methods', () => {
    // Arrange
    const commentId = 1;
    const submitData = { content: 'test' };

    // Act
    service.createComment(commentId, submitData).subscribe();

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/${API_ENDPOINTS.COMMENTS}/1`);
    const context = req.request.context;
    expect(context.get(AUTH_REDIRECT)).toBeFalse();
  });

  describe('getComments', () => {
    const postId = 123;
    const mockUrl = `${baseUrl}/${API_ENDPOINTS.POSTS}/${postId}/comments`;

    it('should fetch comments and map to CommentScrollResult', () => {
      // Arrange
      const mockApiResponse = {
        data: [{ id: 1, content: 'Test comment' }],
        lastId: 1,
        hasNextPage: true,
        totalCount: 10
      };

      // Act
      service.getComments(postId).subscribe(result => {
        // Assertions inside subscribe
        expect(result.comments.length).toBe(1);
        expect(result.lastId).toBe(1);
        expect(result.hasNextPage).toBeTrue();
        expect(result.totalCount).toBe(10);
      });

      // Assert
      const req = httpMock.expectOne(request => request.url === mockUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageSize')).toBe('5');
      req.flush(mockApiResponse);
    });

    it('should handle lastId parameter correctly', () => {
      // Arrange
      const params = { pageSize: 10, lastId: 50 };

      // Act
      service.getComments(postId, params).subscribe();

      // Assert
      const req = httpMock.expectOne(request =>
        request.url === mockUrl &&
        request.params.get('lastId') === '50' &&
        request.params.get('pageSize') === '10'
      );

      expect(req.request.params.get('lastId')).toBe('50');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.method).toBe('GET');

      req.flush({});
    });

    it('should return empty result on 404 error (Soft Fallback)', () => {
      // Act
      service.getComments(postId).subscribe(result => {
        expect(result.comments).toEqual([]);
        expect(result.lastId).toBeNull();
        expect(result.hasNextPage).toBeFalse();
      });

      // Act
      const req = httpMock.expectOne(request => request.url === mockUrl);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  it('should POST new comment and return created data', () => {
    // Arrange
    const targetId = 1;
    const submitData: CommentSubmitEvent = { content: 'New comment content' };
    const mockCreated: CommentCreatedDto = {
      id: 99,
      author: 'Admin',
      content: 'New comment content',
      createdAt: new Date().toISOString(),
      userId: 'u-1',
      parentId: null,
      replies: []
    };

    // Act
    service.createComment(targetId, submitData).subscribe(res => {
      // Assert
      expect(res).toEqual(mockCreated);
    });

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/${API_ENDPOINTS.COMMENTS}/${targetId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(submitData);

    req.flush({ success: true, data: mockCreated } as SingleApiResponse<CommentCreatedDto>);
  });

  it('should PUT updated content and return updated dto', () => {
    // Arrange
    const commentId = 55;
    const newContent = 'Updated content';
    const mockUpdated: CommentUpdatedDto = {
      id: commentId,
      content: newContent,
      author: 'Admin',
      userId: 'u-1',
      createdAt: new Date().toISOString()
    };

    // Act
    service.updateComment(commentId, newContent).subscribe(res => {
      expect(res).toEqual(mockUpdated);
    });

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/${API_ENDPOINTS.COMMENTS}/${commentId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ content: newContent });
    req.flush({ success: true, data: mockUpdated } as SingleApiResponse<CommentUpdatedDto>);
  });

  it('should send DELETE request to correct URL and return BaseResponse', () => {
    // Arrange
    const commentId = 77;
    const mockResponse = { success: true, message: 'Comment deleted' };

    // Act
    service.deleteComment(commentId).subscribe(res => {     
      expect(res.success).toBeTrue();
    });

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/${API_ENDPOINTS.COMMENTS}/${commentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});