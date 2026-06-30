import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { CreatePageComponent } from './create-page.component';
import { CategoryService } from '../../shared/services/category/categories.service';
import { PostsService } from '../../shared/services/post/posts.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { CategoryListDto } from '../../shared/services/category/category.interface';
import { CreatePostRequest } from '../../shared/interfaces/post.interface';

describe('CreatePageComponent', () => {
  let fixture: ComponentFixture<CreatePageComponent>;
  let component: CreatePageComponent;

  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let postServiceSpy: jasmine.SpyObj<PostsService>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCategories: CategoryListDto[] = [
    { id: 1, name: 'Desserts' } as CategoryListDto,
    { id: 2, name: 'Soups' } as CategoryListDto,
  ];

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    postServiceSpy = jasmine.createSpyObj('PostsService', ['createPost']);
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['error', 'success']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreatePageComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: PostsService, useValue: postServiceSpy },
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

  it('should show loading message while categories are being fetched', () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    createComponent();

    const loader = fixture.debugElement.query(By.css('.loader'));
    expect(loader).toBeTruthy();
    expect(loader.nativeElement.textContent).toContain('Loading form');
  });

  it('should show the post form when categories load successfully', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('app-post-form'));
    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));

    expect(form).toBeTruthy();
    expect(errorBanner).toBeFalsy();
    expect(component.categories()).toEqual(mockCategories);
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
    expect(component.categoriesError()).toBe(true);    
  });

  it('should show error banner when categories list is empty', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of([]));
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorBanner = fixture.debugElement.query(By.css('.error-banner'));
    expect(errorBanner).toBeTruthy();
    expect(component.categoriesError()).toBe(true);
  });  

  it('should set isSubmitting and navigate on successful post creation', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    postServiceSpy.createPost.and.returnValue(of({} as any));
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const postData = {} as CreatePostRequest;
    const submitPromise = component.onCreatePost(postData);

    expect(component.isSubmitting()).toBe(true);

    await submitPromise;

    expect(component.isSubmitting()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(alertServiceSpy.success).toHaveBeenCalled();
  });

  it('should show an error alert when post creation fails', async () => {
    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    postServiceSpy.createPost.and.returnValue(throwError(() => new Error('Server error')));
    createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    await component.onCreatePost({} as CreatePostRequest);

    expect(component.isSubmitting()).toBe(false);
    expect(alertServiceSpy.error).toHaveBeenCalledWith('Failed to create post');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});