export interface Post {
    id?: any;
    title: string;
    description: string;
    content: string;
    author: string;
    createdAt: Date;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    comments: any[];
    commentsCount: number;
}

export interface PostsResult {
    posts: Post[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface PostListDto {
    id: number;
    slug: string;
    title: string;
    author: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    categoryName: string;
    categorySlug: string;
    commentsCount: number;
}

export interface PostDetailDto {
    title: string;
    content: string;
    author: string;
    imageUrl: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    categoryName: string;
    categorySlug: string;
    createdAt: string;
    updatedAt: string;
    commentCount: number;
}

export interface PostAdminDetailsDto {
    id: number;
    title: string;
    description: string;
    content: string;
    author: string;
    imageUrl: string;
    slug: string;
    categoryId: number;
    metaTitle?: string;
    metaDescription?: string;
}

export interface CreatePostRequest {
    title: string;
    description: string;
    content: string;
    author: string;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    categoryId: number;
}

export interface CreatedPostDto {
    id: number
    title: string;
    description: string;
    content: string;
    author: string;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    categoryId: number;
    createdAt: string;    
    updatedAt: string;    
}

export interface UpdatePostRequest {  
    title: string;
    description: string;
    content: string;
    author: string;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    categoryId: number;
}

export interface UpdatedPostDto {
    id: number
    title: string;
    description: string;
    content: string;
    author: string;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    categoryId: number;
    createdAt: string;    
    updatedAt: string;    
}

export interface PagedPostResult<T = PostListDto> {
    posts: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    searchQuery?: string;
}

export interface PaginationParams {
    pageNumber: number;
    pageSize: number;
}

export interface FilterParams {
    searchTerm?: string;
    categorySlug?: string;
}