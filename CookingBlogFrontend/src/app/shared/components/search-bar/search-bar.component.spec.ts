import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';
import { PostsService } from '../../services/post/posts.service';
import { delay, of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let postsServiceMock: any;

  beforeEach(async () => {
    postsServiceMock = {
      getPosts: jasmine.createSpy('getPosts').and.returnValue(of({ posts: [], totalCount: 0 }))
    };

    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [
        { provide: PostsService, useValue: postsServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call the service after 300ms of debounce time', fakeAsync(() => {
    // Arrange
    const query = 'desserts';

    // Act
    component.searchControl.setValue(query);
    expect(postsServiceMock.getPosts).not.toHaveBeenCalled();
    tick(300);

    // Assert
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(1);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should not call the service if input length is less than 3', fakeAsync(() => {
    // Arrange
    const shortQuery = 'Ab';

    // Act
    component.searchControl.setValue(shortQuery);
    tick(300);

    // Assert
    expect(postsServiceMock.getPosts).not.toHaveBeenCalled();
    expect(component.searchResults().length).toBe(0);
    expect(component.showDropdown()).toBeFalse();
  }));

  it('should ignore duplicate values (distinctUntilChanged)', fakeAsync(() => {
    // Arrange
    const query = 'Soup';
    component.searchControl.setValue(query);
    tick(300);
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(1);

    // Act
    component.searchControl.setValue('  Soup  '); 
    tick(300);

    // Assert
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(1);
  }));

  it('should cancel previous requests and use only the latest value (switchMap)', fakeAsync(() => {
    // Arrange
    const firstQuery = 'Bev';
    const secondQuery = 'Beverages';

    // Act
    component.searchControl.setValue(firstQuery);
    tick(100);
    component.searchControl.setValue(secondQuery);
    tick(300);

    // Assert
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(1);
    expect(postsServiceMock.getPosts).toHaveBeenCalledWith(
      jasmine.any(Object),
      jasmine.objectContaining({ searchTerm: secondQuery })
    );
  }));

  it('should remain functional after a 500 Server Error', fakeAsync(() => {
    // Arrange
    postsServiceMock.getPosts.and.returnValue(throwError(() => new Error('Server Error')));
    component.searchControl.setValue('Error Query');
    tick(300);
   
    expect(component.isLoading()).toBeFalse();

    // Act
    postsServiceMock.getPosts.and.returnValue(of({
      posts: [{ title: 'New data' }],
      totalCount: 1
    }));
    component.searchControl.setValue('Valid Query');
    tick(300);
    flush();

    // Assert
    expect(postsServiceMock.getPosts).toHaveBeenCalledTimes(2);
    expect(component.searchResults().length).toBe(1);
  }));

  it('should render search results when data arrives', fakeAsync(() => {
    // Arrange
    const mockData = {
      posts: [
        { title: 'Tomato Soup', slug: 'tomato-soup', searchSnippet: 'Warm <b>tomato</b> soup', category: 'Soups' },
        { title: 'Tomato Salad', slug: 'tomato-salad', searchSnippet: 'Fresh salad', category: 'Salads' }
      ],
      totalCount: 2,
      searchQuery: 'Tomato'
    };
    postsServiceMock.getPosts.and.returnValue(of(mockData));

    // Act
    component.searchControl.setValue('Tomato');
    tick(300);
    fixture.detectChanges();

    // Assert
    const resultItems = fixture.debugElement.queryAll(By.css('.result-item'));
    const firstSnippet = resultItems[0].query(By.css('.result-description')).nativeElement;

    expect(resultItems.length).toBe(2);
    expect(firstSnippet.innerHTML).toContain('<b>tomato</b>');
  }));

  it('should show loading spinner while request is pending', fakeAsync(() => {
    // Arrange
    postsServiceMock.getPosts.and.returnValue(of({ posts: [], totalCount: 0 }).pipe(delay(1000)));

    // Act
    component.searchControl.setValue('Wait for me');
    tick(300);
    fixture.detectChanges();

    // Assert
    const spinner = fixture.debugElement.query(By.css('.spinner'));
    expect(spinner).toBeTruthy();

    tick(1000);
  }));

  it('should display "No results found" message in DOM when empty', fakeAsync(() => {
    // Arrange
    postsServiceMock.getPosts.and.returnValue(of({ posts: [], totalCount: 0 }));

    // Act
    component.searchControl.setValue('Unknown Recipe');
    tick(300);
    fixture.detectChanges();

    // Assert
    const noResultsMsg = fixture.debugElement.query(By.css('.no-results'));
    expect(noResultsMsg).toBeTruthy();
    expect(noResultsMsg.nativeElement.textContent).toContain('No results found');
  }));

  it('should close dropdown and clear input when clearSearch is called', () => {
    // Arrange
    component.searchControl.setValue('Delete me');
    component.showDropdown.set(true);
    fixture.detectChanges();

    // Act
    component.clearSearch();
    fixture.detectChanges();

    // Assert
    const dropdown = fixture.debugElement.query(By.css('.search-dropdown'));
    expect(component.searchControl.value).toBe('');
    expect(component.showDropdown()).toBeFalse();
    expect(dropdown).toBeFalsy();
  });

  it('should close dropdown on outside click', () => {
    // Arrange
    component.showDropdown.set(true);
    fixture.detectChanges();

    // Act
    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    // Assert
    expect(component.showDropdown()).toBeFalse();
  });
  
});