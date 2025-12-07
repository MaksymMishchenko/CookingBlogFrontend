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