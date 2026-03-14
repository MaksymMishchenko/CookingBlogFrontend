export const USER_MESSAGES = {
    SERVER_UNAVAILABLE: 'The server is unavailable. Please try again later.',
    INTERNAL_ERROR: 'An internal server error has occurred. We are already working on fixing it.',
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    UNKNOWN_ERROR: 'An unknown error has occurred. Please contact support.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    ACCESS_DENIED: 'Access denied. You do not have permission to perform this action.',
    RATE_LIMIT_EXCEEDED: 'Too fast! Please wait a few seconds before your next comment.',
    SESSION_EXPIRED_COMMENT: 'Your session has expired. Please sign in to leave a comment.',
};

export const DEV_DESCRIPTIONS = {
    NETWORK_ERROR: 'NETWORK/CONNECTION ERROR: Server is unreachable or CORS issue.',
    CRITICAL_SERVER_ERROR: (status: number) => `CRITICAL: SERVER ERROR (Status ${status}).`,
    API_NOT_FOUND: (url: string) => `API ERROR: 404 Not Found at URL: ${url}`,
    UNKNOWN_STATUS: (status: number) => `UNKNOWN HTTP ERROR: Status ${status}`,   
    AUTH_EXPIRED: 'AUTH ERROR: 401 Unauthorized. Token is missing or expired.',
    AUTH_FORBIDDEN: (url: string) => `AUTH ERROR: 403 Forbidden at URL: ${url}`,
    RATE_LIMIT_EXCEEDED: (url: string, retryAfter?: string | null, limit?: string | null) => 
        `RATE LIMIT ERROR: 429 at ${url}. ` +
        `Limit: ${limit || 'unknown'}, ` +
        `Retry after: ${retryAfter || 'unknown'}s.` 
};