import { ApiResponse, Post } from "../../../shared/components/interfaces";
import { fakePosts } from "./posts.fixtures";

export const apiResponseFixture: ApiResponse<Post> = {
    dataList: fakePosts,
    totalCount: fakePosts.length,
    pageNumber: 1,
    pageSize: 10,
    success: true,
    message: "Data retrieved successfully"
};