import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ImageUploadComponent } from './image-upload.component';
import {
  imageMaxSize,
  imageType,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB
} from '../../validators/image.validators';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ImageUploadComponent],
  template: `
    <app-image-upload
      [formControl]="control"
      [serverError]="serverError"
      (fileCleared)="clearedCount = clearedCount + 1" />
  `
})
class HostComponent {
  control = new FormControl<File | string | null>(null, [
    Validators.required,
    imageMaxSize(MAX_IMAGE_SIZE_BYTES),
    imageType(ALLOWED_IMAGE_TYPES)
  ]);
  serverError: string | null = null;
  clearedCount = 0;
}

describe('ImageUploadComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: ImageUploadComponent;

  const makeFile = (name = 'test.png', type = 'image/png') => new File(['dummy'], name, { type });
  
  function mockFileReader(result = 'data:image/png;base64,fake') {
    const fake: any = {
      result,
      onload: null,
      readAsDataURL() { fake.onload?.(); }
    };
    spyOn(window as any, 'FileReader').and.returnValue(fake);
  }

  function dropFile(file: File | null) {
    const zone = fixture.debugElement.query(By.css('.drop-zone'));
    zone.triggerEventHandler('drop', {
      preventDefault: () => { },
      stopPropagation: () => { },
      dataTransfer: { files: file ? [file] : [] }
    });
    fixture.detectChanges();
  }

  const text = () => fixture.nativeElement.textContent as string;
  const q = (css: string) => fixture.debugElement.query(By.css(css));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(ImageUploadComponent)).componentInstance;
  });
  
  it('should show preview when the form control gets a string url', () => {
    host.control.setValue('https://example.com/test-image.jpg');
    fixture.detectChanges();

    expect(component.previewUrl()).toBe('https://example.com/test-image.jpg');
    expect(q('img.image-preview').nativeElement.getAttribute('src'))
      .toBe('https://example.com/test-image.jpg');
    expect(q('.drop-zone')).toBeFalsy();
  });
  
  it('should clear preview when the form control is reset', () => {
    host.control.setValue('https://example.com/test-image.jpg');
    fixture.detectChanges();

    host.control.reset();
    fixture.detectChanges();

    expect(component.previewUrl()).toBeNull();
    expect(q('.drop-zone')).toBeTruthy();
  });
  
  it('should set control value and preview when a valid image is dropped', () => {
    mockFileReader();
    const file = makeFile();

    dropFile(file);

    expect(host.control.value).toBe(file);
    expect(host.control.valid).toBeTrue();
    expect(host.control.touched).toBeTrue();
    expect(component.previewUrl()).toBe('data:image/png;base64,fake');
    expect(host.clearedCount).toBe(1);
  });
  
  it('should pass non-image file to the control, skip preview and show fileType error', () => {
    const file = makeFile('test.txt', 'text/plain');

    dropFile(file);

    expect(host.control.value).toBe(file);
    expect(component.previewUrl()).toBeNull();
    expect(host.control.errors?.['fileType']).toBeTruthy();
    expect(text()).toContain('Invalid file format');
  });

  it('should show maxSize error for a file bigger than the limit', () => {
    mockFileReader();
    const big = makeFile('big.png');
    Object.defineProperty(big, 'size', { value: MAX_IMAGE_SIZE_BYTES + 1 });

    dropFile(big);

    expect(host.control.errors?.['maxSize']).toBeTruthy();
    expect(text()).toContain(`${MAX_IMAGE_SIZE_MB}MB`);
  });
  
  it('should handle file picked via the file input and reset the input value', () => {
    mockFileReader();
    const file = makeFile();
    const target = { files: [file], value: 'C:\\fakepath\\test.png' };

    component.onFileSelected({ target } as unknown as Event);

    expect(host.control.value).toBe(file);
    expect(target.value).toBe('');
  });

  it('should do nothing when file input is changed without files', () => {
    component.onFileSelected({ target: { files: [], value: '' } } as unknown as Event);

    expect(host.control.value).toBeNull();
    expect(host.control.touched).toBeFalse();
    expect(host.clearedCount).toBe(0);
  });

  it('should do nothing when drop has no files', () => {
    dropFile(null);

    expect(host.control.value).toBeNull();
    expect(host.control.touched).toBeFalse();
  });
  
  it('should clear preview, set control to null and emit fileCleared on remove', () => {
    host.control.setValue('https://example.com/test-image.jpg');
    fixture.detectChanges();

    q('.btn-remove').nativeElement.click();
    fixture.detectChanges();

    expect(component.previewUrl()).toBeNull();
    expect(host.control.value).toBeNull();
    expect(host.control.touched).toBeTrue();
    expect(host.clearedCount).toBe(1);
    expect(text()).toContain('This field is required');
  });

  it('should toggle dragover class on dragover and dragleave', () => {
    const zone = q('.drop-zone');
    const event = { preventDefault: () => { }, stopPropagation: () => { } };

    zone.triggerEventHandler('dragover', event);
    fixture.detectChanges();
    expect(component.isDragOver()).toBeTrue();
    expect(zone.nativeElement.classList).toContain('dragover');

    zone.triggerEventHandler('dragleave', event);
    fixture.detectChanges();
    expect(component.isDragOver()).toBeFalse();
    expect(zone.nativeElement.classList).not.toContain('dragover');
  });

  it('should reset dragover state after drop', () => {
    mockFileReader();
    component.isDragOver.set(true);

    dropFile(makeFile());

    expect(component.isDragOver()).toBeFalse();
  });

  it('should open the file dialog on click and Enter', () => {
    const input = q('input[type=file]').nativeElement as HTMLInputElement;
    const clickSpy = spyOn(input, 'click');
    const zone = q('.drop-zone');

    zone.triggerEventHandler('click', {});
    zone.triggerEventHandler('keydown.enter', {});

    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('should mark control touched and show required error when file dialog is cancelled', () => {
    expect(text()).not.toContain('This field is required');

    q('input[type=file]').nativeElement.dispatchEvent(new Event('cancel'));
    fixture.detectChanges();

    expect(host.control.touched).toBeTrue();
    expect(text()).toContain('This field is required');
  });

  it('should not show errors for an untouched and pristine control', () => {
    expect(q('.validation')).toBeFalsy();
  });

  it('should show server error even when the control is untouched', () => {
    host.serverError = 'Invalid file format. Allowed formats: .jpg, .jpeg, .png, .webp.';
    fixture.detectChanges();

    expect(q('[data-cy=image-server-error-message]').nativeElement.textContent)
      .toContain('Allowed formats');
  });

  it('should show server error instead of local error', () => {
    host.control.markAsTouched();
    host.serverError = 'Server says no';
    fixture.detectChanges();

    expect(q('[data-cy=image-server-error-message]')).toBeTruthy();
    expect(q('[data-cy=image-error-message]')).toBeFalsy();
  });

  it('should fall back to local error when server error is cleared', () => {
    host.control.markAsTouched();
    host.serverError = 'Server says no';
    fixture.detectChanges();

    host.serverError = null;
    fixture.detectChanges();

    expect(q('[data-cy=image-server-error-message]')).toBeFalsy();
    expect(q('[data-cy=image-error-message]').nativeElement.textContent)
      .toContain('This field is required');
  });
});