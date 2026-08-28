import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, defer } from 'rxjs';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { CreatePageComponent } from './create-page.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { CreatePostRequest } from '../../shared/interfaces/post.interface';
import { AdminPostService } from '../shared/services/admin-post.service';

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

  it('should show loading message while categories are being fetched', fakeAsync(() => {    
    categoryServiceSpy.getCategories.and.returnValue(defer(() => of(mockCategories)));
    
    createComponent();
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.css('.loader'));
    expect(loader).toBeTruthy();
    expect(loader.nativeElement.textContent).toContain('Loading form');
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

  it('should set isSubmitting and navigate on successful post creation', async () => {
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
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(alertServiceSpy.success).toHaveBeenCalled();
  });

  it('should show an error alert when post creation fails', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    adminPostServiceSpy.createPost.and.returnValue(throwError(() => new Error('Server error')));
    
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    await component.onCreatePost({} as CreatePostRequest);

    expect(component.viewState().isSubmitting).toBeFalse();
    expect(alertServiceSpy.error).toHaveBeenCalledWith('Failed to create post');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});