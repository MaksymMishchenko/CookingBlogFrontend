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
      error: {message: 'Not Found'}
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
});
