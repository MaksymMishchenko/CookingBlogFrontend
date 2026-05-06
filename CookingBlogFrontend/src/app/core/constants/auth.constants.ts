export const AUTH_CLAIMS = {
  NAME_IDENTIFIER: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ROLE: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  SHORT_ROLE: 'role'
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  EXP_TOKEN: 'exp-token',
  USER_NAME: 'user-name',
  USER_ID: 'user-id'
} as const;

export const AUTH_ROLES = {
  ADMIN: 'Admin',
  CONTRIBUTOR: 'Contributor'
} as const;

export const AUTH_CONFIG = {
  MIN_USERNAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 6
};