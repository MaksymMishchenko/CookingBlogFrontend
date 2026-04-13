import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ERROR_LOG_CONTEXT, ERROR_LOG_MESSAGES } from './error.constants';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  logErrorToConsole(error: HttpErrorResponse, devMessage: string) {
    this.executeLog({
      status: error.status,
      url: error.url,
      errorObject: error.error || error
    }, devMessage, ERROR_LOG_CONTEXT.HTTP);
  }

  logLogicError(error: unknown, devMessage: string) {
    const errorObject = error instanceof Error
      ? error.message
      : (typeof error === 'object' ? JSON.stringify(error) : String(error));

    this.executeLog({
      status: ERROR_LOG_MESSAGES.LOCAL_LOGIC_ERROR,
      errorObject: errorObject
    }, devMessage, ERROR_LOG_CONTEXT.LOGIC);
  }

  private executeLog(details: any, devMessage: string, context: string) {
    const logData = {
      timestamp: new Date().toISOString(),
      context: context,
      devMessage: devMessage,
      ...details
    };

    console.error(`[${context}] ${ERROR_LOG_MESSAGES.GLOBAL_PREFIX}`, logData);
  }
}