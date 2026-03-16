import { HttpContextToken } from '@angular/common/http';

export const AUTH_REDIRECT = new HttpContextToken<boolean>(() => true);