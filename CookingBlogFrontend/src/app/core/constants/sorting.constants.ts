import { PostSortField, SortDirection } from '../../shared/interfaces/post.interface';

export const SORT_DIRECTIONS = {
  ASC: 'asc' as SortDirection,
  DESC: 'desc' as SortDirection,
} as const;

export const POST_SORT_FIELDS = {
  TITLE: 'title' as PostSortField,
  CREATED_AT: 'createdAt' as PostSortField,
} as const;