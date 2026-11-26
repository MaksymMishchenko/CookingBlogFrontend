import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ImageService, UploadImageResponse } from './image.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

describe('ImageService', () => {
  let service: ImageService;
  let http: HttpTestingController;

  const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
  const response: UploadImageResponse = { id: 'img-1', url: 'https://cdn.example.com/photo.jpg', alt: 'Test alt' };

  const matchUpload = (r: { method: string; url: string }) =>
    r.method === 'POST' && r.url.endsWith(API_ENDPOINTS.ADMIN_IMAGES);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ImageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends ContentImage and Alt as FormData and returns the data', () => {
    let result: UploadImageResponse | undefined;

    service.uploadContentImage(file, 'Test alt').subscribe(r => (result = r));

    const req = http.expectOne(matchUpload);
    const body = req.request.body as FormData;
    expect(body.get('ContentImage')).toBe(file);
    expect(body.get('Alt')).toBe('Test alt');

    req.flush({ data: response });
    expect(result).toEqual(response);
  });

  it('does not append Alt when it is empty', () => {
    service.uploadContentImage(file, '').subscribe();

    const req = http.expectOne(matchUpload);
    expect((req.request.body as FormData).has('Alt')).toBe(false);

    req.flush({ data: response });
  });

  it('propagates the error to the subscriber', () => {
    let error: unknown;
    service.uploadContentImage(file).subscribe({ error: e => (error = e) });

    http.expectOne(matchUpload).flush({}, { status: 400, statusText: 'Bad Request' });

    expect(error).toBeTruthy();
  });
});