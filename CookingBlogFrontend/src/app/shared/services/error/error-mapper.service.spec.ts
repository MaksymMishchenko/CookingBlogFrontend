import { HttpErrorResponse } from "@angular/common/http";
import { ErrorMapperService } from "./error-mapper.service";
import { DEV_DESCRIPTIONS, USER_MESSAGES } from "./error.constants";

describe('ErrorMapperService', () => {
    let mapperService: ErrorMapperService;

    beforeEach(() => {
        mapperService = new ErrorMapperService();
    });

    it('should map network error (status 0) ', () => {
        // Arrange
        const error = new HttpErrorResponse({ status: 0 });

        // Act
        const result = mapperService.map(error);

        // Assert
        expect(result.userMessage).toBe(USER_MESSAGES.SERVER_UNAVAILABLE);
        expect(result.devDescription).toBe(DEV_DESCRIPTIONS.NETWORK_ERROR);
    });

    it('should map internal server error (status 500)', () => {
        // Arrange
        const error = new HttpErrorResponse({ status: 500 });

        // Act
        const result = mapperService.map(error);

        // Assert
        expect(result.userMessage).toBe(USER_MESSAGES.INTERNAL_ERROR);
        expect(result.devDescription).toBe(DEV_DESCRIPTIONS.CRITICAL_SERVER_ERROR(500));
    });

    it('should map 404 error', () => {
        // Arrange
        const error = new HttpErrorResponse({ status: 404, url: '/test-endpoint' });

        // Act
        const result = mapperService.map(error);

        // Assert
        expect(result.userMessage).toBe(USER_MESSAGES.RESOURCE_NOT_FOUND);
        expect(result.devDescription).toBe(DEV_DESCRIPTIONS.API_NOT_FOUND('/test-endpoint'));
    });

    it('should map unknown status code', () => {
        // Arrange
        const error = new HttpErrorResponse({ status: 418 });

        // Act
        const result = mapperService.map(error);

        // Assert
        expect(result.userMessage).toBe(USER_MESSAGES.UNKNOWN_ERROR);
        expect(result.devDescription).toBe(DEV_DESCRIPTIONS.UNKNOWN_STATUS(418));
    });
});