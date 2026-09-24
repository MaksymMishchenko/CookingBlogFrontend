import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';
import { AuthorDto } from '../../../user.interface';
import { SingleApiResponse } from '../../../../shared/interfaces/global.interface';
import { environment } from '../../../../../environments/environment';


describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.apiUrl;
  const endpoint = API_ENDPOINTS.USER.AUTHORS;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {    
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all authors successfully and map response.data', () => {
    // Arrange
    const mockResponse: SingleApiResponse<AuthorDto[]> = {
      success: true,
      message: 'Authors retrieved successfully.',
      data: [
        { id: '1', userName: 'Maryse.Jacobi' },
        { id: '2', userName: 'Walker.Rohan82' }
      ]
    };

    // Act & Assert
    service.getAllAuthors().subscribe(authors => {
      expect(authors.length).toBe(2);
      expect(authors).toEqual(mockResponse.data!);
    });

    const expectedUrl = `${baseUrl}/${endpoint}`;
    const req = httpMock.expectOne(expectedUrl);
    
    // Assert
    expect(req.request.method).toBe('GET');
       
    // Act
    req.flush(mockResponse);
  });

  it('should return an empty array if response.data is null or undefined', () => {
    // Arrange
    const mockResponse: SingleApiResponse<AuthorDto[]> = {
      success: true,
      message: 'No authors found.',
      data: null as any
    };

    // Act & Assert
    service.getAllAuthors().subscribe(authors => {
      expect(authors).toEqual([]);
    });

    const expectedUrl = `${environment.apiUrl}/${API_ENDPOINTS.USER.AUTHORS}`;
    const req = httpMock.expectOne(expectedUrl);
    
    req.flush(mockResponse);
  });
});