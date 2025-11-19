import { Injectable } from '@angular/core';
import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { SkipPattern } from '../../interfaces/error-handling.interface';

@Injectable({ providedIn: 'root' })
export class ErrorSkipService {
    private readonly skipPatterns: SkipPattern[] = [
        { urlPattern: /^\/api\/posts\//, statuses: [404] }
    ];

    public shouldSkipGlobalError(request: HttpRequest<unknown>, error: HttpErrorResponse): boolean {
        return this.skipPatterns.some(pattern => {            
            const statusMatches = pattern.statuses.includes(error.status);            
            const urlMatches = pattern.urlPattern.test(request.url);

            return statusMatches && urlMatches;
        });
    }
}