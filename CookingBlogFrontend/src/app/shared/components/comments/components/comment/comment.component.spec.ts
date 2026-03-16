import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommentComponent } from "./comment.component";
import { ActiveCommentTypeEnum } from "../types/activeCommentType.enum";

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const mockComment = { 
    id: 1, 
    author: 'Author', 
    content: 'Text', 
    userId: 'user-1', 
    createdAt: new Date().toISOString() 
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CommentComponent] });
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  describe('Permissions (canEdit / canDelete)', () => {
    it('should allow edit if user is author and time has not passed', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-1');
      expect(component.canEdit()).toBeTrue();
    });

    it('should NOT allow edit if user is not author', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-99');
      expect(component.canEdit()).toBeFalse();
    });

    it('should NOT allow edit if 5 minutes have passed', () => {
      const oldDate = new Date();
      oldDate.setMinutes(oldDate.getMinutes() - 6); 
      
      fixture.componentRef.setInput('comment', { ...mockComment, createdAt: oldDate.toISOString() });
      fixture.componentRef.setInput('currentUserId', 'user-1');
      
      expect(component.canEdit()).toBeFalse();
    });

    it('should handle createdAt without Z suffix correctly', () => {      
      const noZoneDate = '2024-01-01T10:00:00'; 
      fixture.componentRef.setInput('comment', { ...mockComment, createdAt: noZoneDate });
      fixture.componentRef.setInput('currentUserId', 'user-1');
            
      expect(component.canEdit()).toBeFalse();
    });

    it('should NOT allow delete if there are replies', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('currentUserId', 'user-1');
      fixture.componentRef.setInput('replies', [{ id: 2, parentId: 1 }]);
      
      expect(component.canDelete()).toBeFalse();
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
});