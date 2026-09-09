import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { AdminPostService } from '../shared/services/admin-post.service';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';

export const editPostResolver: ResolveFn<any> = (route) => {
    const adminPostService = inject(AdminPostService);
    const router = inject(Router);
    const postId = Number(route.paramMap.get('id'));
   
    if (isNaN(postId)) {
        router.navigate([ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
        return EMPTY;
    }

    return adminPostService.getPostById(postId).pipe(
        catchError(() => {           
            router.navigate([ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
            return EMPTY;
        })
    );
};