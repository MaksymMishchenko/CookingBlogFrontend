import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, defer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { EditPageComponent } from './edit-page.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { PostsService } from '../../shared/services/post/posts.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { PostAdminDetailsDto, UpdatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post.service';
import { provideHttpClient,  withFetch} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('EditPageComponent', () => {
  let fixture: ComponentFixture<EditPageComponent>;
  let component: EditPageComponent;

  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let postServiceSpy: jasmine.SpyObj<PostsService>;
  let adminPostServiceSpy: jasmine.SpyObj<AdminPostService>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('42')
      }
    }
  };

  const mockCategories: CategoryListDto[] = [
    { id: 1, name: 'Desserts' } as any,
  ];

  const mockPost: PostAdminDetailsDto = {
    id: 42,
    title: 'Old Recipe Title',
    content: 'Old content',
    categoryId: 1
  } as any;

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    postServiceSpy = jasmine.createSpyObj('PostsService', ['updatePost']);
    adminPostServiceSpy = jasmine.createSpyObj('AdminPostService', ['getPostById']);
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['error', 'success']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EditPageComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: PostsService, useValue: postServiceSpy },
        { provide: AdminPostService, useValue: adminPostServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        provideHttpClient(withFetch()),
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPageComponent);
    component = fixture.componentInstance;
    activatedRouteMock.snapshot.paramMap.get.and.returnValue('42');
  });

  function createComponent() {
    fixture.detectChanges();
  }

  it('should redirect to dashboard if post ID is missing or invalid', () => {
    activatedRouteMock.snapshot.paramMap.get.and.returnValue(null);

    createComponent();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should show loader while data (post & categories) is being fetched', fakeAsync(() => {
    adminPostServiceSpy.getPostById.and.returnValue(defer(() => of(mockPost)));
    categoryServiceSpy.getCategories.and.returnValue(defer(() => of(mockCategories)));

    createComponent();
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.css('.loader'));
    expect(loader).toBeTruthy();
    expect(component.viewState().isLoading).toBeTrue();

    tick();
  }));

  it('should render the post form when post and categories load successfully', async () => {
    adminPostServiceSpy.getPostById.and.returnValue(of(mockPost));
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('app-post-form'));
    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));

    expect(form).toBeTruthy();
    expect(errorBanner).toBeFalsy();
    expect(component.viewState().currentPost).toEqual(mockPost);
    expect(component.viewState().categories).toEqual(mockCategories);
  });

  it('should show error banner if forkJoin fails (e.g. server error)', async () => {
    adminPostServiceSpy.getPostById.and.returnValue(throwError(() => new Error('Post not found')));
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));
    const form = fixture.debugElement.query(By.css('app-post-form'));

    expect(errorBanner).toBeTruthy();
    expect(form).toBeFalsy();
    expect(component.viewState().hasError).toBeTrue();
  });

  it('should set isSubmitting and navigate to dashboard on successful post update', async () => {
    adminPostServiceSpy.getPostById.and.returnValue(of(mockPost));
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    postServiceSpy.updatePost.and.returnValue(of({} as any));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const updateData = { title: 'Updated Title' } as UpdatePostRequest;
    const submitPromise = component.onUpdatePost(updateData);

    expect(component.viewState().isSubmitting).toBeTrue();

    await submitPromise;

    expect(component.viewState().isSubmitting).toBeFalse();
    expect(postServiceSpy.updatePost).toHaveBeenCalledWith(42, updateData);
    expect(alertServiceSpy.success).toHaveBeenCalledWith('Post has been updated successfully!');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should show an error alert when post update fails', async () => {
    adminPostServiceSpy.getPostById.and.returnValue(of(mockPost));
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    postServiceSpy.updatePost.and.returnValue(throwError(() => new Error('Update failed')));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    await component.onUpdatePost({} as UpdatePostRequest);

    expect(component.viewState().isSubmitting).toBeFalse();
    expect(alertServiceSpy.error).toHaveBeenCalledWith('Failed to update post');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate back to dashboard on form cancel', () => {
    component.onFormCancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

});