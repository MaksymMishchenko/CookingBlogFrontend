import { Component, input, computed, output } from "@angular/core";
import { CommentDto, CommentSubmitEvent } from "../../../../interfaces/comment.interface";
import { ActiveCommentTypeEnum } from "../types/activeCommentType.enum";
import { ActiveCommentInterface } from "../types/active-comment.interface";
import { CommentFormComponent } from "../comment-form/comment-form.component";

@Component({
  selector: 'comment',
  standalone: true,
  imports: [CommentFormComponent],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})

export class CommentComponent {  
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

  private readonly fiveMinutes = 300000;

  private timePassed = computed(() => {
    const createdAtStr = this.comment().createdAt;

    const dateWithZone = createdAtStr.endsWith('Z') ? createdAtStr : `${createdAtStr}Z`;

    const createdDate = new Date(dateWithZone).getTime();
    const now = new Date().getTime();

    const diff = now - createdDate;

    return diff > this.fiveMinutes;
  });

  replyId = computed(() => this.parentId() ? this.parentId() : this.comment().id);

  canEdit = computed(() => {
    const user = this.currentUserId();
    const authorId = this.comment().userId;
    return !!user && user === authorId && !this.timePassed();
  });

  canDelete = computed(() => {
    const user = this.currentUserId();
    const authorId = this.comment().userId;
    return !!user && user === authorId && !this.timePassed() && this.replies().length === 0;
  });

  canReply = computed(() => !!this.currentUserId());

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