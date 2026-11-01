export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  MIN_LENGTH: (n: number) => `Min ${n} characters.`,
  MAX_LENGTH: (n: number) => `Max ${n} characters.`,
  SLUG_PATTERN: 'Only lowercase letters, numbers, and hyphens are allowed.'
} as const;