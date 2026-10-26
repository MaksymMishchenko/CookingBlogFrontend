import { ChangeDetectionStrategy, Component, forwardRef, inject, input, signal, OnInit, Injector, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '../../validators/image.validators';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ]
})
export class ImageUploadComponent implements ControlValueAccessor, OnInit {
  public serverError = input<string | null>(null);
  public fileCleared = output<void>();

  public isDragOver = signal(false);
  public previewUrl = signal<string | null>(null);

  private injector = inject(Injector);
  public ngControl: NgControl | null = null;

  private onChange: (value: File | string | null) => void = () => { };
  private onTouched: () => void = () => { };

  protected readonly maxImageSize = MAX_IMAGE_SIZE_MB;
  protected readonly allowedExtensions = ALLOWED_IMAGE_TYPES.join(', ');

  ngOnInit() {    
    this.ngControl = this.injector.get(NgControl, null);
  }
  
  public get isTouchedOrDirty(): boolean {
    return !!(this.ngControl?.touched || this.ngControl?.dirty);
  }
  
  public get errors() {
    return this.ngControl?.errors;
  }

  public writeValue(value: File | string | null): void {
    if (typeof value === 'string') {
      this.previewUrl.set(value);
    } else if (!value) {
      this.previewUrl.set(null);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public markAsTouched(): void {
    this.onTouched();
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  public onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  public onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
    input.value = '';
  }

  private handleFile(file: File) {
    this.fileCleared.emit();

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }

    this.onChange(file);
    this.onTouched();
  }

  public removeImage() {
    this.fileCleared.emit();
    this.previewUrl.set(null);
    this.onChange(null);
    this.onTouched();
  }
}
