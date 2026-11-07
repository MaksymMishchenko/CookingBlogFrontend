import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseService } from '../../../core/services/base/base.service';
import { SingleApiResponse } from '../../interfaces/global.interface';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

export interface UploadImageResponse {
  id: string;
  url: string;
  alt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService extends BaseService {
  public uploadContentImage(contentImage: File, alt?: string): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('ContentImage', contentImage);

    if (alt) {
      formData.append('Alt', alt);
    }

    const url = this.buildUrl(API_ENDPOINTS.ADMIN_IMAGES);

    return this.http.post<SingleApiResponse<UploadImageResponse>>(url, formData).pipe(
      map(response => response.data!)
    );
  }
}
