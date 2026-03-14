import { HttpContextToken } from "@angular/common/http";

export type AuthErrorStrategy = 'redirect' | 'silent';

export const AUTH_ERROR_STRATEGY = new HttpContextToken<AuthErrorStrategy>(() => 'redirect');