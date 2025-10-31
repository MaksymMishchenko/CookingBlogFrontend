import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  logErrorToConsole(error: HttpErrorResponse, devMessage: string) {

    const logData = {
      timestamp: new Date().toISOString(),
      status: error.status,
      url: error.url,
      devMessage: devMessage,
      errorObject: error.error || error
    };

    console.error('Global Logging TO CONSOLE', logData);
  }
}
