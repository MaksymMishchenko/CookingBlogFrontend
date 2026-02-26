import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { CategoryService } from './categories.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { emptyMockResponse, mockResponse } from './categories.service.mock';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        provideHttpClient(withFetch()),
        provideHttpClientTesting()]
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch and map categories correctly', (done) => {
    // Arrange
    const expectedData = mockResponse;

    // Act
    service.getCategories().subscribe((categories) => {
      // Assert
      expect(categories.length).toBe(2);
      expect(categories).toEqual(expectedData.data);
      done();
    });

    // Assert
    const req = httpMock.expectOne(req => req.url.includes(API_ENDPOINTS.CATEGORIES));
    req.flush(expectedData);
  });

  it('should retry twice and return empty array on persistent 500 error', fakeAsync(() => {
    // Arrange
    let result: any;
    const errorMessage = 'Server Error';

    // Act
    service.getCategories().subscribe(res => result = res);

    httpMock.expectOne(req => req.url.includes(API_ENDPOINTS.CATEGORIES))
      .flush('Error', { status: 500, statusText: errorMessage });
    tick(2000);

    httpMock.expectOne(req => req.url.includes(API_ENDPOINTS.CATEGORIES))
      .flush('Error', { status: 500, statusText: errorMessage });
    tick(4000);

    httpMock.expectOne(req => req.url.includes(API_ENDPOINTS.CATEGORIES))
      .flush('Error', { status: 500, statusText: errorMessage });

    // Assert
    expect(result).toEqual([]);
  }));

  it('should handle empty data response', (done) => {
    // Arrange
    const emptyResponse = emptyMockResponse;

    // Act
    service.getCategories().subscribe((categories) => {
      // Assert
      expect(categories.length).toBe(0);
      done();
    });
    // Assert
    const req = httpMock.expectOne(req => req.url.includes(API_ENDPOINTS.CATEGORIES));
    req.flush(emptyResponse);
  });
});