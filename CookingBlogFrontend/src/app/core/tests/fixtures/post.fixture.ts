import { ApiResponse } from "../../../shared/interfaces/global.interface";
import { Post, PostsResult } from "../../../shared/interfaces/post.interface";
import { createBaseApiResponse } from "./mock-api-response";

export const createMockPost = (identifier: number | string): Post => ({
    id: identifier,
    title: `Test Post ${identifier} (Dynamic)`,
    author: 'Dynamic Author',
    createAt: new Date(),
    comments: [{ id: 1, text: 'Dynamic Comment', author: 'Anna', createAt: new Date() }],
    description: `Description for post ${identifier}`,
    imageUrl: `https://example.com/image${identifier}.jpg`,
    content: `Content for post ${identifier}`,
    metaTitle: `Meta Title ${identifier}`,
    metaDescription: `Meta Description ${identifier}`,
    slug: `test-post-${identifier}`
});

export const createPostList = (count: number, startId: number = 1): Post[] => {
    return Array.from({ length: count }, (_, index) => createMockPost(startId + index));
};

export const createPostsServiceResult = (pageNumber: number, pageSize: number): PostsResult => {
    const apiResponse = createDynamicPostsResponse(pageNumber, pageSize);

    return {
        posts: apiResponse.dataList || [],
        totalCount: apiResponse.totalCount || 0,
        pageNumber: apiResponse.pageNumber || pageNumber,
        pageSize: apiResponse.pageSize || pageSize
    };
};

export const createDynamicPostsResponse = (
    pageNumber: number,
    pageSize: number,
    totalCount: number = 100
): ApiResponse<Post> => {

    const dataList: Post[] = Array.from({ length: pageSize }, (_, index) => {
        const globalId = (pageNumber - 1) * pageSize + index + 1;
        return createMockPost(globalId);
    });

    return createBaseApiResponse<Post>({
        dataList: dataList,
        totalCount: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        message: "Dynamically generated data"
    });
}

export const createMockPostItemResponse = (identifier: number | string): ApiResponse<Post> => {
    const post = createMockPost(identifier);
    return createBaseApiResponse<Post>({
        data: post,
        message: `Post with IDENTIFIER ${identifier} retrieved successfully.`
    });
}