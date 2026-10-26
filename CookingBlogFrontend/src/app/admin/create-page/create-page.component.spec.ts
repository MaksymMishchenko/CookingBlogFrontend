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
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(defer(() => of(mockCategories)));

    // Act
    createComponent();
    fixture.detectChanges();

    // Assert
    const loader = fixture.debugElement.query(By.css('.skeleton-form-wrapper'));
    expect(loader).toBeTruthy();

    expect(loader.attributes['cy-data']).toBe('loading');
    expect(component.viewState().isLoading).toBeTrue();

    tick();
  }));

  it('should show the post form when categories load successfully', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    // Act
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const form = fixture.debugElement.query(By.css('app-post-form'));
    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));

    expect(form).toBeTruthy();
    expect(errorBanner).toBeFalsy();
    expect(component.viewState().categories).toEqual(mockCategories);
  });

  it('should show error banner when categories fail to load', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(throwError(() => new Error('Network error')));

    // Act
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));
    const form = fixture.debugElement.query(By.css('app-post-form'));

    expect(errorBanner).toBeTruthy();
    expect(form).toBeFalsy();
    expect(component.viewState().hasError).toBeTrue();
  });

  it('should show error banner when categories list is empty', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of([]));

    // Act
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));
    expect(errorBanner).toBeTruthy();
    expect(component.viewState().hasError).toBeTrue();
  });

  it('should set isSubmitting and navigate on successful post creation', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.createPost.and.returnValue(of({} as any));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const postData = {} as CreatePostRequest;

    // Act
    const submitPromise = component.onCreatePost(postData);

    // Assert
    expect(component.viewState().isSubmitting).toBeTrue();

    await submitPromise;

    // Assert
    expect(component.viewState().isSubmitting).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(alertServiceSpy.success).toHaveBeenCalled();
    expect(component.serverError()).toBeNull();
  });

  it('should store any submit error as is, pass it to the form and stay on the page', async () => {
    // Arrange
    const err = new Error('any error');

    // Act
    await submitWithError(err);

    // Assert
    expect(component.serverError()).toBe(err);
    expect(getPostForm().serverError()).toBe(err);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(alertServiceSpy.success).not.toHaveBeenCalled();
    expect(component.viewState().isSubmitting).toBeFalse();
  });  

  it('should reset server error to null while the next request is in flight', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.createPost.and.returnValue(of({} as any));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    component.serverError.set(new Error('old error'));

    // Act
    const submitPromise = component.onCreatePost({} as CreatePostRequest);

    // Assert
    expect(component.serverError()).toBeNull();

    await submitPromise;
  });  
});