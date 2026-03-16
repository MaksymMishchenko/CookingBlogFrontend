import { Component, computed, effect, inject, input, OnInit, output, signal, untracked } from "@angular/core";
import { CommentService } from "../../../../services/comment/comment.service";
import { CommentDto, CommentSubmitEvent } from "../../../../interfaces/comment.interface";
import { CommentComponent } from "../comment/comment.component";
import { CommentFormComponent } from "../comment-form/comment-form.component";
import { ObserveVisibilityDirective } from "../../../../directives/visibility/observe-visibility.directives";
import { AuthService } from "../../../../services/auth/auth.service";
import { LoginFormComponent } from "../login-form/login-form.component";
import { ActiveCommentInterface } from "../types/active-comment.interface";
import { USER_MESSAGES } from "../../../../services/error/error.constants";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'comments',
    standalone: true,
    imports: [CommentComponent, CommentFormComponent, LoginFormComponent, ObserveVisibilityDirective],
    templateUrl: './comments.component.html',
    styleUrl: './comments.component.scss'
})

export class CommentsComponent implements OnInit {
    private commentService = inject(CommentService);
    authService = inject(AuthService);

    comments = signal<CommentDto[]>([]);
    isLoading = signal(false);
    lastId = signal<number | null>(null);
    hasNextPage = signal(false);
    totalCountChange = output<number>()

    postId = input.required<number>();
    currentUserId = input<string | null>(null);

    activeComment = signal<ActiveCommentInterface | null>(null);
    commentError = signal<string | null>(null);    

    protected readonly MESSAGES = USER_MESSAGES.NO_COMMENTS_YET;

    rootComments = computed(() =>
        this.comments().filter(c => c.parentId === null || c.parentId === undefined)
    );

    constructor() {        
        effect(() => {
            const isAuth = this.authService.isAuthenticated();

            if (!isAuth) {
                untracked(() => {
                    this.activeComment.set(null);                    
                });
            }
        });
    }

    ngOnInit() {
        this.loadComments();
    }

    loadComments() {
        if (this.isLoading()) return;

        this.isLoading.set(true);
        this.commentError.set(null);

        this.commentService.getComments(this.postId(), {
            pageSize: 5,
            lastId: this.lastId()
        }).subscribe({
            next: (result) => {
                this.comments.update(old => [...old, ...result.comments]);
                this.lastId.set(result.lastId);
                this.hasNextPage.set(result.hasNextPage);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.handleCommentError(err, USER_MESSAGES.LOAD_COMMENTS_FAILED)
            }
        });
    }

    onScroll() {
        if (this.hasNextPage() && !this.isLoading()) {
            this.loadComments();
        }
    }

    addComment(comment: CommentSubmitEvent): void {

        this.commentError.set(null);

        const mention = comment.replyToName ? `<b>${comment.replyToName}</b>, ` : '';
        const finalContent = `${mention}${comment.content}`;

        const payload = {
            content: finalContent,
            parentId: comment.parentId
        };

        if (this.authService.isAuthenticated()) {
            this.commentService.createComment(this.postId(), payload).subscribe({
                next: (createdComment) => {
                    this.comments.update(old => [createdComment, ...old]);
                    this.totalCountChange.emit(1);
                    this.activeComment.set(null);
                },
                error: (err) => {
                    this.handleCommentError(err);
                }
            });
        }
    }

    updateComment({ content, commentId }: { content: string; commentId: number | null }) {
        if (!commentId) return;        

        this.commentService.updateComment(commentId, content).subscribe({
            next: (updatedComment) => {
                this.comments.update(all =>
                    all.map(c => c.id === updatedComment.id ? { ...c, ...updatedComment } : c)
                );
                this.activeComment.set(null);
            },
            error: (err) => {
                this.handleCommentError(err);
            }
        });
    }

    deleteComment(commentId: number): void {
        this.commentService.deleteComment(commentId).subscribe({
            next: () => {
                this.comments.update(allComments =>
                    allComments.filter(c => c.id !== commentId)
                );

                this.totalCountChange.emit(-1);

                if (this.activeComment()?.id === commentId) {
                    this.activeComment.set(null);
                }
            },
            error: (err) => {
                this.handleCommentError(err);
            }
        });
    }

    private handleCommentError(err: HttpErrorResponse, customMessage?: string) {       

        if (err.status === 401){
             this.commentError.set(USER_MESSAGES.SESSION_EXPIRED_COMMENT);
            return;
        }

        if (err.status === 400 || err.status === 409) {
            const message = err.error?.message || USER_MESSAGES.ACTION_FAILED;
            this.commentError.set(message);
            return;
        }

        if (customMessage) {
            this.commentError.set(customMessage);
            return;
        }

        this.commentError.set(USER_MESSAGES.UNKNOWN_ERROR);
    }

    getReplies(commentId: number): CommentDto[] {
        return this.comments().filter(c => c.parentId === commentId)
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            );
    }

    setActiveComment(activeComment: ActiveCommentInterface | null): void {
        this.activeComment.set(activeComment);
    }

    clearErrors() {
        this.commentError.set(null);        
    }
}