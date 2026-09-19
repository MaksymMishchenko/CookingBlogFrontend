import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { editPostResolver } from './edit-post.resolver';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';

describe('editPostResolver', () => {
    let adminPostServiceSpy: jasmine.SpyObj<AdminPostService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const postServiceMock = jasmine.createSpyObj('AdminPostService', ['getPostById']);
        const routerMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AdminPostService, useValue: postServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });

        adminPostServiceSpy = TestBed.inject(AdminPostService) as jasmine.SpyObj<AdminPostService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should redirect to dashboard and return empty when id is not a number', (done) => {
        const routeMock = { paramMap: { get: () => 'abc' } } as any;

        TestBed.runInInjectionContext(() => {
            const result$ = editPostResolver(routeMock, {} as any);

            result$.subscribe({
                complete: () => {
                    expect(routerSpy.navigate).toHaveBeenCalledWith([ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
                    expect(adminPostServiceSpy.getPostById).not.toHaveBeenCalled();
                    done();
                }
            });
        });
    });

    it('should fetch post data successfully when id is valid', (done) => {
        const routeMock = { paramMap: { get: () => '1' } } as any;
        const mockPost = { id: 1, title: 'Test Post' };
        adminPostServiceSpy.getPostById.and.returnValue(of(mockPost as any));

        TestBed.runInInjectionContext(() => {
            const result$ = editPostResolver(routeMock, {} as any);

            result$.subscribe((data: any) => {
                expect(data).toEqual(mockPost as any);
                expect(adminPostServiceSpy.getPostById).toHaveBeenCalledWith(1);
                done();
            });
        });
    });

    it('should redirect to dashboard and handle error when post does not exist', (done) => {
        const routeMock = { paramMap: { get: () => '999' } } as any;
        adminPostServiceSpy.getPostById.and.returnValue(throwError(() => new Error('Not found')));

        TestBed.runInInjectionContext(() => {
            const result$ = editPostResolver(routeMock, {} as any);

            result$.subscribe({
                complete: () => {
                    expect(routerSpy.navigate).toHaveBeenCalledWith([ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
                    done();
                }
            });
        });
    });
});