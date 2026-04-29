export const UI_MESSAGES = {
    COMMON: {
        LOADING: 'Loading...',
        LOAD_ERROR: (entity: string) => `Failed to load ${entity}. Please try again later.`,
        NOT_FOUND: (entity: string) => `The specified ${entity} was not found.`,
        EMPTY: (entity: string) => `No ${entity} found.`,
    }
}