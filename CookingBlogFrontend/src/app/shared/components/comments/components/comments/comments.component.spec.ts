import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommentsComponent } from "./comments.component";
import { CommentService } from "../../../../services/comment/comment.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { of, throwError } from "rxjs";
import { CommentCreatedDto } from "../../../../interfaces/comment.interface";
import { USER_MESSAGES } from "../../../../services/error/error.constants";
import { HttpErrorResponse } from "@angular/common/http";

describe('CommentsComponent', () => {
    let component: CommentsComponent;
    let fixture: ComponentFixture<CommentsComponent>;
    let commentServiceSpy: jasmine.SpyObj<CommentService>;

    beforeEach(() => {
        commentServiceSpy = jasmine.createSpyObj('CommentService', ['getComments', 'createComment', 'deleteComment']);
        commentServiceSpy.getComments.and.returnValue(of({ comments: [], lastId: null, hasNextPage: false, totalCount: 0 }));

        TestBed.configureTestingModule({
            imports: [CommentsComponent],
            providers: [
                { provide: CommentService, useValue: commentServiceSpy },
                { provide: AuthService, useValue: { isAuthenticated: () => true } }
            ]
        });

        fixture = TestBed.createComponent(CommentsComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('postId', 123);
        fixture.detectChanges();
    });

    it('should load comments on init', () => {
        expect(commentServiceSpy.getComments).toHaveBeenCalledWith(123, jasmine.any(Object));
    });

    it('should update signal when a new comment is added', () => {
        const newComment: CommentCreatedDto = {
            id: 99,
            author: 'Admin',
            content: 'New content',
            createdAt: new Date().toISOString(),
            userId: 'user-123',
            parentId: null,
            replies: [],
            replyToUserName: 'Nick'
        };

        commentServiceSpy.createComment.and.returnValue(of(newComment));

        component.addComment({ content: 'New', parentId: null });

        expect(component.comments()).toContain(jasmine.objectContaining({ id: 99 }));
    });

    it('should load next page on scroll if hasNextPage is true', () => {        
        component.hasNextPage.set(true);
        component.lastId.set(10);

        component.onScroll();

        expect(commentServiceSpy.getComments).toHaveBeenCalledWith(123, jasmine.objectContaining({
            lastId: 10
        }));
    });

    it('should delete comment and emit totalCountChange', () => {        
        component.comments.set([{ id: 1, content: 'To delete', createdAt: '', author: '', userId: '' } as any]);
        commentServiceSpy.deleteComment.and.returnValue(of({}));
        spyOn(component.totalCountChange, 'emit');

        component.deleteComment(1);

        expect(component.comments().length).toBe(0);
        expect(component.totalCountChange.emit).toHaveBeenCalledWith(-1);
    });

    it('should handle 401 error correctly', () => {
        const errorResponse = new HttpErrorResponse({ status: 401 });
        commentServiceSpy.createComment.and.returnValue(throwError(() => errorResponse));

        component.addComment({ content: 'Test', parentId: null });

        expect(component.commentError()).toBe(USER_MESSAGES.SESSION_EXPIRED_COMMENT);
    });

    it('should filter root comments correctly', () => {
        component.comments.set([
            { id: 1, parentId: null } as any,
            { id: 2, parentId: 1 } as any
        ]);
       
        expect(component.rootComments().length).toBe(1);
        expect(component.rootComments()[0].id).toBe(1);
    });
});