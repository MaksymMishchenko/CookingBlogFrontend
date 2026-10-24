import { ValidatorFn } from '@angular/forms';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function imageMaxSize(max: number): ValidatorFn {
  return (control) =>
    control.value instanceof File && control.value.size > max
      ? { maxSize: { max, actual: control.value.size } }
      : null;
}

export function imageType(allowed: string[]): ValidatorFn {
  return (control) =>
    control.value instanceof File && !allowed.includes(control.value.type)
      ? { fileType: true }
      : null;
}