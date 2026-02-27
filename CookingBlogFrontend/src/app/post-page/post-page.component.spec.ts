import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PostPageComponent } from './post-page.component';
import { PostsService } from '../shared/services/post/posts.service';
import { of } from 'rxjs';
import { ComponentRef } from '@angular/core';

describe('PostPageComponent', () => {
    let component: PostPageComponent;
    let fixture: ComponentFixture<PostPageComponent>;
    let postsServiceMock: any;

    const mockPost = {
        title: 'Delicious Pizza',
        content: 'Dough recipe...',
        author: 'Maks',
        createdAt: new Date(),
        commentCount: 5
    };

    beforeEach(async () => {
        postsServiceMock = {
            getPostBySlug: jasmine.createSpy('getPostBySlug').and.returnValue(of(mockPost))
        };

        await TestBed.configureTestingModule({
            imports: [PostPageComponent],
            providers: [
                { provide: PostsService, useValue: postsServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PostPageComponent);
        component = fixture.componentInstance;
    });

    it('should fetch post by slugs from the URL', fakeAsync(() => {
        const componentRef = fixture.componentRef as ComponentRef<PostPageComponent>;

        componentRef.setInput('categorySlug', 'cooking');
        componentRef.setInput('postSlug', 'pizza-recipe');
        fixture.detectChanges();

        tick();
        fixture.detectChanges();

        expect(postsServiceMock.getPostBySlug).toHaveBeenCalledWith('cooking', 'pizza-recipe');

        const compiled = fixture.nativeElement as HTMLElement;
        const h2Text = compiled.querySelector('h2')?.textContent;

        expect(h2Text).toContain('Delicious Pizza');
    }));

    it('should display the loader during data fetching', () => {
        const componentRef = fixture.componentRef as ComponentRef<PostPageComponent>;
        componentRef.setInput('categorySlug', 'test');
        componentRef.setInput('postSlug', 'test');

        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.loader')).toBeTruthy();
        expect(compiled.textContent).toContain('Loading post...');
    });
});