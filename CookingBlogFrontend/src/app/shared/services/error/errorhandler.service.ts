import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  logErrorToConsole(error: HttpErrorResponse, devMessage: string) {
    this.executeLog({
      status: error.status,
      url: error.url,
      errorObject: error.error || error
    }, devMessage, 'HTTP');
  }

  logLogicError(error: unknown, devMessage: string) {   
    const errorObject = error instanceof Error
      ? error.message
      : (typeof error === 'object' ? JSON.stringify(error) : String(error));

    this.executeLog({
      status: 'LOCAL_LOGIC_ERROR',
      errorObject: errorObject
    }, devMessage, 'LOGIC');
  }

  private executeLog(details: any, devMessage: string, context: string) {
    const logData = {
      timestamp: new Date().toISOString(),
      context: context,
      devMessage: devMessage,
      ...details
    };

    console.error(`[${context}] Global Logging TO CONSOLE`, logData);
  }
}

// export class ErrorHandlerService {

//   logErrorToConsole(error: HttpErrorResponse, devMessage: string) {

//     const logData = {
//       timestamp: new Date().toISOString(),
//       status: error.status,
//       url: error.url,
//       devMessage: devMessage,
//       errorObject: error.error || error
//     };

//     console.error('Global Logging TO CONSOLE', logData);
//   }
// }
