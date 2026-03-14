import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ObserveVisibilityDirective } from './observe-visibility.directives';

@Component({
  standalone: true,
  imports: [ObserveVisibilityDirective],
  template: `<div (visible)="onVisible()" appObserveVisibility>Target</div>`
})
class TestHostComponent {
  onVisible = jasmine.createSpy('onVisible');
}

describe('ObserveVisibilityDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let observerCallback: IntersectionObserverCallback;
  const mockDisconnect = jasmine.createSpy('disconnect');
  const mockObserve = jasmine.createSpy('observe');

  beforeEach(async () => {    
    (globalThis as any).IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = jasmine.createSpy('unobserve');
      takeRecords = () => [];
    };
    
    spyOn(globalThis, 'IntersectionObserver' as any).and.callThrough();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ObserveVisibilityDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an observer and start observing the element', () => {
    expect(globalThis.IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(fixture.debugElement.query(By.css('div')).nativeElement);
  });

  it('should emit "visible" event when element is intersecting', () => {
    const mockEntries = [{ isIntersecting: true }] as IntersectionObserverEntry[];
    observerCallback(mockEntries, {} as IntersectionObserver);

    expect(component.onVisible).toHaveBeenCalled();
  });

  it('should NOT emit "visible" event when element is NOT intersecting', () => {
    const mockEntries = [{ isIntersecting: false }] as IntersectionObserverEntry[];
    observerCallback(mockEntries, {} as IntersectionObserver);

    expect(component.onVisible).not.toHaveBeenCalled();
  });

  it('should disconnect the observer on destroy', () => {
    fixture.destroy();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});