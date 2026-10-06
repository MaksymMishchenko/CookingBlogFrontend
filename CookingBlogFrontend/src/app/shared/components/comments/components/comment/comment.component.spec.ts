import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommentComponent } from "./comment.component";
import { ActiveCommentTypeEnum } from "../types/activeCommentType.enum";
import { AuthService } from "../../../../services/auth/auth.service";
import { AUTH_ROLES } from "../../../../../core/constants/auth.constants";

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockComment = {
    id: 1,
    author: 'Author',
    content: 'Text',
    userId: 'user-1',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    authServiceSpy.getUserRole.and.returnValue('User');

    TestBed.configureTestingModule({
      imports: [CommentComponent],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpy
        }
      ]
    });

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  describe('Permissions (canEdit / canDelete / canReply)', () => {
    it('should allow edit if user is author and comment is not deleted', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-1');
      expect(component.canEdit()).toBeTrue();
    });

    it('should NOT allow edit if user is not author', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-99');
      expect(component.canEdit()).toBeFalse();
    });

    it('should NOT allow edit if comment is deleted, even if user is the author', () => {
      const deletedComment = { ...mockComment, isDeleted: true };

      fixture.componentRef.setInput('comment', deletedComment);
      fixture.componentRef.setInput('currentUserId', 'user-1');

      expect(component.canEdit()).toBeFalse();
    });

    it('should allow delete if user is author and comment is not deleted', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-1');
      expect(component.canDelete()).toBeTrue();
    });

    it('should allow delete if user is NOT author but IS an Admin', () => {
      authServiceSpy.getUserRole.and.returnValue(AUTH_ROLES.ADMIN);

      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-99');

      expect(component.canDelete()).toBeTrue();
    });

    it('should NOT allow delete if comment is deleted, even for Admin', () => {
      authServiceSpy.getUserRole.and.returnValue(AUTH_ROLES.ADMIN);
      const deletedComment = { ...mockComment, isDeleted: true };

      fixture.componentRef.setInput('comment', deletedComment);
      fixture.componentRef.setInput('currentUserId', 'user-99');

      expect(component.canDelete()).toBeFalse();
    });

    it('should allow reply if user is logged in and comment is not deleted', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-2');
      expect(component.canReply()).toBeTrue();
    });

    it('should NOT allow reply if comment is deleted', () => {
      const deletedComment = { ...mockComment, isDeleted: true };

      fixture.componentRef.setInput('comment', deletedComment);
      fixture.componentRef.setInput('currentUserId', 'user-2');

      expect(component.canReply()).toBeFalse();
    });
  });

  describe('Active States', () => {
    it('should correctly identify isReplying state', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('activeComment', {
        id: 1,
        type: ActiveCommentTypeEnum.replying
      });

      expect(component.isReplying()).toBeTrue();
      expect(component.isEditing()).toBeFalse();
    });

    it('should correctly identify isEditing state', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('activeComment', {
        id: 1,
        type: ActiveCommentTypeEnum.editing
      });

      expect(component.isEditing()).toBeTrue();
      expect(component.isReplying()).toBeFalse();
    });
  });

  describe('computed values', () => {
    it('should calculate replyId correctly for parent comment', () => {
      fixture.componentRef.setInput('comment', { id: 10 } as any);
      fixture.componentRef.setInput('parentId', null);
      expect(component.replyId()).toBe(10);
    });

    it('should use parentId as replyId if it is a sub-comment', () => {
      fixture.componentRef.setInput('comment', { id: 10 } as any);
      fixture.componentRef.setInput('parentId', 5);
      expect(component.replyId()).toBe(5);
    });
  });

  describe('Action Methods (onReplyClick, onEditClick)', () => {
    it('should emit setActiveComment with replying type on onReplyClick', () => {
      fixture.componentRef.setInput('comment', mockComment);
      spyOn(component.setActiveComment, 'emit');

      component.onReplyClick();

      expect(component.setActiveComment.emit).toHaveBeenCalledWith({
        id: mockComment.id,
        type: ActiveCommentTypeEnum.replying
      });
    });

    it('should emit setActiveComment with editing type on onEditClick', () => {
      fixture.componentRef.setInput('comment', mockComment);
      spyOn(component.setActiveComment, 'emit');

      component.onEditClick();

      expect(component.setActiveComment.emit).toHaveBeenCalledWith({
        id: mockComment.id,
        type: ActiveCommentTypeEnum.editing
      });
    });
  });

  describe('Delete actions & Admin Modal', () => {
    it('should emit deleteComment immediately when regular user triggers deletion', () => {
      authServiceSpy.getUserRole.and.returnValue('USER');
      fixture.componentRef.setInput('comment', mockComment);

      spyOn(component.deleteComment, 'emit');

      component.onDeleteClick();

      expect(component.isDeleteModalOpen()).toBeFalse();
      expect(component.deleteComment.emit).toHaveBeenCalledWith(mockComment.id);
    });

    it('should open delete modal instead of immediate emit when ADMIN triggers deletion', () => {
      authServiceSpy.getUserRole.and.returnValue(AUTH_ROLES.ADMIN);
      fixture.componentRef.setInput('comment', mockComment);

      spyOn(component.deleteComment, 'emit');

      component.onDeleteClick();

      expect(component.isDeleteModalOpen()).toBeTrue();
      expect(component.deleteComment.emit).not.toHaveBeenCalled();
    });

    it('should emit deleteComment and close modal when admin confirms deletion', () => {
      authServiceSpy.getUserRole.and.returnValue(AUTH_ROLES.ADMIN);
      fixture.componentRef.setInput('comment', mockComment);
      component.isDeleteModalOpen.set(true);

      spyOn(component.deleteComment, 'emit');

      component.onConfirmDelete();

      expect(component.isDeleteModalOpen()).toBeFalse();
      expect(component.deleteComment.emit).toHaveBeenCalledWith(mockComment.id);
    });

    it('should close modal without emitting deleteComment when admin cancels', () => {
      authServiceSpy.getUserRole.and.returnValue(AUTH_ROLES.ADMIN);
      fixture.componentRef.setInput('comment', mockComment);
      component.isDeleteModalOpen.set(true);

      spyOn(component.deleteComment, 'emit');

      component.onCancelDelete();

      expect(component.isDeleteModalOpen()).toBeFalse();
      expect(component.deleteComment.emit).not.toHaveBeenCalled();
    });
  });

});