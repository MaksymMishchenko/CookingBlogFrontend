import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { InsertImageModalComponent } from './insert-image-modal.component';
import { ImageService, UploadImageResponse } from '../../../../shared/services/image/image.service';
import { ValidationError } from '../../../../shared/services/error/error.types';

describe('InsertImageModalComponent', () => {
  let fixture: ComponentFixture<InsertImageModalComponent>;
  let component: InsertImageModalComponent;
  let imageService: jasmine.SpyObj<ImageService>;

  const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
  const response: UploadImageResponse = { id: '1', url: 'https://cdn/a.jpg', alt: 'alt' };

  const validationError = (errors: Record<string, string[]>) =>
    new ValidationError('Validation Failed.', 400, '', {} as any, errors);  

  beforeEach(async () => {
    imageService = jasmine.createSpyObj('ImageService', ['uploadContentImage']);

    await TestBed.configureTestingModule({
      imports: [InsertImageModalComponent],
      providers: [{ provide: ImageService, useValue: imageService }]
    }).compileComponents();

    fixture = TestBed.createComponent(InsertImageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not call the service and should mark controls touched when the form is invalid', () => {
    component.onSubmit();

    expect(imageService.uploadContentImage).not.toHaveBeenCalled();
    expect(component.form.controls.contentImage.touched).toBeTrue();
  });  

  it('should upload the file with alt and emit imageUploaded on success', () => {
    imageService.uploadContentImage.and.returnValue(of(response));
    const spy = jasmine.createSpy();
    component.imageUploaded.subscribe(spy);
    component.form.setValue({ contentImage: file, alt: 'alt' });

    component.onSubmit();

    expect(imageService.uploadContentImage).toHaveBeenCalledOnceWith(file, 'alt');
    expect(spy).toHaveBeenCalledOnceWith(response);
    expect(component.isSubmitting()).toBeFalse();
  });  

  it('should map ContentImage server error to serverError and not emit', () => {
    imageService.uploadContentImage.and.returnValue(
      throwError(() => validationError({ ContentImage: ['Content Image is required'] }))
    );
    const spy = jasmine.createSpy();
    component.imageUploaded.subscribe(spy);
    component.form.setValue({ contentImage: file, alt: '' });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.serverError()).toBe('Content Image is required');
    expect(component.altServerError()).toBeNull();
    expect(component.isSubmitting()).toBeFalse();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should map Alt server error and show it under the alt input', () => {
    imageService.uploadContentImage.and.returnValue(
      throwError(() => validationError({ Alt: ['Alt is too long'] }))
    );
    component.form.setValue({ contentImage: file, alt: 'abc' });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.altServerError()).toBe('Alt is too long');
    expect(component.serverError()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Alt is too long');
  });

  it('should clear the alt server error when the user edits alt', () => {
    component.altServerError.set('Alt is too long');

    component.form.controls.alt.setValue('new alt');

    expect(component.altServerError()).toBeNull();
  });

  it('should clear the file server error when the file changes or is cleared', () => {
    component.serverError.set('error');
    component.form.controls.contentImage.setValue(file);
    expect(component.serverError()).toBeNull();

    component.serverError.set('error');
    component.onFileCleared();
    expect(component.serverError()).toBeNull();
  });
});