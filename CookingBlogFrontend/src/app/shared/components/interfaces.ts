export interface Post {
    id?: any;
    title: string;
    description: string;
    content: string;
    author: string;
    createAt: Date;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    comments: any[];
}

export interface User {
    userName: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    dataList?: T[];
    entityId?: number;
    token?: string;
    errors?: Record<string, string[]>;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
}