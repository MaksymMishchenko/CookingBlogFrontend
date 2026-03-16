export const USER_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    REGISTRATION_SUCCESS: 'Registration successful! You can now sign in.',
    NO_COMMENTS_YET: 'No comments yet. Be the first to share your thoughts!',

    SERVER_UNAVAILABLE: 'The server is unavailable. Please try again later.',
    INTERNAL_ERROR: 'An internal server error has occurred. We are already working on fixing it.',
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    UNKNOWN_ERROR: 'An unknown error has occurred. Please contact support.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    ACCESS_DENIED: 'Access denied. You do not have permission to perform this action.',
    RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a bit.',
    ACTION_FAILED: 'This action could not be completed. Please try again.',
    LOAD_COMMENTS_FAILED: 'Could not load comments. Please refresh the page.',    
    SESSION_EXPIRED_COMMENT: 'Your session has expired. Please sign in to leave a comment.',
    INVALID_CREDENTIALS: 'Invalid credentials. Please check your details or sign up.'
};

export const DEV_DESCRIPTIONS = {
    NETWORK_ERROR: 'NETWORK/CONNECTION ERROR: Server is unreachable or CORS issue.',
    CRITICAL_SERVER_ERROR: (status: number) => `CRITICAL: SERVER ERROR (Status ${status}).`,
    API_NOT_FOUND: (url: string) => `API ERROR: 404 Not Found at URL: ${url}`,
    UNKNOWN_STATUS: (status: number) => `UNKNOWN HTTP ERROR: Status ${status}`,   
    AUTH_EXPIRED: 'AUTH ERROR: 401 Unauthorized. Token is missing or expired.',
    AUTH_FORBIDDEN: (url: string) => `AUTH ERROR: 403 Forbidden at URL: ${url}`,
    AUTH_FAILED: (url: string) => `Authentication failed (401) at ${url}. Possible invalid credentials or expired token.`,
    LOAD_COMMENTS_ERROR: (postId: number, status: number) => 
        `FETCH ERROR: Failed to load comments for Post ID: ${postId}. Server returned status ${status}.`,
    BAD_REQUEST_MISSING_MESSAGE: (status: number, url: string) => 
        `CLIENT/CONFLICT ERROR: Status ${status} at ${url}. Warning: Server did not provide a specific error message in the response body.`,
    RATE_LIMIT_EXCEEDED: (url: string, retryAfter?: string | null, limit?: string | null) => 
        `RATE LIMIT ERROR: 429 at ${url}. ` +
        `Limit: ${limit || 'unknown'}, ` +
        `Retry after: ${retryAfter || 'unknown'}s.` 
};