export const POST_FORM_LABELS = {
  TITLE: 'Title:',
  DESCRIPTION: 'Description:',
  CONTENT: 'Content:',
  PREVIEW_IMAGE: 'Preview Image:',
  PREVIEW_IMAGE_ALT: 'Image Alt Text:',
  META_TITLE: 'Meta Title:',
  META_DESCRIPTION: 'Meta Description:',
  SLUG: 'Slug:',
  CATEGORY: 'Category:',
  STATUS: 'Post Status:',
  CANCEL: 'Cancel'
} as const;

export const POST_FORM_PLACEHOLDERS = {
  PREVIEW_IMAGE_ALT: 'Short description of the image',
  SLUG: 'example-slug-here',
  SELECT_CATEGORY: '-- Select a category --'
} as const;

export const POST_STATUS_OPTIONS = {
  INACTIVE: 'Inactive (Draft / Hidden)',
  ACTIVE: 'Active (Visible on site)'
} as const;

export const POST_FORM_SUBMIT_LABELS = {
  CREATE: 'Create post',
  EDIT: 'Update post'
} as const;