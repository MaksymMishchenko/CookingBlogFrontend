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

export interface PageChangeDetails {
    page: number;
    replace: boolean;
}

export interface BaseResponse {
    success: boolean;
    message?: string;
    errorCode?: string;
    errors?: Record<string, string[]>;
}

export interface SingleApiResponse<T> extends BaseResponse {
    data: T | null; 
}

export interface PagedApiResponse<T> extends BaseResponse {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    searchQuery?: string;
}

export interface PageChangeDetails {
    page: number;
    replace: boolean;
}