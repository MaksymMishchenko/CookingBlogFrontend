import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorContext } from "./error.types";
import { USER_MESSAGES, DEV_DESCRIPTIONS } from './error.constants';

@Injectable({
    providedIn: 'root'
})
export class ErrorMapperService {
    map(error: HttpErrorResponse): ErrorContext {
        let userMessage = '';
        let devDescription = '';

        if (error.status === 0) {
            userMessage = USER_MESSAGES.SERVER_UNAVAILABLE;
            devDescription = DEV_DESCRIPTIONS.NETWORK_ERROR;
        } else if (error.status >= 500) {
            userMessage = USER_MESSAGES.INTERNAL_ERROR;
            devDescription = DEV_DESCRIPTIONS.CRITICAL_SERVER_ERROR(error.status);
        } else if (error.status === 404) {
            userMessage = USER_MESSAGES.RESOURCE_NOT_FOUND;
            devDescription = DEV_DESCRIPTIONS.API_NOT_FOUND(error.url!);
        } else {
            userMessage = USER_MESSAGES.UNKNOWN_ERROR;
            devDescription = DEV_DESCRIPTIONS.UNKNOWN_STATUS(error.status);
        }

        return { userMessage, devDescription };
    }
}