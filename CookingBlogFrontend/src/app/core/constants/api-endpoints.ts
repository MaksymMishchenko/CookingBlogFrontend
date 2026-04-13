export const API_ENDPOINTS = {
    POSTS: 'posts',
    ADMINPOSTS: 'admin/posts',
    COMMENTS: 'comments',
    CATEGORIES: "category",   
    AUTH: {
        LOGIN: 'auth/login', 
        REGISTER: 'auth/register'       
    }
} as const;

export const ADMIN_ROUTER_PATHS = {
  ADMIN: 'admin',
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  CREATE: 'create',
  EDIT: 'edit',
  POST: 'post'
};