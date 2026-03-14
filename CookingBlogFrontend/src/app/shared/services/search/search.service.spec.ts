import { of, throwError } from "rxjs";
import { PostsService } from "../post/posts.service";
import { SearchService } from "./search.service";
import { TestBed } from "@angular/core/testing";
import { PagedResult, PostSearchDto } from "../../interfaces/post.interface";

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

    it('should trim edges and limit search term to 100 chars', () => {
        // Arrange
        const longInput = '   ' + 'a'.repeat(120) + '   ';

        // Act
        service.setSearchTerm(longInput);

        // Assert
        const result = service.searchTerm();

        expect(result.length).toBe(100);
        expect(result.startsWith(' ')).toBeFalse();
    });

    it('should map searchSnippet correctly when data is missing', (done) => {
        // Arrange        
        const mockResponse: PagedResult<PostSearchDto> = {
            items: [
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
            expect(res.items[0].searchSnippet).toBe('Original Description');
            done();
        });
    });

    it('should set isLoading to false after request completes', (done) => {
        // Arrange
        const mockResponse: PagedResult<PostSearchDto> = {
            items: [],
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

    it('should handle error and stop loading', (done) => {
        postsServiceMock.getPosts.and.returnValue(throwError(() => new Error('API Down')));

        service.getPosts({ pageNumber: 1, pageSize: 10 }).subscribe(res => {
            expect(res.items).toEqual([]);
            expect(service.isLoading()).toBeFalse();
            done();
        });
    });
});