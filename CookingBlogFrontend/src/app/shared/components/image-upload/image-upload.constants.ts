export const IMAGE_UPLOAD_TEXTS = {
  DROP_PREFIX: 'Drag & drop image here or',
  BROWSE: 'browse',
  SUPPORTED_HINT: 'Supports: JPG, PNG, WEBP',
  MAX_SIZE_HINT: (mb: number) => `Max file size: ${mb}MB`,
  PREVIEW_ALT: 'Preview',
  REMOVE: 'Remove',
  REMOVE_TITLE: 'Remove image'
} as const;

export const IMAGE_UPLOAD_ERRORS = {
  MAX_SIZE: (mb: number) => `File size exceeds the maximum allowed limit of ${mb}MB.`,
  INVALID_TYPE: (types: string) => `Invalid file format. Supports: ${types}.`
} as const;