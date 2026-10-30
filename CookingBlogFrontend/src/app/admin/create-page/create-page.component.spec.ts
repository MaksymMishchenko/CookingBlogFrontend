import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, defer } from 'rxjs';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { CreatePageComponent } from './create-page.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { CreatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post/admin-post.service';
import { PostFormComponent } from '../shared/components/post-form/post-form.component';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';
import { UI_SUCCESS_MESSAGES } from '../../core/constants/ui-messages.constants';

describe('CreatePageComponent', () => {
  let fixture: ComponentFixture<CreatePageComponent>;
  let component: CreatePageComponent;

  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let adminPostServiceSpy: jasmine.SpyObj<AdminPostService>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCategories: CategoryListDto[] = [
    { id: 1, name: 'Desserts' } as any,
    { id: 2, name: 'Soups' } as any,
  ];

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    adminPostServiceSpy = jasmine.createSpyObj('AdminPostService', ['createPost']);
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['error', 'success']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreatePageComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AdminPostService, useValue: adminPostServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePageComponent);
    component = fixture.componentInstance;
  });

  function createComponent() {
    fixture.detectChanges();
  }

  function getPostForm(): PostFormComponent {
    return fixture.debugElement.query(By.directive(PostFormComponent)).componentInstance;
  }

  async function submitWithError(err: unknown) {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.createPost.and.returnValue(throwError(() => err));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    await component.onCreatePost({} as CreatePostRequest);
    fixture.detectChanges();
  }

  it('should show loading skeleton while categories are being fetched', fakeAsync(() => {
    categoryServiceSpy.getCategories.and.returnValue(defer(() => of(mockCategories)));

    createComponent();
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.css('.skeleton-form-wrapper'));
    expect(loader).toBeTruthy();
    expect(loader.attributes['cy-data']).toBe('loading');
    expect(component.viewState().isLoading).toBeTrue();

    tick();
  }));

  it('should show the post form when categories load successfully', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('app-post-form'));
    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));

    expect(form).toBeTruthy();
    expect(errorBanner).toBeFalsy();
    expect(component.viewState().categories).toEqual(mockCategories);
  });

  it('should show error banner when categories fail to load', async () => {
    categoryServiceSpy.getCategories.and.returnValue(throwError(() => new Error('Network error')));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));
    const form = fixture.debugElement.query(By.css('app-post-form'));

    expect(errorBanner).toBeTruthy();
    expect(form).toBeFalsy();
    expect(component.viewState().hasError).toBeTrue();
  });

  it('should show error banner when categories list is empty', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of([]));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));
    expect(errorBanner).toBeTruthy();
    expect(component.viewState().hasError).toBeTrue();
  });

  it('should successfully retry loading categories', async () => {
    categoryServiceSpy.getCategories.and.returnValues(
      throwError(() => new Error('Error')),
      of(mockCategories)
    );

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.viewState().hasError).toBeTrue();

    component.retryLoad();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.viewState().hasError).toBeFalse();
    expect(fixture.debugElement.query(By.css('app-post-form'))).toBeTruthy();
  });

  it('should set isSubmitting, show success alert and navigate using route constants on successful post creation', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.createPost.and.returnValue(of({} as any));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const postData = {} as CreatePostRequest;
    const submitPromise = component.onCreatePost(postData);

    expect(component.viewState().isSubmitting).toBeTrue();

    await submitPromise;

    expect(component.viewState().isSubmitting).toBeFalse();
    expect(adminPostServiceSpy.createPost).toHaveBeenCalledWith(postData);
    expect(alertServiceSpy.success).toHaveBeenCalledWith(UI_SUCCESS_MESSAGES.CREATED('Post'));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
    expect(component.serverError()).toBeNull();
  });

  it('should store any submit error as is, pass it to the form and stay on the page', async () => {
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
    adminPostServiceSpy.createPost.and.returnValue(of({} as any));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    component.serverError.set(new Error('old error'));

    const submitPromise = component.onCreatePost({} as CreatePostRequest);
    expect(component.serverError()).toBeNull();

    await submitPromise;
  }); 

  it('should navigate to dashboard on form cancel', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    component.onFormCancel();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);
  });
});