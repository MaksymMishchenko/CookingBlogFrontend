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
import { BusinessError, ValidationError } from '../../shared/services/error/error.types';

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
  });

  it('should show backend validation errors in the banner', async () => {
    // Arrange
    const err = new ValidationError('Validation Failed.', 400, '', {} as any, {
      Slug: ['Slug is required.'],
      Title: ['Title is required.']
    });

    // Act
    await submitWithError(err);

    // Assert
    expect(component.formErrors()).toEqual(['Slug is required.', 'Title is required.']);
    const items = fixture.debugElement.queryAll(By.css('[data-cy=form-errors] li'));
    expect(items.length).toBe(2);
    expect(items[0].nativeElement.textContent).toContain('Slug is required.');
  });

  it('should show err.message when validation error has no field errors', async () => {
    // Arrange
    const err = new ValidationError('Validation Failed.', 400, '', {} as any, {});

    // Act
    await submitWithError(err);

    // Assert
    expect(component.formErrors()).toEqual(['Validation Failed.']);
  });

  it('should show business error message in the banner', async () => {
    // Arrange
    const err = new BusinessError('Post already exists', 409, '', {} as any, 'POST_ALREADY_EXISTS');

    // Act
    await submitWithError(err);

    // Assert
    expect(component.formErrors()).toEqual(['Post already exists']);
    expect(fixture.debugElement.query(By.css('[data-cy=form-errors]'))).toBeTruthy();
  });

  it('should clear previous errors on the next submit', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.createPost.and.returnValue(of({} as any));

    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    component.formErrors.set(['old error']);

    // Act
    await component.onCreatePost({} as CreatePostRequest);
    fixture.detectChanges();

    // Assert
    expect(component.formErrors()).toEqual([]);
    expect(fixture.debugElement.query(By.css('[data-cy=form-errors]'))).toBeFalsy();
  });
});