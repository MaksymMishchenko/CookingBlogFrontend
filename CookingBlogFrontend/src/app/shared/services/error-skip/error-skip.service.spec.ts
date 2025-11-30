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
        // Arrange
        const request = mockRequest('/api/posts/123');
        const error = mockError(404);

        // Act
        const result = service.shouldSkipGlobalError(request, error);

        // Assert
        expect(result).toBeTrue();
    });

    it('Should NOT skip 404 if the URL does not match any pattern (e.g., API typo)', () => {
        // Arrange
        const request = mockRequest('/api/wrong-endpoint');
        const error = mockError(404);

        // Act
        var result = service.shouldSkipGlobalError(request, error)

        // Assert
        expect(result).toBeFalse();
    });

    it('Should NOT skip 500 for a /api/posts/ URL', () => {
        // Arrange
        const request = mockRequest('/api/posts/list');
        const error = mockError(500);

        // Act
        var result = service.shouldSkipGlobalError(request, error)

        // Assert
        expect(result).toBeFalse();
    });

    it('Should NOT skip 403 for a non-profile URL', () => {
        // Arrange
        const request = mockRequest('/api/users/delete');
        const error = mockError(403);

        // Act
        var result = service.shouldSkipGlobalError(request, error);

        // Assert
        expect(result).toBeFalse();
    });

});