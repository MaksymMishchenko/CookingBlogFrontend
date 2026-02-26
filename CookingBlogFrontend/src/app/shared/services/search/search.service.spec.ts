import { of } from "rxjs";
import { PostsService } from "../post/posts.service";
import { SearchService } from "./search.service";
import { TestBed } from "@angular/core/testing";
import { PagedPostResult, PostSearchDto } from "../../interfaces/post.interface";

describe('SearchService', () => {
    let service: SearchService;
    let postsServiceMock: jasmine.SpyObj<PostsService>;

    beforeEach(() => {
        postsServiceMock = jasmine.createSpyObj('PostsService', ['getPosts']);

        TestBed.configureTestingModule({
            providers: [
                SearchService,
                { provide: PostsService, useValue: postsServiceMock }
            ]
        });
        service = TestBed.inject(SearchService);
    });

    it('should trim and limit search term to 100 chars', () => {
        // Act
        service.setSearchTerm('   very long string... '.repeat(10));

        // Assert
        expect(service.searchTerm().length).toBe(100);
        expect(service.searchTerm()).not.toContain('  ');
    });

    it('should map searchSnippet correctly when data is missing', (done) => {
        // Arrange        
        const mockResponse: PagedPostResult<PostSearchDto> = {
            posts: [
                {
                    id: 1,
                    title: 'Test Post',
                    slug: 'test-post',
                    searchSnippet: '', 
                    description: 'Original Description',
                    author: 'Maks',
                    category: 'Tech',
                    categorySlug: 'tech'
                } as PostSearchDto
            ],
            totalCount: 1,
            pageNumber: 1,
            pageSize: 10
        };

        postsServiceMock.getPosts.and.returnValue(of(mockResponse));

        // Act
        service.getPosts({ pageNumber: 1, pageSize: 10 }).subscribe(res => {
            // Assert
            expect(res.posts[0].searchSnippet).toBe('Desc');
            done();
        });
    });

    it('should set isLoading to false after request completes', (done) => {
        // Arrange
        const mockResponse: PagedPostResult<PostSearchDto> = {
            posts: [],
            totalCount: 1,
            pageNumber: 1,
            pageSize: 10
        };

        postsServiceMock.getPosts.and.returnValue(of(mockResponse));

        // Act
        service.getPosts({ pageNumber: 1, pageSize: 10 }).subscribe();

        // Assert    
        expect(service.isLoading()).toBe(false);
        done();
    });
});