import { ApiResponse } from "../../../shared/interfaces/global.interface";
import { Post, PostsResult } from "../../../shared/interfaces/post.interface";
import { createBaseApiResponse } from "./mock-api-response";

export const createMockPost = (id: number): Post => ({
    id: id,
    title: `Test Post ${id} (Dynamic)`,
    author: 'Dynamic Author',
    createAt: new Date(),
    comments: [{ id: 1, text: 'Dynamic Comment', author: 'Anna', createAt: new Date() }],
    description: `Description for post ${id}`,
    imageUrl: `https://example.com/image${id}.jpg`,
    content: `Content for post ${id}`,
    metaTitle: `Meta Title ${id}`,
    metaDescription: `Meta Description ${id}`,
    slug: `test-post-${id}`
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