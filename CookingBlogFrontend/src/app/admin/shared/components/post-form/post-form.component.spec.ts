import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

import { PostFormComponent } from './post-form.component';
import { BusinessError, ValidationError } from '../../../../shared/services/error/error.types';
import { UI_ERROR_MESSAGES } from '../../../../core/constants/ui-messages.constants';
import { VALIDATION_MESSAGES as MSG } from '../../../../core/constants/validation.constants';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  const businessError = (code: string, msg: string) =>
    new BusinessError(msg, 409, 'dev', null, code);

  const validData = () => ({
    title: 'Test Title',
    description: 'Test description',
    content: 'c'.repeat(100),
    previewImage: new File(['x'], 'a.png', { type: 'image/png' }) as File | string | null,
    previewImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    slug: 'test-title',
    categoryId: 1 as number | null,
    isActive: true
  });

  const form = () => component['form'];
  const q = (cy: string) => fixture.debugElement.query(By.css(`[data-cy=${cy}]`));
  const text = (cy: string) => q(cy)?.nativeElement.textContent as string;

  function setServerError(err: unknown) {
    fixture.componentRef.setInput('serverError', err);
    fixture.detectChanges();
  }

  const validationError = (errors: Record<string, string[]>, status = 400) =>
    new ValidationError('Validation Failed.', status, '', {} as any, errors);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFormComponent, ReactiveFormsModule, QuillModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not emit and should mark all controls touched when form is invalid', () => {
    const spy = jasmine.createSpy();
    component.postSubmit.subscribe(spy);

    component.submit();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(form().controls.title.touched).toBeTrue();
    expect(form().controls.previewImage.touched).toBeTrue();
    expect(q('title-error-message')).toBeTruthy();
    expect(text('title-error-message')).toContain(MSG.REQUIRED);
  });

  it('should emit postSubmit with full payload when valid', () => {
    const spy = jasmine.createSpy();
    component.postSubmit.subscribe(spy);
    const data = validData();
    form().setValue(data);

    component.submit();

    expect(spy).toHaveBeenCalledOnceWith({ 
      ...data, 
      categoryId: data.categoryId as number,
      previewImage: data.previewImage,
      imageIds: []
    });
  });

  it('should emit previewImage null when the control holds an existing image url', () => {
    const spy = jasmine.createSpy();
    component.postSubmit.subscribe(spy);
    form().setValue({ ...validData(), previewImage: 'https://cdn/img.png' });

    component.submit();

    expect(spy.calls.mostRecent().args[0].previewImage).toBeNull();
  });

  it('should disable submit when invalid or while the page is submitting', () => {
    expect(q('submit-btn').nativeElement.disabled).toBeTrue();

    form().setValue(validData());
    fixture.detectChanges();
    expect(q('submit-btn').nativeElement.disabled).toBeFalse();

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(q('submit-btn').nativeElement.disabled).toBeTrue();
  });

  it('should patch the form from postData', () => {
    fixture.componentRef.setInput('postData', {
      title: 'Existing', description: 'Existing desc', content: 'c'.repeat(120),
      previewImageUrl: 'img.png', previewImageAlt: null, metaTitle: '', metaDescription: '',
      slug: 'existing', categoryId: 2, isActive: false
    } as any);
    fixture.detectChanges();

    expect(form().getRawValue()).toEqual(jasmine.objectContaining({
      title: 'Existing', slug: 'existing', categoryId: 2, isActive: false,
      previewImage: 'img.png', previewImageAlt: ''
    }));
    expect(form().valid).toBeTrue();
  });

  it('should show local errors only after the field is touched', () => {
    form().controls.title.setValue('ab');
    fixture.detectChanges();
    expect(q('title-error-message')).toBeFalsy();

    form().controls.title.markAsTouched();
    fixture.detectChanges();
    expect(text('title-error-message')).toContain(MSG.MIN_LENGTH(3));
  });

  it('should show min length messages for the optional fields', () => {
    form().patchValue({ metaTitle: 'short', metaDescription: 'short', previewImageAlt: 'ab' });
    ['metaTitle', 'metaDescription', 'previewImageAlt']
      .forEach(n => form().get(n)!.markAsTouched());
    fixture.detectChanges();

    expect(text('metaTitle-error-message')).toContain(MSG.MIN_LENGTH(10));
    expect(text('metaDescription-error-message')).toContain(MSG.MIN_LENGTH(70));
    expect(text('previewImageAlt-error-message')).toContain(MSG.MIN_LENGTH(3));
  });

  it('should treat empty optional fields as valid', () => {
    form().setValue(validData());

    expect(form().controls.metaTitle.valid).toBeTrue();
    expect(form().controls.metaDescription.valid).toBeTrue();
    expect(form().controls.previewImageAlt.valid).toBeTrue();
  });

  it('should show slug pattern error for an invalid slug', () => {
    form().controls.slug.setValue('Bad Slug');
    form().controls.slug.markAsTouched();
    fixture.detectChanges();

    expect(text('slug-error-message')).toContain(MSG.SLUG_PATTERN);
  });

  it('should show max length error for too long content', () => {
    form().controls.content.setValue('c'.repeat(50001));
    form().controls.content.markAsTouched();
    fixture.detectChanges();

    expect(text('content-error-message')).toContain(MSG.MAX_LENGTH(50000));
  });

  it('should map backend keys to control names and mark them touched', () => {
    setServerError(validationError({
      Slug: ['Slug is invalid.'],
      Title: ['Title is invalid.'],
      PreviewImage: ['Invalid file format.']
    }));

    expect(component['fieldServerErrors']()).toEqual({
      slug: 'Slug is invalid.',
      title: 'Title is invalid.',
      previewImage: 'Invalid file format.'
    });
    expect(form().controls.slug.touched).toBeTrue();
    expect(text('slug-server-error-message')).toContain('Slug is invalid.');
    expect(text('image-server-error-message')).toContain('Invalid file format.');
  });

  it('should use only the first message for a field', () => {
    setServerError(validationError({ Slug: ['First', 'Second'] }));

    expect(text('slug-server-error-message')).toContain('First');
    expect(text('slug-server-error-message')).not.toContain('Second');
  });

  it('should replace the local error with the server error', () => {
    form().controls.slug.setValue('Bad Slug');
    form().controls.slug.markAsTouched();
    fixture.detectChanges();
    expect(q('slug-error-message')).toBeTruthy();

    setServerError(validationError({ Slug: ['Server says no.'] }));

    expect(q('slug-server-error-message')).toBeTruthy();
    expect(q('slug-error-message')).toBeFalsy();
  });

  it('should show a server error for an untouched field and mark it touched', () => {
    expect(form().controls.title.touched).toBeFalse();

    setServerError(validationError({ Title: ['Title is invalid.'] }));

    expect(form().controls.title.touched).toBeTrue();
    expect(text('title-server-error-message')).toContain('Title is invalid.');
    expect(q('title-error-message')).toBeFalsy();
  });

  it('should mark a locally valid field as invalid when the server rejects it', () => {
    form().controls.slug.setValue('valid-slug');
    setServerError(validationError({ Slug: ['Server says no.'] }));

    expect(form().controls.slug.valid).toBeTrue();
    expect(q('slug-container').nativeElement.classList).toContain('invalid');
  });

  it('should drop the server error on input and bring local validation back', () => {
    form().controls.slug.setValue('valid-slug');
    setServerError(validationError({ Slug: ['Server says no.'] }));

    form().controls.slug.setValue('Bad Slug');
    fixture.detectChanges();

    expect(q('slug-server-error-message')).toBeFalsy();
    expect(q('slug-error-message')).toBeTruthy();
  });

  it('should drop only the server error of the edited field', () => {
    setServerError(validationError({ Slug: ['Slug error'], Title: ['Title error'] }));

    form().controls.slug.setValue('another-slug');
    fixture.detectChanges();

    expect(q('slug-server-error-message')).toBeFalsy();
    expect(text('title-server-error-message')).toContain('Title error');
  });

  it('should replace previous errors on a new error and clear them on null', () => {
    setServerError(validationError({ Slug: ['Slug error'] }));
    setServerError(validationError({ Title: ['Title error'] }));
    expect(component['fieldServerErrors']()).toEqual({ title: 'Title error' });

    setServerError(null);
    expect(component['fieldServerErrors']()).toEqual({});
  });

  it('shows slug error under the slug field', () => {
    fixture.componentRef.setInput(
      'serverError',
      businessError('SLUG_ALREADY_EXISTS', UI_ERROR_MESSAGES.POSTS.SLUG_ALREADY_EXISTS)
    );
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-cy="slug-server-error-message"]')?.textContent)
      .toContain(UI_ERROR_MESSAGES.POSTS.SLUG_ALREADY_EXISTS);
    expect(el.querySelector('[data-cy="title-server-error-message"]')).toBeNull();
  });

  it('shows title error under the title field', () => {
    fixture.componentRef.setInput(
      'serverError',
      businessError('TITLE_ALREADY_EXISTS', UI_ERROR_MESSAGES.POSTS.TITLE_ALREADY_EXISTS)
    );
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-cy="title-server-error-message"]')?.textContent)
      .toContain(UI_ERROR_MESSAGES.POSTS.TITLE_ALREADY_EXISTS);
    expect(el.querySelector('[data-cy="slug-server-error-message"]')).toBeNull();
  });

  it('clears the slug error when user edits the slug', () => {
    fixture.componentRef.setInput(
      'serverError',
      businessError('SLUG_ALREADY_EXISTS', UI_ERROR_MESSAGES.POSTS.SLUG_ALREADY_EXISTS)
    );
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="slug-input"]');
    input.value = 'new-slug';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="slug-server-error-message"]')).toBeNull();
  });

  it('ignores business errors with unmapped codes', () => {
    fixture.componentRef.setInput('serverError', businessError('CATEGORY_NOT_FOUND', 'x'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy$="server-error-message"]')).toBeNull();
  });

  it('should ignore a backend key that has no control in the form', () => {
    setServerError(validationError({ SomethingElse: ['Unknown'] }));

    expect(component['fieldServerErrors']()).toEqual({});
  });

  it('should not highlight any field on PayloadTooLarge', () => {
    setServerError(validationError({}, 413));

    expect(component['fieldServerErrors']()).toEqual({});
    expect(fixture.nativeElement.querySelector('[data-cy$="server-error-message"]')).toBeNull();
  });

  it('should open image modal when quill image toolbar handler is triggered', () => {
    const toolbarMock = {
      addHandler: jasmine.createSpy('addHandler').and.callFake((name, callback) => {
        if (name === 'image') {
          callback();
        }
      })
    };

    const quillMock = {
      getModule: jasmine.createSpy('getModule').and.returnValue(toolbarMock)
    };

    component.onEditorCreated(quillMock as any);

    expect(component['isImageModalOpen']()).toBeTrue();
  });

  it('should insert image into quill, update content control value, and clear required validation', () => {
    expect(form().controls.content.invalid).toBeTrue();

    const dangerouslyPasteHTMLSpy = jasmine.createSpy('dangerouslyPasteHTML');
    const setSelectionSpy = jasmine.createSpy('setSelection');

    const longHtmlContent = '<p>' + 'c'.repeat(90) + '<img src="https://res.cloudinary.com/test.jpg" alt="Test Alt" /></p>';

    component['activeQuillInstance'] = {
      root: { innerHTML: longHtmlContent },
      getSelection: () => ({ index: 0, length: 0 }),
      getLength: () => 110,
      setSelection: setSelectionSpy,
      getModule: () => ({ addHandler: () => { } }),
      clipboard: {
        dangerouslyPasteHTML: dangerouslyPasteHTMLSpy
      }
    } as any;

    const uploadResponse = {
      id: 1,
      url: 'https://res.cloudinary.com/test.jpg',
      publicId: 'test_id',
      alt: 'Test Alt'
    } as any;

    component['onImageUploaded'](uploadResponse);
    fixture.detectChanges();

    expect(component['isImageModalOpen']()).toBeFalse();
    expect(dangerouslyPasteHTMLSpy).toHaveBeenCalled();
    expect(form().controls.content.value).toContain('res.cloudinary.com');
    expect(form().controls.content.invalid).toBeFalse();
  });

  it('should push uploaded image id to uploadedImageIds array', () => {    
    expect(component['uploadedImageIds']).toEqual([]);

    const setSelectionSpy = jasmine.createSpy('setSelection');
    component['activeQuillInstance'] = {
      root: { innerHTML: '<p><img src="url" /></p>' },
      getSelection: () => ({ index: 0, length: 0 }),
      getLength: () => 10,
      setSelection: setSelectionSpy,
      getModule: () => ({ addHandler: () => { } }),
      clipboard: { dangerouslyPasteHTML: () => { } }
    } as any;

    const uploadResponse = {
      id: 'some-guid-id-123',
      url: 'https://res.cloudinary.com/test.jpg',
      alt: 'Test Alt'
    } as any;

    component['onImageUploaded'](uploadResponse);
    
    expect(component['uploadedImageIds']).toContain('some-guid-id-123');
  });
});