
import { Subject } from 'rxjs';
import { DESKTOP_BREAKPOINT } from '../../../core/constants/breakpoint';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BreakpointService } from './breakpoint.service';
import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';

describe('BreakpointService', () => {
  let service: BreakpointService;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  let observeSubject: Subject<any>;

  const mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe', 'isMatched']);

  beforeEach(() => {
    observeSubject = new Subject();

    (mockBreakpointObserver.observe as jasmine.Spy)
      .withArgs(DESKTOP_BREAKPOINT)
      .and.returnValue(observeSubject);

    TestBed.configureTestingModule({
      providers: [
        BreakpointService,
        { provide: BreakpointObserver, useValue: mockBreakpointObserver }
      ]
    });

    service = TestBed.inject(BreakpointService);
    breakpointObserverSpy = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;

    breakpointObserverSpy.observe.calls.reset();

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isDesktop$ should correctly observe DESKTOP_BREAKPOINT and map result to TRUE', (done) => {
    let isTrue = false;

    service.isDesktop$.subscribe(isDesktop => {
      isTrue = isDesktop;
      if (isDesktop) {
        expect(isTrue).toBe(true);
        done();
      }
    });

    expect(breakpointObserverSpy.observe).toHaveBeenCalledTimes(0);

    observeSubject.next({ matches: true, breakpoints: {} as any });

    expect(breakpointObserverSpy.observe).toHaveBeenCalledTimes(0);

  });
 
  it('isDesktop$ should correctly observe DESKTOP_BREAKPOINT and map result to FALSE', fakeAsync(() => {
    let isDesktopResult: boolean | undefined;
    
    service.isDesktop$.subscribe(isDesktop => {
      isDesktopResult = isDesktop;
    });
   
    observeSubject.next({ matches: false, breakpoints: {} as any });
   
    tick();
    
    expect(isDesktopResult).toBe(false);
    
    expect(breakpointObserverSpy.observe).toHaveBeenCalledTimes(0);
  }));

});