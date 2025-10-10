export interface Post {
    id?: any;
    title: string;
    description: string;
    content: string;
    author: string;
    createAt: Date;
    ImageUrl: string;
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