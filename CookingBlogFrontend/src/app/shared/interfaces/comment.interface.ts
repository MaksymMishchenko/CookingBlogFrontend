export interface InfiniteScrollParams {
  lastId: number | null;
  pageSize: number;
}

export interface CommentBase {
  id: number;
  content: string;
  author: string;
  userId: string;
  createdAt: string;
}

export interface CommentDto extends CommentBase {
  parentId: number | null;
  replies: CommentDto[];
  replyToUserName?: string;
  isDeleted?: boolean;
}

export interface CommentScrollResult {
  comments: CommentDto[];
  lastId: number | null;
  hasNextPage: boolean;
  totalCount: number;
}

export interface CommentScrollResponse<T> {
  data: T[];
  lastId: number | null;
  hasNextPage: boolean;
  totalCount: number;
}

export interface CommentSubmitEvent {
  content: string;
  parentId?: number | null;
  replyToName?: string | null;
}

export interface CommentCreatedDto extends CommentBase {
  parentId: number | null;
  replies: CommentDto[];
  replyToUserName?: string;
}

export interface CommentUpdatedDto extends CommentBase { }

export interface CommentDeletedDto extends CommentBase {
  parentId: number | null;
  isDeleted: boolean;
  replies: CommentDto[];
  replyToUserName?: string;
}