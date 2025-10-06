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
})