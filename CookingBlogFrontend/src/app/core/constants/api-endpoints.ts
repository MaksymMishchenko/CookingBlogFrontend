export const API_ENDPOINTS = {
    PUBLIC_POSTS: 'posts',
    ADMIN_POSTS: 'admin/posts',
    COMMENTS: 'comments',
    CATEGORIES: "categories",   
    AUTH: {
        LOGIN: 'auth/login', 
        REGISTER: 'auth/register'       
    },
    USER: {
        AUTHORS: 'admin/users/authors'
    }
} as const;

export const ADMIN_ROUTER_PATHS = {
  ADMIN: 'admin',
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  CREATE: 'create',
  EDIT: 'edit',
  POST: 'post'
} as const;