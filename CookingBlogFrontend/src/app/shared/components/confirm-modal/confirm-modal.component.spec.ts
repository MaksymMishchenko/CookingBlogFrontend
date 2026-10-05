import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render default title and message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-title')?.textContent).toContain('Confirm Action');
    expect(compiled.querySelector('.modal-body p')?.textContent).toContain('Are you sure you want to perform this action?');
  });

  it('should emit confirm event when confirm button is clicked', () => {
    spyOn(component.confirm, 'emit');
    const confirmBtn = fixture.nativeElement.querySelectorAll('.modal-footer .btn')[1] as HTMLButtonElement;
    
    confirmBtn.click();
    
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should not emit cancel when loading is true and backdrop is clicked', () => {
    spyOn(component.cancel, 'emit');
        
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    backdrop.click();

    expect(component.cancel.emit).not.toHaveBeenCalled();
  });
});