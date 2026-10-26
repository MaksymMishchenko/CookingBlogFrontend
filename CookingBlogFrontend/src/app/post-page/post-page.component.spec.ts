import { Component, ComponentRef, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';

import { PostPageComponent } from './post-page.component';
import { PublicPostsService } from '../shared/services/post/public-post.service';
import { AuthService } from '../shared/services/auth/auth.service';
import { PostDetailDto } from '../shared/interfaces/post.interface';
import { UI_ERROR_MESSAGES } from '../core/constants/ui-messages.constants';

@Component({ selector: 'comments', standalone: true, template: '' })
class CommentsStubComponent {
  currentUserId = input<unknown>();
  postId = input<number>();
  totalCountChange = output<number>();
}

describe('PostPageComponent', () => {
  let component: PostPageComponent;
  let fixture: ComponentFixture<PostPageComponent>;
  let ref: ComponentRef<PostPageComponent>;
  let postsServiceMock: { getPostBySlug: jasmine.Spy };
  
  const mockPost: PostDetailDto = {
    id: 1,
    title: 'Delicious Pizza',
    content: '<p>Dough recipe...</p>',
    author: 'Maks',
    previewImageUrl: '/images/img.jpeg',
    previewImageAlt: 'Pizza photo',
    slug: 'pizza-recipe',
    metaTitle: 'Delicious Pizza',
    metaDescription: 'Dough recipe description',
    categoryName: 'Cooking',
    categorySlug: 'cooking',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
    commentCount: 5
  } as PostDetailDto;

  beforeEach(async () => {
    postsServiceMock = {
      getPostBySlug: jasmine.createSpy('getPostBySlug').and.returnValue(of(mockPost))
    };

    await TestBed.configureTestingModule({
      imports: [PostPageComponent],
      providers: [
        { provide: PublicPostsService, useValue: postsServiceMock },        
        { provide: AuthService, useValue: { userIdSignal: signal('test-user-id') } }
      ]
    })      
      .overrideComponent(PostPageComponent, {
        set: { imports: [DatePipe, CommentsStubComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PostPageComponent);
    component = fixture.componentInstance;
    ref = fixture.componentRef;
  });
 
  async function render(cat = 'cooking', post = 'pizza-recipe') {
    ref.setInput('categorySlug', cat);
    ref.setInput('postSlug', post);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;  

  it('should fetch post by slugs from the URL and render the title', async () => {
    await render();

    expect(postsServiceMock.getPostBySlug).toHaveBeenCalledWith('cooking', 'pizza-recipe');
    expect(el().querySelector('h2')?.textContent).toContain('Delicious Pizza');
  });
  
  it('should display the loader skeleton while the request is in flight', async () => {
    const response$ = new Subject<PostDetailDto>();
    postsServiceMock.getPostBySlug.and.returnValue(response$);

    await render();
    expect(el().querySelector('.skeleton-post')).toBeTruthy();
    expect(component.viewState()).toBe('loading');

    response$.next(mockPost);
    response$.complete();
    fixture.detectChanges();

    expect(el().querySelector('.skeleton-post')).toBeFalsy();
    expect(component.viewState()).toBe('data');
  });
  
  it('should not fetch when slugs are empty and stay in loading state', async () => {
    await render('', '');

    expect(postsServiceMock.getPostBySlug).not.toHaveBeenCalled();
    expect(component.viewState()).toBe('loading');
  });  

  it('should display error state with message when getPostBySlug fails', async () => {
    postsServiceMock.getPostBySlug.and.returnValue(throwError(() => new Error('Server error')));

    await render();

    expect(component.viewState()).toBe('error');
    expect(el().querySelector('.state-card')).toBeTruthy();
    expect(el().querySelector('.retry-btn')).toBeTruthy();    
    expect(el().querySelector('.error-text')?.textContent)
      .toContain(UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('post'));
  });

  it('should display empty state with message when post is null', async () => {
    postsServiceMock.getPostBySlug.and.returnValue(of(null));

    await render('cooking', 'non-existent');

    expect(component.viewState()).toBe('empty');
    expect(el().querySelector('.empty-text')?.textContent)
      .toContain(UI_ERROR_MESSAGES.DYNAMIC.EMPTY('post'));
  });
  
  it('should refetch and show the post after clicking "Try again"', async () => {
    postsServiceMock.getPostBySlug.and.returnValues(
      throwError(() => new Error('Server error')),
      of(mockPost)
    );
    await render();
    expect(component.viewState()).toBe('error');

    (el().querySelector('.retry-btn') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(postsServiceMock.getPostBySlug).toHaveBeenCalledTimes(2);
    expect(component.viewState()).toBe('data');
    expect(el().querySelector('.state-card')).toBeFalsy();
  });
  
  it('should render post details, image and html content', async () => {
    await render();

    const text = el().textContent!;
    expect(text).toContain('Author: Maks');
    expect(text).toContain('Jan 1, 2024');
    expect(text).toContain('Comments: 5');

    const img = el().querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/images/img.jpeg');
    expect(img.getAttribute('alt')).toBe('Pizza photo');

    expect(el().querySelector('.ql-editor p')?.textContent).toBe('Dough recipe...');
  });
  
  it('should pass postId and current user id to the comments component', async () => {
    await render();

    const comments = fixture.debugElement.query(By.directive(CommentsStubComponent))
      .componentInstance as CommentsStubComponent;
    expect(comments.postId()).toBe(1);
    expect(comments.currentUserId()).toBe('test-user-id');
  });

  it('should initialize commentCount from fetched post via effect', async () => {
    await render();

    expect(component.commentCount()).toBe(5);
  });
 
  it('should update commentCount when comments emits totalCountChange', async () => {
    await render();
    const comments = fixture.debugElement.query(By.directive(CommentsStubComponent))
      .componentInstance as CommentsStubComponent;

    comments.totalCountChange.emit(1);
    fixture.detectChanges();
    expect(component.commentCount()).toBe(6);
    expect(el().textContent).toContain('Comments: 6');

    comments.totalCountChange.emit(-1);
    fixture.detectChanges();
    expect(component.commentCount()).toBe(5);
  });

  it('should update commentCount when handleCountChange is called', () => {
    component.commentCount.set(5);

    component.handleCountChange(1);
    expect(component.commentCount()).toBe(6);

    component.handleCountChange(-1);
    expect(component.commentCount()).toBe(5);
  });  

  it('should re-fetch post when slug inputs change', async () => {
    await render('cat1', 'post1');

    ref.setInput('postSlug', 'post2');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(postsServiceMock.getPostBySlug).toHaveBeenCalledWith('cat1', 'post2');
    expect(postsServiceMock.getPostBySlug).toHaveBeenCalledTimes(2);
  });
 
  it('should reset commentCount from the newly fetched post', async () => {
    await render('cat1', 'post1');
    component.handleCountChange(3);
    expect(component.commentCount()).toBe(8);

    postsServiceMock.getPostBySlug.and.returnValue(of({ ...mockPost, id: 2, commentCount: 1 }));
    ref.setInput('postSlug', 'post2');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.commentCount()).toBe(1);
  });
});