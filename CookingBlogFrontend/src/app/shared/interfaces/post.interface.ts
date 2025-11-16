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

export interface PostsResult {
    posts: Post[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}