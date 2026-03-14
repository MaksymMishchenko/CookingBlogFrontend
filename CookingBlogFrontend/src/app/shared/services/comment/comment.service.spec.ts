import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { CommentCreatedDto, CommentSubmitEvent, CommentUpdatedDto } from '../../interfaces/comment.interface';
import { SingleApiResponse } from '../../interfaces/global.interface';

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

  describe('getComments', () => {
    const postId = 123;
    const mockUrl = `${baseUrl}/${API_ENDPOINTS.POSTS}/${postId}/comments`;

    it('should fetch comments and map to CommentScrollResult', () => {
      const mockApiResponse = {
        data: [{ id: 1, content: 'Test comment' }],
        lastId: 1,
        hasNextPage: true,
        totalCount: 10
      };

      service.getComments(postId).subscribe(result => {
        expect(result.comments.length).toBe(1);
        expect(result.lastId).toBe(1);
        expect(result.hasNextPage).toBeTrue();
        expect(result.totalCount).toBe(10);
      });

      const req = httpMock.expectOne(request => request.url === mockUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageSize')).toBe('5');
      req.flush(mockApiResponse);
    });

    it('should handle lastId parameter correctly', () => {
      service.getComments(postId, { pageSize: 10, lastId: 50 }).subscribe();

      const req = httpMock.expectOne(request =>
        request.url === mockUrl &&
        request.params.get('lastId') === '50' &&
        request.params.get('pageSize') === '10'
      );
      req.flush({});
    });

    it('should return empty result on 404 error (Soft Fallback)', () => {
      service.getComments(postId).subscribe(result => {
        expect(result.comments).toEqual([]);
        expect(result.lastId).toBeNull();
        expect(result.hasNextPage).toBeFalse();
      });

      const req = httpMock.expectOne(request => request.url === mockUrl);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createComment', () => {
    it('should POST new comment and return created data', () => {
      const submitData: CommentSubmitEvent = { content: 'New comment content' };
      const mockCreated: CommentCreatedDto = { 
        id: 99, 
        author: 'Admin', 
        content: 'New comment content',
        createdAt: new Date().toISOString(),
        userId: 'u-1',
        parentId: null,
        replies: [],
        isEditedByAdmin: false
      };

      service.createComment(1, submitData).subscribe(res => {
        expect(res).toEqual(mockCreated);
      });

      const req = httpMock.expectOne(`${baseUrl}/${API_ENDPOINTS.COMMENTS}/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(submitData);
      req.flush({ success: true, data: mockCreated } as SingleApiResponse<CommentCreatedDto>);
    });
  });

  describe('updateComment', () => {
    it('should PUT updated content and return updated dto', () => {
      const commentId = 55;
      const newContent = 'Updated content';
      const mockUpdated: CommentUpdatedDto = { 
      id: commentId, 
      content: newContent,
      isEditedByAdmin: false,
      author: 'Admin',
      userId: 'u-1',
      createdAt: new Date().toISOString()
    };

      service.updateComment(commentId, newContent).subscribe(res => {
        expect(res).toEqual(mockUpdated);
      });

      const req = httpMock.expectOne(`${baseUrl}/${API_ENDPOINTS.COMMENTS}/${commentId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ content: newContent });
      req.flush({ success: true, data: mockUpdated } as SingleApiResponse<CommentUpdatedDto>);
    });
  });

  describe('deleteComment', () => {
    it('should send DELETE request to correct URL', () => {
      const commentId = 77;

      service.deleteComment(commentId).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${API_ENDPOINTS.COMMENTS}/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});