import { BaseResponse, PagedApiResponse, SingleApiResponse } from "../../../shared/interfaces/global.interface";

export const createBaseResponse = (
    partialResponse: Partial<BaseResponse>
): BaseResponse => ({
    success: true,
    message: "Success",
    ...partialResponse
});

export const createPagedApiResponse = <T>(
    partialResponse: Partial<PagedApiResponse<T>>
): PagedApiResponse<T> => ({
    success: true,
    message: "Success",
    data: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,    
    ...partialResponse
});

export const createSingleApiResponse = <T>(
    partialResponse: Partial<SingleApiResponse<T>>
): SingleApiResponse<T> => ({
    success: true,
    message: "Success",
    data: null,
    ...partialResponse
});