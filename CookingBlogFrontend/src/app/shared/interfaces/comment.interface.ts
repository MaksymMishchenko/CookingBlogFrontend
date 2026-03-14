export interface InfiniteScrollParams {    
    lastId: number | null;
    pageSize: number;
}

export interface CommentDto {
  id: number;
  content: string;
  author: string;
  userId: string;
  parentId: number | null;
  createdAt: string;
  replyToUserName?: string;
  isEditedByAdmin: boolean;
  replies: CommentDto[];
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

export interface CommentCreatedDto {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  userId: string;
  parentId: number | null;
  replies: CommentDto[];
  isEditedByAdmin: boolean;
  replyToUserName?: string;
}

export interface CommentUpdatedDto {
  id: number;
  content: string;
  author: string;
  userId: string;
  createdAt: string;
  isEditedByAdmin: boolean;
}