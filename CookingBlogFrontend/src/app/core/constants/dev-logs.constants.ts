export const DEV_DESCRIPTIONS = {
    INFRASTRUCTURE: {
        NETWORK: 'CORS Error or Server is Down (Status 0)',
        POSSIBLE_CORS_OR_SERVER_DOWN: 'Network error (Status 0). Possible CORS issue or server is unreachable while user is online.',
        RESOURCE_NOT_FOUND: (url: string) =>
            `INFRASTRUCTURE ERROR: 404 Not Found at [${url}]. The endpoint does not exist. Check backend routes or base URL.`,
        BAD_URL: (url: string) =>
            `INFRASTRUCTURE ERROR: 404 Not Found at [${url}]. Check for typos in the endpoint or frontend environment config.`,
        TIMEOUT: 'GATEWAY TIMEOUT (504): The upstream server failed to send a request in the time allowed.',
        BAD_GATEWAY: 'BAD GATEWAY (502): Invalid response from the upstream server (Render/Nginx issue).',
        MAINTENANCE: 'SERVICE UNAVAILABLE (503): Server is in maintenance mode or overloaded',
        DATABASE_ISSUE: 'INTERNAL SERVER ERROR (500): Potential database connection issue or unhandled server-side exception.',
        CRITICAL_SERVER_ERROR: (status: number) => `CRITICAL: SERVER ERROR (Status ${status}).`
    },
    SECURITY: {
        FORBIDDEN: (url: string, errorCode?: string) =>
            `SECURITY ALERT: 403 Forbidden at [${url}]. Lacks required permissions. Backend code: ${errorCode || 'none'}.`,
        XSS_SANITIZATION_COMMENT:
            `[SECURITY]: Comment became empty after sanitization. Possible XSS attempt or all tags were stripped.`,
        XSS_SANITIZATION_POST:
            `[SECURITY]: Post content became empty after sanitization. Check admin input for forbidden HTML.`
    },
    AUTH_IDENTITY: {
        REGISTRATION_CONFLICT: (user: string, email: string) =>
            `AUTH CONFLICT: User already exists. Username: ${user}, Email: ${email}`,
        REGISTRATION_FAILED: (codes: string) =>
            `IDENTITY ERROR: Registration failed with codes: ${codes}`,
        CLAIM_FAILED: (userId: string, details: string) =>
            `PERMISSION ERROR: Failed to assign initial claims for User ID: ${userId}. Details: ${details}`,
        JWT_DECODE_FAILED: 'LOGIC ERROR: JWT Decoding Failed in AuthService. Token is either malformed, expired, or missing required claims (e.g. roles).'
    },
    BUSINESS_LOGIC: {
        DATA_RACE: (entity: string, id?: string | number) =>
            `BUSINESS CONFLICT: The ${entity} ${id ? `(ID: ${id})` : ''} was modified or deleted by another user/process.`,
        PATH_MISMATCH: (slug: string, category: string) =>
            `ROUTING ERROR: No post found for slug [${slug}] in category [${category}]. Potential manual URL manipulation.`,
        RATE_LIMIT: (url: string, retryAfter?: string | null, limit?: string | null) =>
            `429 at ${url}. Limit: ${limit || 'unknown'}, Retry after: ${retryAfter || 'unknown'}s.`
    },
    API_SPECIFIC: {
        BAD_REQUEST_NO_BODY: (status: number, url: string) =>
            `CLIENT/CONFLICT ERROR: Status ${status} at ${url}. Warning: Server did not provide error message in body.`,
        LOAD_COMMENTS_FAILED: (postId: number, status: number) =>
            `FETCH ERROR: Failed to load comments for Post ID: ${postId}. Status ${status}.`,
        FILE_TOO_LARGE: 'CLIENT ERROR: 413 Payload Too Large. Entity larger than server limit.'
    }
} as const;