import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchPageComponent } from './search-page.component';
import { CategoryService } from '../shared/services/category/categories.service';
import { SearchService } from '../shared/services/search/search.service';
import { of, throwError } from 'rxjs';
import { PostSearchDto, PagedPostResult } from '../shared/interfaces/post.interface';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let searchServiceMock: any;

  const mockPagedResult: PagedPostResult<PostSearchDto> = {
    posts: [{ id: 1, title: 'Post 1', slug: 'p1' } as PostSearchDto],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 10
  };

  beforeEach(async () => {
    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['getCategories']);
       
    searchServiceMock = {
      getPosts: jasmine.createSpy('getPosts').and.returnValue(of(mockPagedResult)),
      setSearchTerm: jasmine.createSpy('setSearchTerm'),
      searchTerm: signal(''),
      isLoading: signal(false)
    };

    categoryServiceMock.getCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: SearchService, useValue: searchServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with categories from service', () => {
    // Arrange
    const categories = [{ id: 1, name: 'Tech', slug: 'tech' }];
    categoryServiceMock.getCategories.and.returnValue(of(categories as any));
    
    // Act
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert
    expect(component.categories()).toEqual(categories as any);
  });

  it('should call getSearchResults when @Input q is set', () => {
    // Arrange
    const query = 'angular';
    
    // Act
    component.q = query;
    fixture.detectChanges();

    // Assert
    expect(searchServiceMock.setSearchTerm).toHaveBeenCalledWith(query);
    expect(searchServiceMock.getPosts).toHaveBeenCalled();
  });

  it('should update search term and fetch results on searchControl changes with debounce', fakeAsync(() => {
    // Act
    component.searchControl.setValue('new search');
    tick(500); 
    fixture.detectChanges();

    // Assert
    expect(searchServiceMock.setSearchTerm).toHaveBeenCalledWith('new search');
    expect(searchServiceMock.getPosts).toHaveBeenCalled();
  }));

  it('should toggle category selection and refresh results', () => {
    // Act
    component.selectCategory('coding');
    fixture.detectChanges();

    // Assert
    expect(component.selectedCategorySlug()).toBe('coding');
    expect(searchServiceMock.getPosts).toHaveBeenCalledWith(
      jasmine.any(Object), 
      jasmine.objectContaining({ categorySlug: 'coding' })
    );

    component.selectCategory('coding');
    fixture.detectChanges();
    expect(component.selectedCategorySlug()).toBeNull();
  });

  it('should append posts instead of replacing when replaceData is false', () => {
    // Arrange
    const initialPost = { id: 1, title: 'Old' } as PostSearchDto;
    const newPost = { id: 2, title: 'New' } as PostSearchDto;
    component.posts.set([initialPost]);
    
    searchServiceMock.getPosts.and.returnValue(of({
      posts: [newPost],
      totalCount: 2, pageNumber: 2, pageSize: 10
    }));

    // Act
    component.getSearchResults(2, false);

    // Assert
    expect(component.posts()).toEqual([initialPost, newPost]);
  });

  it('should set isBackendError to true on service failure', () => {
    // Arrange
    searchServiceMock.getPosts.and.returnValue(throwError(() => new Error('500')));

    // Act
    component.getSearchResults(1, true);
    fixture.detectChanges();

    // Assert
    expect(component.isBackendError()).toBeTrue();
  });

  it('should handle page change and scroll to top if replace is true', fakeAsync(() => {
    // Arrange
    const scrollSpy = spyOn(window, 'scrollTo');
    
    // Act
    component.onPageChanged({ page: 3, replace: true });
    tick();
    fixture.detectChanges();

    // Assert
    expect(scrollSpy as any).toHaveBeenCalledWith(jasmine.objectContaining({ top: 0 }));
    expect(component.currentPage()).toBe(3);
  }));
});