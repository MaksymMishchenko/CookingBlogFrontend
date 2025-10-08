import { EMPTY, of } from "rxjs";
import { PostsService } from "../../posts.service"
import { PostComponent } from "./post.component";
import { fakePosts } from "../posts.fixtures";


describe('Post Component', () => {
    let component: PostComponent;
    let service: PostsService;

    beforeEach(() => {
        service = new PostsService(null!);
        component = new PostComponent(service);
    })

    it('should call getPosts on initialization', () => {
        const spy = spyOn(service, 'getPosts').and.callFake(() => {
            return EMPTY;
        })

        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should set posts length after ngOnInit', () => {        
        spyOn(service, 'getPosts').and.returnValue(of(fakePosts));

        component.ngOnInit();
        expect(component.posts.length).toBe(fakePosts.length);
    });

    it('should verify the number of comments for a specific post', () => {        
        spyOn(service, 'getPosts').and.returnValue(of(fakePosts));

        component.ngOnInit();

        const firstPostComments = component.posts[0].comments;
        expect(firstPostComments.length).toBe(1);
    });

    it('should check the author of the first comment on the second post', () => {
        spyOn(service, 'getPosts').and.returnValue(of(fakePosts));

        component.ngOnInit();

        const firstcommentAuthor = component.posts[1].comments[0].author;
        expect(firstcommentAuthor).toBe('Anna');
    })
})