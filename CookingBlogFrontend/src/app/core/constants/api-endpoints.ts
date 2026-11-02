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
  ROOT: 'admin',
  LOGIN: 'admin/login',
  DASHBOARD: 'admin/dashboard',
  CREATE: 'admin/create',  
  POST_EDIT: (id: number | string = ':id') => `admin/post/${id}/edit`,
} as const;