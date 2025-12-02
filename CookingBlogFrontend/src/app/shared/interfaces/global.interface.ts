export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    dataList?: T[];
    entityId?: number;
    token?: string;
    errors?: Record<string, string[]>;
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
}