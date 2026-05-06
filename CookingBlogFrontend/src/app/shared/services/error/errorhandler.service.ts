import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ERROR_LOG_CONTEXT, ERROR_LOG_MESSAGES } from './error-logging.constants';
import { AppError } from './error.types';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  logAppError(appError: AppError): void {
    const originalError = appError.originalError as HttpErrorResponse;
    const raw = appError as any;

    const logData = {
      type: appError.constructor.name,
      status: appError.status,
      url: originalError?.url || 'Internal / N/A',
      userMessage: appError.message,
      devDescription: appError.developerDetails,
      details: {
        errors: raw.errors || null,
        errorCode: raw.errorCode || null,
      },
      serverRawBody: originalError?.error || 'No server body'
    };

    this.printToConsole(logData, ERROR_LOG_CONTEXT.HTTP);
  }
  
  logLogicError(error: unknown, devDescription: string): void {
    const errorObject = error instanceof Error ? error.message : error;

    const logData = {
      type: 'LogicError',
      status: ERROR_LOG_MESSAGES.LOCAL_LOGIC_ERROR,
      url: 'Client-Side Logic',
      userMessage: 'Local logic failure',
      devDescription: devDescription,
      details: { errorObject }
    };  

    this.printToConsole(logData, ERROR_LOG_CONTEXT.LOGIC);
  }

  private printToConsole(logData: any, context: string): void {
    const timestamp = new Date().toLocaleTimeString();
       
    console.groupCollapsed(
      `[${context}] [${logData.status}] ${logData.type}: ${logData.devDescription || logData.userMessage}`
    );
    
    console.log(`Time: ${timestamp}`);
       
    console.table({
      Type: logData.type,
      Status: logData.status,
      Context: context,
      DevDetails: logData.devDescription
    });
    
    console.error('Full Error Context:', logData);
    
    console.groupEnd();
  }
}