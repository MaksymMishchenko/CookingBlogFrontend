export const USER_MESSAGES = {
    NETWORK_ERROR: 'No internet connection. Please check your network.',
    SERVER_UNREACHABLE: 'Cannot connect to the server. Please try again later.',
    LOGIN_SUCCESS: 'Login successful!',
    REGISTRATION_SUCCESS: 'Registration successful! You can now sign in.',
    NO_COMMENTS_YET: 'No comments yet. Be the first to share your thoughts!',
    NOT_FOUND_INFRA: 'The requested page was not found.',
    SERVER_UNAVAILABLE: 'Service is currently overloaded or down for maintenance. Please try again in a few minutes.',
    INTERNAL_ERROR: 'An internal server error has occurred. We are already working on fixing it.',
    BAD_GATEWAY: 'The server is temporarily unable to service your request due to maintenance. Please check back soon.',
    GATEWAY_TIMEOUT: 'The server took too long to respond. Please check your connection or try again.',
    UNKNOWN_CRITICAL: 'A critical server error occurred. Please contact support if the issue persists.',
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    UNKNOWN_ERROR: 'An unknown error has occurred. Please contact support.',
    VALIDATION_ERROR: 'Validation failed. Please check the highlighted fields and try again.',
    CONCURRENCY_CONFLICT: 'The data has been modified by another user. Please refresh the page to get the latest version.',
    FILE_TOO_LARGE: 'The uploaded file is too large. Max allowed size is 5MB.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    FORBIDDEN: 'Forbidden. You do not have the necessary permissions to access this resource.',
    RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a bit.',
    ACTION_FAILED: 'This action could not be completed. Please try again.',
    LOAD_COMMENTS_FAILED: 'Could not load comments. Please refresh the page.',
    SESSION_EXPIRED_COMMENT: 'Your session has expired. Please sign in to leave a comment.',
    INVALID_CREDENTIALS: 'Invalid credentials. Please check your details or sign up.',
    DEFAULT_AUTH_ERROR: "Authentication failed. Please try again.",
    AUTH_REQUIRED: "Authorization required. Please log in to continue.",
    INVALID_TOKEN: "Your security session is invalid. Please log in again.",
    CLAIM_ASSIGNMENT_ERROR: 'User created, but there was an issue assigning permissions. Please contact support.',
    REGISTRATION_GENERIC: 'Account creation failed. Please check your data and try again.',
    USER_ALREADY_EXISTS: 'A user with this username or email already exists.',
    CATEGORY_NOT_FOUND: 'The specified category was not found.',
    CATEGORY_OR_SLUG_EXISTS: 'A category with this name or slug already exists.',
    POST_NOT_FOUND: 'The specified post was not found.',

    COMMENT: {
        POST_NOT_FOUND: 'The post you are trying to comment on no longer exists.',
        EMPTY: 'Comment cannot be empty. Please enter some text before submitting.'
    },
    POST: {
        SLUG_AND_CATEGORY_REQUIRED: 'Post not found. Please check the link or choose a different category',
        NOT_FOUND_BY_PATH_CODE: `Oops! We couldn't find this recipe in this category`,
        CONTENT_IS_EMPTY: 'Invalid post content. Please ensure the required fields are filled correctly.',
        ALREADY_EXIST_CODE: 'This slug is already taken in this category.'
    }
};

export const DEV_DESCRIPTIONS = {
    NETWORK: 'CORS Error or Server is Down (Status 0)',
    POSSIBLE_CORS_OR_SERVER_DOWN: 'Network error (Status 0). Possible CORS issue or server is unreachable while user is online.',
    BAD_URL: (url: string) =>
        `INFRASTRUCTURE ERROR: 404 Not Found at [${url}]. Check for typos in the endpoint or frontend environment config.`,
    DATABASE_ISSUE: 'INTERNAL ERROR: Potential database connection issue or unhandled server-side exception.',
    TIMEOUT: 'GATEWAY TIMEOUT: The upstream server failed to send a request in the time allowed.',
    MAINTENANCE: 'Server is in maintenance mode or overloaded',
    BAD_GATEWAY: 'BAD GATEWAY: Invalid response from the upstream server (Render/Nginx issue).',
    FILE_TOO_LARGE: 'CLIENT ERROR: 413 Payload Too Large. The entity sent is larger than the server is willing or able to process.',
    CRITICAL_SERVER_ERROR: (status: number) => `CRITICAL: SERVER ERROR (Status ${status}).`,
    LOAD_COMMENTS_ERROR: (postId: number, status: number) =>
        `FETCH ERROR: Failed to load comments for Post ID: ${postId}. Server returned status ${status}.`,
    BAD_REQUEST_MISSING_MESSAGE: (status: number, url: string) =>
        `CLIENT/CONFLICT ERROR: Status ${status} at ${url}. Warning: Server did not provide a specific error message in the response body.`,
    RATE_LIMIT_EXCEEDED: (url: string, retryAfter?: string | null, limit?: string | null) =>
        `RATE LIMIT ERROR: 429 at ${url}. ` +
        `Limit: ${limit || 'unknown'}, ` +
        `Retry after: ${retryAfter || 'unknown'}s.`,
    FORBIDDEN_ACCESS: (url: string, errorCode?: string) =>
        `SECURITY ALERT: 403 Forbidden at [${url}]. User is authenticated but lacks required permissions. Backend code: ${errorCode || 'none'}.`,
    COMMENT_SANITIZATION_EMPTY:
        `[SECURITY/VALIDATION]: Comment became empty after sanitization. Possible XSS attempt or all tags were stripped. Check payload.`,
    POST_CONTENT_SANITIZATION_EMPTY:
        `[SECURITY/VALIDATION]: Post content became empty after sanitization. Check admin input for forbidden HTML tags or scripts.`,
    REGISTRATION_CONFLICT: (user: string, email: string) =>
        `AUTH CONFLICT: User already exists. Username: ${user}, Email: ${email}`,
    REGISTRATION_IDENTITY_FAILED: (codes: string) =>
        `IDENTITY ERROR: Registration failed with codes: ${codes}`,
    CLAIM_FAILED: (userId: string, details: string) =>
        `PERMISSION ERROR: Failed to assign initial claims for User ID: ${userId}. Details: ${details}`,
    DATA_RACE_CONDITION: (entity: string, id?: string | number) =>
        `BUSINESS CONFLICT: The ${entity} ${id ? `(ID: ${id})` : ''} was modified or deleted by another user/process during your session.`,

    PATH_MISMATCH: (slug: string, category: string) =>
        `ROUTING ERROR: No post found for slug [${slug}] in category [${category}]. Potential manual URL manipulation.`
};

export const ERROR_LOG_CONTEXT = {
    HTTP: 'HTTP',
    LOGIC: 'LOGIC'
} as const;

export const ERROR_LOG_MESSAGES = {
    GLOBAL_PREFIX: 'Global Logging TO CONSOLE',
    LOCAL_LOGIC_ERROR: 'LOCAL_LOGIC_ERROR',
    UNKNOWN: 'Unknown Error'
} as const;