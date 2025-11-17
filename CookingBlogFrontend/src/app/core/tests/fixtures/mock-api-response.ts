import { ApiResponse } from "../../../shared/interfaces/global.interface";

export const createBaseApiResponse = <T>(
    partialResponse: Partial<ApiResponse<T>>
): ApiResponse<T> => ({
    success: true,
    message: "Operation successful",

    ...partialResponse
});