export enum ErrorCategory {
    Infrastructure = 'Infrastructure',
    Authorization = 'Authorization',
    Validation = 'Validation',
    BusinessLogic = 'BusinessLogic',
    RateLimit = 'RateLimit',
    Critical = 'Critical'
}

export abstract class AppError extends Error {
    abstract readonly category: ErrorCategory;
    constructor(
        public userMessage: string,
        public status: number,
        public developerDetails: string,
        public originalError: any,
        public errorCode?: string
    ) {
        super(userMessage);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InfrastructureError extends AppError {
    readonly category = ErrorCategory.Infrastructure;
}

export class AuthError extends AppError {
    readonly category = ErrorCategory.Authorization;
}

export class ValidationError extends AppError {
    readonly category = ErrorCategory.Validation;
    constructor(
        userMessage: string, status: number, devDetails: string, original: any,
        public readonly errors: Record<string, string[]>, errorCode?: string  
    ) {
        super(userMessage, status, devDetails, original, errorCode);
    }
}

export class BusinessError extends AppError {
    readonly category = ErrorCategory.BusinessLogic;
    constructor(        
        userMessage: string, status: number, devDetails: string, original: any, errorCode?: string
    ) {
        super(userMessage, status, devDetails, original, errorCode);
    }
}

export class RateLimitError extends AppError {
    readonly category = ErrorCategory.RateLimit;
    constructor(
        userMessage: string, status: number, devDetails: string, original: any,
        public readonly retryAfter?: number, errorCode?: string
    ) {
        super(userMessage, status, devDetails, original, errorCode);
    }
}

export class CriticalError extends AppError {
    readonly category = ErrorCategory.Critical;
}