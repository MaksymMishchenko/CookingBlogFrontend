import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { ErrorSkipService } from './error-skip.service';

describe('ErrorSkipService', () => {
    let service: ErrorSkipService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ErrorSkipService]
        });
        service = TestBed.inject(ErrorSkipService);
    });

    const mockRequest = (url: string) => new HttpRequest('GET', url);
    const mockError = (status: number) => new HttpErrorResponse({ status: status });

    it('Should SKIP 404 for a URL starting with /api/posts/', () => {
        const request = mockRequest('/api/posts/123');
        const error = mockError(404);

        expect(service.shouldSkipGlobalError(request, error)).toBeTrue();
    });

    it('Should NOT skip 404 if the URL does not match any pattern (e.g., API typo)', () => {
        const request = mockRequest('/api/wrong-endpoint');
        const error = mockError(404);

        expect(service.shouldSkipGlobalError(request, error)).toBeFalse();
    });

    it('Should NOT skip 500 for a /api/posts/ URL', () => {        
        const request = mockRequest('/api/posts/list');
        const error = mockError(500);

        expect(service.shouldSkipGlobalError(request, error)).toBeFalse();
    });

    it('Should NOT skip 403 for a non-profile URL', () => {        
        const request = mockRequest('/api/users/delete');
        const error = mockError(403);

        expect(service.shouldSkipGlobalError(request, error)).toBeFalse();
    });

});