export const USER_MESSAGES = {
    SERVER_UNAVAILABLE: 'The server is unavailable. Please try again later.',
    INTERNAL_ERROR: 'An internal server error has occurred. We are already working on fixing it.',
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    UNKNOWN_ERROR: 'An unknown error has occurred. Please contact support.',
};

export const DEV_DESCRIPTIONS = {
    NETWORK_ERROR: 'NETWORK/CONNECTION ERROR: Server is unreachable or CORS issue.',
    CRITICAL_SERVER_ERROR: (status: number) => `CRITICAL: SERVER ERROR (Status ${status}).`,
    API_NOT_FOUND: (url: string) => `API ERROR: 404 Not Found at URL: ${url}`,
    UNKNOWN_STATUS: (status: number) => `UNKNOWN HTTP ERROR: Status ${status}`,   
};