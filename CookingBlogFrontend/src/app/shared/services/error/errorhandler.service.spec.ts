import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './errorhandler.service';
import { ERROR_LOG_CONTEXT, ERROR_LOG_MESSAGES } from './error.constants';
import { CriticalError } from './error.types';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let groupSpy: jasmine.Spy;
  let errorSpy: jasmine.Spy;

  beforeEach(() => {
    service = new ErrorHandlerService();    
    groupSpy = spyOn(console, 'groupCollapsed');
    errorSpy = spyOn(console, 'error');
    spyOn(console, 'log');
    spyOn(console, 'table');
    spyOn(console, 'groupEnd');
  });

  describe('logAppError', () => {
    it('should format and log AppError (Http context) correctly', () => {
      // Arrange
      const url = '/api/test';
      const status = 500;
      const devMsg = 'Database connection failed';
      const serverBody = { message: 'DB Error' };
      const errorCode = 'DB_500';

      const originalHttpError = new HttpErrorResponse({
        status: status,
        url: url,
        error: serverBody
      });

      const appError = new CriticalError(
        'User friendly message',
        status,
        devMsg,
        originalHttpError,
        errorCode
      );

      // Act
      service.logAppError(appError);

      // Assert
      expect(groupSpy).toHaveBeenCalledWith(jasmine.stringMatching(`\\[${ERROR_LOG_CONTEXT.HTTP}\\]`));
      
      const logData = errorSpy.calls.mostRecent().args[1];
      expect(logData.type).toBe('CriticalError');
      expect(logData.status).toBe(status);
      expect(logData.url).toBe(url);
      expect(logData.devDescription).toBe(devMsg);
      expect(logData.details.errorCode).toBe(errorCode);
      expect(logData.serverRawBody).toEqual(serverBody);
    });
  });

  describe('logLogicError', () => {
    it('should log client-side logic error with correct context', () => {
      // Arrange
      const error = new Error('JWT Decode Failed');
      const devMsg = 'Auth Service Error';

      // Act
      service.logLogicError(error, devMsg);

      // Assert
      expect(groupSpy).toHaveBeenCalledWith(jasmine.stringMatching(`\\[${ERROR_LOG_CONTEXT.LOGIC}\\]`));
      
      const logData = errorSpy.calls.mostRecent().args[1];
      expect(logData.type).toBe('LogicError');
      expect(logData.status).toBe(ERROR_LOG_MESSAGES.LOCAL_LOGIC_ERROR);
      expect(logData.details.errorObject).toBe(error.message);
      expect(logData.devDescription).toBe(devMsg);
    });

    it('should handle string error messages', () => {
      // Arrange
      const errorString = 'Something went wrong';

      // Act
      service.logLogicError(errorString, 'String test');

      // Assert
      const logData = errorSpy.calls.mostRecent().args[1];
      expect(logData.details.errorObject).toBe(errorString);
    });

    it('should handle plain objects as errors', () => {
      // Arrange
      const errorObj = { code: 500, detail: 'Broken' };

      // Act
      service.logLogicError(errorObj, 'Object test');

      // Assert
      const logData = errorSpy.calls.mostRecent().args[1];
      expect(logData.details.errorObject).toEqual(errorObj);
    });
  });
});