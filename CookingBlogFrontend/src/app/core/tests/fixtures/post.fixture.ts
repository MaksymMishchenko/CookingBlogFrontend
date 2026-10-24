import { BaseResponse, PagedApiResponse, SingleApiResponse } from "../../../shared/interfaces/global.interface";
import { CreatedPostDto, CreatePostRequest, PagedResult, PostAdminDetailsDto, PostDetailDto, PostListDto, UpdatedPostDto, UpdatePostRequest } from "../../../shared/interfaces/post.interface";
import { createBaseResponse, createPagedApiResponse, createSingleApiResponse } from "./mock-api-response";

export const validFormData = {
  title: 'Test Title',
  description: 'Test description here',
  content: 'a'.repeat(100),
  image: new File(['x'], 'image.jpg', { type: 'image/jpeg' }),
  previewImageAlt: '',
  metaTitle: '',
  metaDescription: '',
  slug: 'test-title',
  categoryId: 1,
  isActive: false
};

export const createMockPostListDto = (identifier: number): PostListDto => ({
    id: identifier,
    slug: `test-post-${identifier}`,
    title: `Test Post ${identifier} (Dynamic)`,
    author: 'Dynamic Author',
    description: `Description for post ${identifier}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryName: "Soup",
    categorySlug: "soup",
    commentsCount: 50 + (Number(identifier) || 1)
});

export const createPostListDto = (count: number, startId: number = 1): PostListDto[] => {
    return Array.from({ length: count }, (_, index) => createMockPostListDto(startId + index));
};

export const createPostsServiceResult = (pageNumber: number, pageSize: number): PagedResult => {
    const apiResponse = createDynamicPostsResponse(pageNumber, pageSize);

    return {
        items: apiResponse.data || [],
        totalCount: apiResponse.totalCount || 0,
        pageNumber: apiResponse.pageNumber || pageNumber,
        pageSize: apiResponse.pageSize || pageSize
    };
};

export const createDynamicPostsResponse = (
    pageNumber: number,
    pageSize: number,
    totalCount: number = 100
): PagedApiResponse<PostListDto> => {

    const dataList: PostListDto[] = Array.from({ length: pageSize }, (_, index) => {
        const globalId = (pageNumber - 1) * pageSize + index + 1;
        return createPostCardMock(globalId);
    });

    return createPagedApiResponse<PostListDto>({
        data: dataList,
        totalCount: totalCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
        message: "Dynamically generated data"
    });
}

export const createPostCardMock = (identifier: number): PostListDto => ({
    id: identifier,
    slug: `test-post-${identifier}`,
    title: `Test Post ${identifier} (Dynamic)`,
    author: 'Dynamic Author',
    description: `Description for post ${identifier}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    commentsCount: 50 + (Number(identifier) || 1),
    categoryName: 'Beverages',
    categorySlug: 'beverages'
});

export const createMockPostDetails = (identifier: number): PostAdminDetailsDto => ({
    id: Number(identifier),
    title: "Est illum assumenda.",
    description: "Natus et dignissimos reiciendis...",
    content: "Dolorem eius repellat deleniti et quisquam consequatur aut...",
    previewImageUrl: `https://picsum.photos/640/480/?image=${identifier}`,
    previewImageAlt: `Preview Image Alt ${identifier}`,
    slug: "voluptatem-voluptatum-adipisci",
    metaTitle: "Natus expedita.",
    metaDescription: "Laboriosam voluptatem aspernatur debitis quo saepe et aliquam.",
    categoryId: 1,
    isActive: true
});

export const createMockPostDetailsResponse = (identifier: number): SingleApiResponse<PostAdminDetailsDto> => {
    const postData = createMockPostDetails(identifier);

    return createSingleApiResponse<PostAdminDetailsDto>({
        data: postData,
        success: true
    });
};

export const createMockPostBySlugDetails = (catSlug: string, slug: string): PostDetailDto => ({
    id: 1,
    title: "Est illum assumenda.",
    content: "Dolorem eius repellat deleniti et quisquam consequatur aut...",
    author: "Miriam Oberbrunner",
    imageUrl: `https://picsum.photos/640/480/?image=1`,
    slug: slug,
    metaTitle: "Natus expedita.",
    metaDescription: "Laboriosam voluptatem aspernatur debitis quo saepe et aliquam.",
    categoryName: "Lorem",
    categorySlug: catSlug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    commentCount: 10
});

export const createMockPostBySlugDetailsResponse = (catSlug: string, slug: string): SingleApiResponse<PostDetailDto> => {
    const postData = createMockPostBySlugDetails(catSlug, slug);

    return createSingleApiResponse<PostDetailDto>({
        data: postData,
        success: true
    });
};

export const createPostMock = (identifier: number): CreatePostRequest => ({
    title: `Test Post ${identifier} (Dynamic)`,
    description: `Description for post ${identifier}`,
    content: `Content for post ${identifier}`,
    metaTitle: `Meta Title ${identifier}`,
    metaDescription: `Meta Description ${identifier}`,
    previewImageAlt: `Preview Image Alt ${identifier}`,
    slug: `test-post-${identifier}`,
    categoryId: 1,
    isActive: true,
    previewImage: new File(['dummy content'], `test-image-${identifier}.png`, { type: 'image/png' })
});

export const createMockPostCreatedDtoResponse = (id: number, fixedDate: string): SingleApiResponse<CreatedPostDto> => {
    const responseDto: CreatedPostDto = {
        id: Number(id),
        title: `Test Post ${id} (Dynamic)`,
        description: `Description for post ${id}`,
        content: `Content for post ${id}`,
        author: 'Dynamic Author',
        previewImageUrl: `https://example.com/image${id}.jpg`,
        previewImageAlt: `Preview Image Alt ${id}`,
        metaTitle: `Meta Title ${id}`,
        metaDescription: `Meta Description ${id}`,
        slug: `test-post-${id}`,
        categoryId: 1,
        createdAt: fixedDate,
        updatedAt: fixedDate,
        isActive: true
    };

    return createSingleApiResponse<CreatedPostDto>({
        data: responseDto,
        success: true
    });
};

export const updatedPostMock = (identifier: number): UpdatePostRequest => ({
    title: `Test Post ${identifier} (Dynamic)`,
    description: `Description for post ${identifier}`,
    content: `Content for post ${identifier}`,
    metaTitle: `Meta Title ${identifier}`,
    metaDescription: `Meta Description ${identifier}`,
    previewImageAlt: `Preview Image Alt ${identifier}`,
    slug: `test-post-${identifier}`,
    categoryId: 1,
    isActive: true,
    previewImage: new File(['dummy content'], `test-image-${identifier}.png`, { type: 'image/png' })
});

export const updatedMockPostDtoResponse = (id: number, fixedDate: string): SingleApiResponse<UpdatedPostDto> => {
    const responseDto: UpdatedPostDto = {
        id: Number(id),
        title: `Test Post ${id} (Dynamic)`,
        description: `Description for post ${id}`,
        content: `Content for post ${id}`,
        author: 'Dynamic Author',
        previewImageUrl: `https://example.com/image${id}.jpg`,
        previewImageAlt: `Preview Image Alt ${id}`,
        metaTitle: `Meta Title ${id}`,
        metaDescription: `Meta Description ${id}`,
        slug: `test-post-${id}`,
        categoryId: 1,
        createdAt: fixedDate,
        updatedAt: fixedDate,
        isActive: true
    };

    return createSingleApiResponse<UpdatedPostDto>({
        data: responseDto,
        success: true
    });
};

export const createMockBaseResponse = (): BaseResponse => {
    return createBaseResponse({
        message: "Success message",
        success: true
    });
};
