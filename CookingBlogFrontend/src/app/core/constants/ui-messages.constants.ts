export const UI_COMMON_MESSAGES = {
    LOADING: 'Loading...',
    SAVING: 'Saving changes...',
    NO_COMMENTS_YET: 'No comments yet. Be the first to share your thoughts!'
} as const;

export const UI_ERROR_MESSAGES = {
    COMMON: {
        NETWORK_ERROR: 'No internet connection. Please check your network settings.',
        SERVER_UNREACHABLE: 'The server is unreachable. Please check your connection or try again later.',
        SERVER_UNAVAILABLE: 'Service is currently overloaded or down for maintenance. Please try again in a few minutes.',
        INTERNAL_ERROR: 'An internal server error has occurred. We are already working on fixing it.',
        UNKNOWN_ERROR: 'An unknown error has occurred. Please contact support.',
        ACTION_FAILED: 'This action could not be completed. Please try again.'
    },
    ACCESS: {
        RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a bit.'
    },
    VALIDATION: {
        VALIDATION_ERROR: 'Validation failed. Please check the highlighted fields and try again.',
        CONCURRENCY_CONFLICT: 'The data has been modified by another user. Please refresh the page to get the latest version.',
        FILE_TOO_LARGE: 'The uploaded file is too large. Max allowed size is 5MB.'
    },
    POSTS: {
        SLUG_AND_CATEGORY_REQUIRED: 'Post not found. Please check the link or choose a different category',
        NOT_FOUND_BY_PATH_CODE: `Oops! We couldn't find this recipe in this category`,
        CONTENT_IS_EMPTY: 'Invalid post content. Please ensure the required fields are filled correctly.',
        ALREADY_EXIST: 'This slug is already taken in this category.'
    },
    CATEGORY: {
        CATEGORY_OR_SLUG_EXISTS: 'A category with this name or slug already exists.'
    },
    COMMENTS: {
        LOAD_COMMENTS_FAILED: 'Could not load comments. Please refresh the page.',
        SESSION_EXPIRED_COMMENT: 'Your session has expired. Please sign in to leave a comment.',
        POST_NOT_FOUND: 'The post you are trying to comment on no longer exists.',
        EMPTY: 'Comment cannot be empty. Please enter some text before submitting.'
    },
    AUTH: {
        INVALID_CREDENTIALS: 'Invalid credentials. Please check your details or sign up.',
        DEFAULT_AUTH_ERROR: "Authentication failed. Please try again.",
        AUTH_REQUIRED: "Authorization required. Please log in to continue.",
        INVALID_TOKEN: "Your security session is invalid. Please log in again.",
        CLAIM_ASSIGNMENT_ERROR: 'User created, but there was an issue assigning permissions. Please contact support.',
        REGISTRATION_GENERIC: 'Account creation failed. Please check your data and try again.',
        USER_ALREADY_EXISTS: 'A user with this username or email already exists.',
        ACCESS_DENIED: 'Access denied. Administrator privileges required.',
        FORBIDDEN: 'You do not have the necessary permissions.',
        SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    },
    DYNAMIC: {
        NOT_FOUND: (entity: string) => `The specified ${entity} was not found.`,
        LOAD_FAILED: (entity: string) => `Failed to load ${entity}. Please try again later.`,
        REQUIRED_FIELD: (field: string) => `${field} is required.`,
        EMPTY: (entity: string) => `No ${entity} found.`
    }
} as const;

export const UI_SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    REGISTRATION_SUCCESS: 'Registration successful! You can now sign in.',
    CREATED: (entity: string) => `${entity} has been successfully created.`,
    UPDATED: (entity: string) => `Changes to ${entity} saved.`,
    DELETED: (entity: string) => `${entity} was removed.`,
} as const;
