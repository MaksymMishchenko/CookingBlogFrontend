import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommentsComponent } from "./comments.component";
import { CommentService } from "../../../../services/comment/comment.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { of, throwError } from "rxjs";
import { CommentCreatedDto, CommentDeletedDto, CommentDto } from "../../../../interfaces/comment.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { BaseResponse } from "../../../../interfaces/global.interface";
import { UI_ERROR_MESSAGES } from "../../../../../core/constants/ui-messages.constants";
import { signal } from "@angular/core";

describe('CommentsComponent', () => {
    let component: CommentsComponent;
    let fixture: ComponentFixture<CommentsComponent>;
    let commentServiceSpy: jasmine.SpyObj<CommentService>;
    let authSignal: ReturnType<typeof signal<boolean>>;

    beforeEach(() => {
        authSignal = signal(true);

        commentServiceSpy = jasmine.createSpyObj('CommentService', [
            'getComments', 'createComment', 'updateComment', 'deleteComment'
        ]);
        commentServiceSpy.getComments.and.returnValue(of({ comments: [], lastId: null, hasNextPage: false, totalCount: 0 }));

        TestBed.configureTestingModule({
            imports: [CommentsComponent],
            providers: [
                { provide: CommentService, useValue: commentServiceSpy },
                {
                    provide: AuthService,
                    useValue: { isAuthenticated: authSignal }
                }
            ]
        });

        fixture = TestBed.createComponent(CommentsComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('postId', 123);
        fixture.detectChanges();
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

    it('should hard delete comment and emit totalCountChange when not soft deleted', () => {
        // Arrange
        component.comments.set([{ id: 1, content: 'To delete', createdAt: '', author: '', userId: '' } as any]);

        const mockResponse: BaseResponse = {
            success: true,
            message: 'Comment deleted'
        };

        commentServiceSpy.deleteComment.and.returnValue(of(mockResponse as any));
        spyOn(component.totalCountChange, 'emit');

        // Act
        component.deleteComment(1);

        // Assert
        expect(component.comments().length).toBe(0);
        expect(component.totalCountChange.emit).toHaveBeenCalledWith(-1);
    });

    it('should soft delete comment (update in place) without decreasing total count when isDeleted is true', () => {
        // Arrange
        const initialComment: CommentDto = {
            id: 1,
            content: 'Original',
            isDeleted: false,
            author: 'User',
            userId: 'user-1',
            parentId: null,
            createdAt: new Date().toISOString(),
            replies: []
        };
        component.comments.set([initialComment]);

        const softDeletedResponse: CommentDeletedDto = {
            id: 1,
            content: 'Deleted by admin',
            author: 'Admin',
            userId: 'admin-1',
            parentId: null,
            createdAt: new Date().toISOString(),
            isDeleted: true,
            replies: []
        };

        commentServiceSpy.deleteComment.and.returnValue(of(softDeletedResponse));
        spyOn(component.totalCountChange, 'emit');

        // Act
        component.deleteComment(1);

        // Assert
        expect(component.comments().length).toBe(1);
        expect(component.comments()[0].isDeleted).toBeTrue();
        expect(component.comments()[0].content).toBe('Deleted by admin');
        expect(component.totalCountChange.emit).not.toHaveBeenCalled();
    });

    it('should handle 401 error correctly', () => {
        const errorResponse = new HttpErrorResponse({ status: 401 });
        commentServiceSpy.createComment.and.returnValue(throwError(() => errorResponse));

        component.addComment({ content: 'Test', parentId: null });

        expect(component.commentError()).toBe(UI_ERROR_MESSAGES.COMMENTS.SESSION_EXPIRED_COMMENT);
    });

    it('should filter root comments correctly', () => {
        component.comments.set([
            { id: 1, parentId: null } as any,
            { id: 2, parentId: 1 } as any
        ]);

        expect(component.rootComments().length).toBe(1);
        expect(component.rootComments()[0].id).toBe(1);
    });

    it('should clear errors', () => {
        component.commentError.set('Some error');
        component.clearErrors();
        expect(component.commentError()).toBeNull();
    });

    it('should reset activeComment if user becomes unauthenticated via effect', () => {
        authSignal.set(true);
        fixture.detectChanges();

        component.activeComment.set({ id: 1, text: 'reply' } as any);
        expect(component.activeComment()).not.toBeNull();

        authSignal.set(false);
        fixture.detectChanges();

        expect(component.activeComment()).toBeNull();
    });
});