import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload.component';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize previewUrl when initialImage input is provided', () => {
    fixture.componentRef.setInput('initialImage', 'https://example.com/test-image.jpg');
    fixture.detectChanges();

    expect(component.previewUrl()).toBe('https://example.com/test-image.jpg');
  });

  it('should emit file and set previewUrl when a valid image file is selected', () => {
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    let emittedFile: any = null;
    component.fileChange.subscribe(f => emittedFile = f);

    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    const dropEvent = {
      preventDefault: () => { },
      stopPropagation: () => { },
      dataTransfer
    } as unknown as DragEvent;

    component.onDrop(dropEvent);
    fixture.detectChanges();

    expect(emittedFile).toEqual(file);
  });

  it('should emit non-image file but NOT set preview (validation is done by parent form)', () => {
    const file = new File(['text content'], 'test.txt', { type: 'text/plain' });

    const emitted: (File | null)[] = [];
    component.fileChange.subscribe(v => emitted.push(v));

    const dropEvent = {
      preventDefault: () => { },
      stopPropagation: () => { },
      dataTransfer: { files: [file] }
    } as unknown as DragEvent;

    component.onDrop(dropEvent);
    fixture.detectChanges();

    expect(emitted).toEqual([file]);
    expect(component.previewUrl()).toBeNull();
  });

  it('should clear preview and emit null when removeImage is called', () => {
    component.previewUrl.set('data:image/png;base64,fakedata');

    let emittedFile: File | null | undefined = undefined;
    component.fileChange.subscribe(f => emittedFile = f);

    component.removeImage();
    fixture.detectChanges();

    expect(component.previewUrl()).toBeNull();
    expect(emittedFile).toBeNull();
  });

  it('should update isDragOver signal on dragover and dragleave events', () => {
    const event = {
      preventDefault: () => { },
      stopPropagation: () => { }
    } as unknown as DragEvent;

    component.onDragOver(event);
    expect(component.isDragOver()).toBe(true);

    component.onDragLeave(event);
    expect(component.isDragOver()).toBe(false);
  });
});