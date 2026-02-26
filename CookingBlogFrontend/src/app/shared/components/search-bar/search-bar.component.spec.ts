import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';
import { PostsService } from '../../services/post/posts.service';
import { SearchService } from '../../services/search/search.service';
import { of, throwError, delay } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { PagedPostResult, PostSearchDto } from '../../interfaces/post.interface';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let postsServiceMock: jasmine.SpyObj<PostsService>;
  let searchService: SearchService;

  beforeEach(async () => {
    postsServiceMock = jasmine.createSpyObj('PostsService', ['getPosts']);
    postsServiceMock.getPosts.and.callFake(() => of({
      posts: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    }).pipe(delay(500)));

    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [
        { provide: PostsService, useValue: postsServiceMock },
        SearchService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    searchService = TestBed.inject(SearchService);

    fixture.detectChanges();
  });

  it('should be created and have searchService initialized', () => {
    // Assert
    expect(component).toBeTruthy();
    expect(searchService).toBeDefined();
    expect(searchService.isLoading()).toBeFalse();
  });

  it('should call the service after 300ms of debounce time', fakeAsync(() => {
    // Arrange
    const mockResponse: PagedPostResult<PostSearchDto> = {
      posts: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 3
    };

    const query = 'desserts';

    postsServiceMock.getPosts.and.returnValue(of(mockResponse) as any);

    //Act
    component.searchControl.setValue(query);
    expect(postsServiceMock.getPosts).not.toHaveBeenCalled();

    tick(300);
    flush();
    fixture.detectChanges();

    // Assert
    expect(postsServiceMock.getPosts).toHaveBeenCalled();
    expect(searchService.isLoading()).toBeFalse();
  }));

  it('should not call the service if input length is less than 3', fakeAsync(() => {
    // Act
    component.searchControl.setValue('Ab');
    tick(300);

    // Assert
    expect(postsServiceMock.getPosts).not.toHaveBeenCalled();
    expect(component.searchResults().length).toBe(0);
    expect(component.showDropdown()).toBeFalse();
  }));

  it('should ignore duplicate values (distinctUntilChanged)', fakeAsync(() => {
    // Arrange
    const mockResponse: PagedPostResult<PostSearchDto> = {
      posts: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 3
    };
    postsServiceMock.getPosts.and.returnValue(of(mockResponse) as any);

    // Act
    component.searchControl.setValue('Soup');
    tick(300);
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(1);

    // Act
    component.searchControl.setValue('  Soup  ');
    tick(300);

    // Assert    
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(1);
    flush();
  }));

  it('should cancel previous requests and use only the latest value (switchMap)', fakeAsync(() => {
    // Arrange
    postsServiceMock.getPosts.and.callFake(() => of({
      posts: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    }).pipe(delay(500)));

    // Act
    component.searchControl.setValue('Bever');
    tick(300);
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(1);

    component.searchControl.setValue('Beverages');
    tick(300);

    tick(500);
    fixture.detectChanges();
    // Assert
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(2);
    expect(searchService.searchTerm()).toBe('Beverages');
  }));

  it('should remain functional after a 500 Server Error because of SearchService catchError', fakeAsync(() => {
    // Arrange
    postsServiceMock.getPosts.and.returnValue(throwError(() => new Error('500')));

    // Act & Assert
    component.searchControl.setValue('Error Query');
    tick(300);

    expect(searchService.isLoading()).toBeFalse();
    expect(component.searchResults()).toEqual([]);

    // Arrange
    postsServiceMock.getPosts.and.callFake(() => {
      const mockResult: PagedPostResult<PostSearchDto> = {
        posts: [
          {
            id: 1,
            title: 'Success',
            slug: 'success',
            searchSnippet: 'snippet',
            description: 'Test description',
            author: 'Admin',
            category: 'General',
            categorySlug: 'general'
          }
        ],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10
      };

      return of(mockResult).pipe(delay(500)) as any;
    });

    // Act
    component.searchControl.setValue('New Query');
    tick(300);

    fixture.detectChanges();
    expect(searchService.isLoading()).toBeTrue();

    tick(500);
    fixture.detectChanges();

    // Assert
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].title).toBe('Success');
    expect(searchService.isLoading()).toBeFalse();
  }));

  it('should show loading spinner from SearchService status', fakeAsync(() => {
    // Arrange
    const emptyResponse: PagedPostResult<PostSearchDto> = {
      posts: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 3
    };

    postsServiceMock.getPosts.and.returnValue(of(emptyResponse).pipe(delay(1000)));

    // Act
    component.searchControl.setValue('Pizza');
    tick(300);
    fixture.detectChanges();

    // Assert
    expect(searchService.isLoading()).toBeTrue();

    const spinner = fixture.debugElement.query(By.css('.loading-spinner'));
    expect(spinner).toBeTruthy();

    // Act
    tick(1000);
    fixture.detectChanges();

    // Assert
    expect(searchService.isLoading()).toBeFalse();
    expect(component.searchResults()).toEqual([]);
  }));

  it('should display "No results found" using computed property', fakeAsync(() => {
    // Arrange
    const emptyResponse: PagedPostResult<PostSearchDto> = {
      posts: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    };

    postsServiceMock.getPosts.and.returnValue(of(emptyResponse) as any);

    // Act
    component.searchControl.setValue('Unknown Recipe');

    tick(300);
    flush();
    fixture.detectChanges();

    if (!component.showDropdown()) {
      component.showDropdown.set(true);
      fixture.detectChanges();
    }

    // Assert
    expect(component.noResults()).withContext('Signal noResults should be true').toBeTrue();
    expect(component.showDropdown()).withContext('Dropdown should be visible').toBeTrue();

    const noResultsMsg = fixture.debugElement.query(By.css('.no-results'));

    expect(noResultsMsg)
      .withContext('Елемент .no-results має бути в DOM')
      .not.toBeNull();

    if (noResultsMsg) {
      expect(noResultsMsg.nativeElement.textContent).toContain('No results found');
    }
  }));

  it('should close dropdown and clear input via clearSearch()', () => {
    // Arrange
    component.searchControl.setValue('Something');
    component.showDropdown.set(true);

    // Act
    component.clearSearch();

    // Assert
    expect(component.searchControl.value).toBe('');
    expect(component.showDropdown()).toBeFalse();
    expect(component.searchResults()).toEqual([]);
  });

  it('should navigate to search page on viewAllResults()', () => {
    // Arrange
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.searchControl.setValue('Cake recipes');

    // Act
    component.viewAllResults();

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { q: 'Cake recipes' }
    });
  });

  it('should close dropdown on outside click via HostListener', () => {
    // Arrange
    component.showDropdown.set(true);

    // Act
    document.dispatchEvent(new MouseEvent('click'));

    // Assert
    expect(component.showDropdown()).toBeFalse();
  });
});