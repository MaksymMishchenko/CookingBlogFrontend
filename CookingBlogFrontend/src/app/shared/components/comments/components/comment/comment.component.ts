import { Component, input, computed, output, inject } from "@angular/core";
import { CommentDto, CommentSubmitEvent } from "../../../../interfaces/comment.interface";
import { ActiveCommentTypeEnum } from "../types/activeCommentType.enum";
import { ActiveCommentInterface } from "../types/active-comment.interface";
import { CommentFormComponent } from "../comment-form/comment-form.component";
import { AuthService } from "../../../../services/auth/auth.service";
import { AUTH_ROLES } from "../../../../../core/constants/auth.constants";

@Component({
  selector: 'comment',
  standalone: true,
  imports: [CommentFormComponent],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})

export class CommentComponent {  
  private authService = inject(AuthService);

  comment = input.required<CommentDto>();
  currentUserId = input<string | null>(null);
  replies = input<CommentDto[]>([]);
  activeComment = input<ActiveCommentInterface | null>();
  parentId = input<number | null>(null);
  setActiveComment = output<ActiveCommentInterface | null>();
  addComment = output<CommentSubmitEvent>();  
  updateComment = output<{ content: string; commentId: number | null }>();
  deleteComment = output<number>();

  activeCommentType = ActiveCommentTypeEnum;    
  
  replyId = computed(() => this.parentId() ? this.parentId() : this.comment().id);

  isAdmin = computed(() => {
    const role = this.authService.getUserRole();
    return role === AUTH_ROLES.ADMIN;
  });

  canEdit = computed(() => {
    if (this.comment().isDeleted) return false;
    const user = this.currentUserId();
    const authorId = this.comment().userId;
    return !!user && user === authorId;
  });

  canDelete = computed(() => {
    if (this.comment().isDeleted) return false;
    const user = this.currentUserId();
    const authorId = this.comment().userId;
    return (!!user && user === authorId) || this.isAdmin();
  });

  canReply = computed(() => {
    if (this.comment().isDeleted) return false;
    return !!this.currentUserId();
  });

  isReplying = computed(() => {
    const active = this.activeComment(); 

    if (!active) return false;

    return (
      active.type === this.activeCommentType.replying &&
      active.id === this.comment().id
    );
  });

  isEditing = computed(() => {
    const active = this.activeComment();
    if (!active) return false;

    return (
      active.type === this.activeCommentType.editing &&
      active.id === this.comment().id
    );
  });
}