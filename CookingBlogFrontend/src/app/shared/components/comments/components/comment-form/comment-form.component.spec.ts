import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentFormComponent } from './comment-form.component';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit handleSubmit when form is valid and submitted', () => {
    spyOn(component.handleSubmit, 'emit');

    component.form.controls['content'].setValue('Main coure');
    component.onSubmit();

    expect(component.handleSubmit.emit).toHaveBeenCalledWith('Main coure');

    expect(component.form.value.content).toBeNull();
  });

  it('should disable button if content is empty', () => {
    component.form.controls['content'].setValue('');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();
  });

  it('should emit handleCancel when cancel button is clicked', () => {    
    fixture.componentRef.setInput('hasCancelButton', true);
    fixture.detectChanges();

    spyOn(component.handleCancel, 'emit');

    const cancelBtn = fixture.nativeElement.querySelector('.comment-form-cancel-button');
    cancelBtn.click();

    expect(component.handleCancel.emit).toHaveBeenCalled();
  });

  it('should not show cancel button if hasCancelButton is false', () => {
    fixture.componentRef.setInput('hasCancelButton', false);
    fixture.detectChanges();

    const cancelBtn = fixture.nativeElement.querySelector('.comment-form-cancel-button');
    expect(cancelBtn).toBeNull();
  });
});