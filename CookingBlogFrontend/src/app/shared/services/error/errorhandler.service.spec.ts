import { ERROR_LOG_CONTEXT, ERROR_LOG_MESSAGES } from './error.constants';
import { ErrorHandlerService } from './errorhandler.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    service = new ErrorHandlerService();
  });

  it('should log error data to console', () => {

    const mockError = new HttpErrorResponse({
      status: 404,
      url: '/api/test',
      error: { message: 'Not Found' }
    });

    const consoleSpy = spyOn(console, 'error');

    service.logErrorToConsole(mockError, 'Dev message example');

    expect(consoleSpy).toHaveBeenCalled();

    const loggedArgs = consoleSpy.calls.mostRecent().args[1];
    expect(loggedArgs.status).toBe(404);
    expect(loggedArgs.url).toBe('/api/test');
    expect(loggedArgs.devMessage).toBe('Dev message example');
    expect(loggedArgs.errorObject).toEqual({ message: 'Not Found' });
  });

  describe('logLogicError', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'error');
    });

    it('should format and log a standard Error object', () => {
      const error = new Error('JWT Decode Failed');
      const devMsg = 'Auth Service Error';

      service.logLogicError(error, devMsg);

      const loggedArgs = consoleSpy.calls.mostRecent().args[1];
      expect(loggedArgs.context).toBe(ERROR_LOG_CONTEXT.LOGIC);
      expect(loggedArgs.status).toBe(ERROR_LOG_MESSAGES.LOCAL_LOGIC_ERROR);
      expect(loggedArgs.errorObject).toBe('JWT Decode Failed');
      expect(loggedArgs.devMessage).toBe(devMsg);
    });

    it('should stringify and log a plain object error', () => {
      const errorObj = { code: 500, detail: 'Broken' };
      const devMsg = 'Object error test';

      service.logLogicError(errorObj, devMsg);

      const loggedArgs = consoleSpy.calls.mostRecent().args[1];
      expect(loggedArgs.errorObject).toBe(JSON.stringify(errorObj));
    });

    it('should log a string error as is', () => {
      const errorString = 'Something went wrong';

      service.logLogicError(errorString, 'String test');

      const loggedArgs = consoleSpy.calls.mostRecent().args[1];
      expect(loggedArgs.errorObject).toBe(errorString);
    });

    it('should handle null or undefined gracefully', () => {
      service.logLogicError(null, 'Null test');

      const loggedArgs = consoleSpy.calls.mostRecent().args[1];
      expect(loggedArgs.errorObject).toBe('null');
    });
  });

});
