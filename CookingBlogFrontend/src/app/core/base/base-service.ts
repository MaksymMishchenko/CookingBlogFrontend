import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable()

export abstract class BaseService {
  protected readonly baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected buildUrl(endpoint: string): string { 
    return `${this.baseUrl}/${endpoint}`;
  }
}