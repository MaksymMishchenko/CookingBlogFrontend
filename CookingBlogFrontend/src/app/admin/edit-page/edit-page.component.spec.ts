import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { EditPageComponent } from './edit-page.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { PostAdminDetailsDto, UpdatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';
import { UI_SUCCESS_MESSAGES } from '../../core/constants/ui-messages.constants';

describe('EditPageComponent', () => {
  let fixture: ComponentFixture<EditPageComponent>;
  let component: EditPageComponent;

  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let adminPostServiceSpy: jasmine.SpyObj<AdminPostService>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCategories: CategoryListDto[] = [
    { id: 1, name: 'Desserts' } as any,
    { id: 2, name: 'Soups' } as any,
  ];

  const mockPost = {
    id: 5,
    title: 'Test post',
    description: 'Test description',
    content: 'c'.repeat(120),
    previewImageUrl: '',
    previewImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    slug: 'test-post',
    categoryId: 1,
    isActive: true
  } as unknown as PostAdminDetailsDto;

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    adminPostServiceSpy = jasmine.createSpyObj('AdminPostService', ['updatePost']);
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['error', 'success']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EditPageComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AdminPostService, useValue: adminPostServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { postData: mockPost } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPageComponent);
    component = fixture.componentInstance;
  });

  async function init() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function getPostForm(): PostFormComponent {
    return fixture.debugElement.query(By.directive(PostFormComponent)).componentInstance;
  }

  async function submitWithError(err: unknown) {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.updatePost.and.returnValue(throwError(() => err));

    await init();
    await component.onUpdatePost({} as UpdatePostRequest);
    fixture.detectChanges();
  }

  it('should take post id and post data from resolved route data', () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    expect(component.postId).toBe(5);
    expect(component.viewState().currentPost).toEqual(mockPost);
  });

  it('should load categories successfully and display the form', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    await init();

    const state = component.viewState();
    expect(state.categories).toEqual(mockCategories);
    expect(state.isLoading).toBeFalse();
    expect(state.hasError).toBeFalse();
    expect(fixture.debugElement.query(By.css('app-post-form'))).toBeTruthy();
  });
  
  it('should pass post, categories and edit mode to the form', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    await init();

    const form = getPostForm();
    expect(form.postData()).toEqual(mockPost);
    expect(form.categories()).toEqual(mockCategories);
    expect(form.mode()).toBe('edit');
  });

  it('should set error state when categories fail to load', async () => {
    categoryServiceSpy.getCategories.and.returnValue(throwError(() => new Error('Network error')));

    await init();

    expect(component.viewState().hasError).toBeTrue();
    expect(component.viewState().isLoading).toBeFalse();
    expect(fixture.debugElement.query(By.css('app-post-form'))).toBeFalsy();
  });

  it('should set error state when categories list is empty', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of([]));

    await init();

    expect(component.viewState().hasError).toBeTrue();
  });

  it('should show the form after a successful retry', async () => {
    categoryServiceSpy.getCategories.and.returnValues(
      throwError(() => new Error('Network error')),
      of(mockCategories)
    );
    await init();
    expect(component.viewState().hasError).toBeTrue();

    component.retryLoad();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.viewState().hasError).toBeFalse();
    expect(fixture.debugElement.query(By.css('app-post-form'))).toBeTruthy();
  });

  it('should update post, show success alert and navigate to dashboard on success', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.updatePost.and.returnValue(of({} as any));
    await init();

    const data = {} as UpdatePostRequest;
    const submitPromise = component.onUpdatePost(data);

    expect(component.viewState().isSubmitting).toBeTrue();

    await submitPromise;

    expect(component.viewState().isSubmitting).toBeFalse();
    expect(adminPostServiceSpy.updatePost).toHaveBeenCalledWith(5, data);
    expect(alertServiceSpy.success).toHaveBeenCalledWith(UI_SUCCESS_MESSAGES.UPDATED('Post'));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
    expect(component.serverError()).toBeNull();
  });

  it('should store update error, pass it to the form and stay on the page', async () => {
    const err = new Error('any error');
    await submitWithError(err);

    expect(component.serverError()).toBe(err);
    expect(getPostForm().serverError()).toBe(err);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(alertServiceSpy.success).not.toHaveBeenCalled();
    expect(component.viewState().isSubmitting).toBeFalse();
  });
  
  it('should reset server error to null while the next request is in flight', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.updatePost.and.returnValue(of({} as any));
    await init();

    component.serverError.set(new Error('old error'));

    const submitPromise = component.onUpdatePost({} as UpdatePostRequest);
    expect(component.serverError()).toBeNull();

    await submitPromise;
  });

  it('should navigate to dashboard on form cancel', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    await init();

    component.onFormCancel();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
  });
});