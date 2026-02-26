import { ListApiResponse } from "../../interfaces/global.interface";
import { CategoryListDto } from "./category.interface";

export const mockResponse: ListApiResponse<CategoryListDto> = {
    data: [
        { id: 1, name: 'Main Course', slug: 'main-course' },
        { id: 2, name: 'Desserts', slug: 'desserts' }
    ],
    success: true,
    message: ''
};

export const emptyMockResponse: ListApiResponse<CategoryListDto> = {
    data: [],
    success: true,
    message: ''
}