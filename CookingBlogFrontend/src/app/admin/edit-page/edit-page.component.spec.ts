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
import { ValidationError, BusinessError } from '../../shared/services/error/error.types';

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
    previewImageUrl: 'img.png',
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

  async function submitWithError(err: unknown) {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.updatePost.and.returnValue(throwError(() => err));

    await init();

    await component.onUpdatePost({} as UpdatePostRequest);
    fixture.detectChanges();
  }

  it('should take post id from resolved route data', () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    expect(component.postId).toBe(5);
    expect(component.viewState().currentPost).toEqual(mockPost);
  });

  it('should load categories successfully', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));

    // Act
    await init();

    // Assert
    const state = component.viewState();
    expect(state.categories).toEqual(mockCategories);
    expect(state.isLoading).toBeFalse();
    expect(state.hasError).toBeFalse();
    expect(fixture.debugElement.query(By.css('app-post-form'))).toBeTruthy();
  });

  it('should set error state when categories fail to load', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(throwError(() => new Error('Network error')));

    // Act
    await init();

    // Assert
    expect(component.viewState().hasError).toBeTrue();
    expect(component.viewState().isLoading).toBeFalse();
    expect(fixture.debugElement.query(By.css('app-post-form'))).toBeFalsy();
  });

  it('should set error state when categories list is empty', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of([]));

    // Act
    await init();

    // Assert
    expect(component.viewState().hasError).toBeTrue();
  });

  it('should update post, show success alert and navigate on success', async () => {
    // Arrange
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.updatePost.and.returnValue(of({} as any));
    await init();

    const data = {} as UpdatePostRequest;

    // Act
    const submitPromise = component.onUpdatePost(data);

    // Assert
    expect(component.viewState().isSubmitting).toBeTrue();

    await submitPromise;

    expect(component.viewState().isSubmitting).toBeFalse();
    expect(adminPostServiceSpy.updatePost).toHaveBeenCalledWith(5, data);
    expect(alertServiceSpy.success).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
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
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.viewState().isSubmitting).toBeFalse();
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
    adminPostServiceSpy.updatePost.and.returnValue(of({} as any));
    await init();

    component.formErrors.set(['old error']);

    // Act
    await component.onUpdatePost({} as UpdatePostRequest);
    fixture.detectChanges();

    // Assert
    expect(component.formErrors()).toEqual([]);
    expect(fixture.debugElement.query(By.css('[data-cy=form-errors]'))).toBeFalsy();
  });
});