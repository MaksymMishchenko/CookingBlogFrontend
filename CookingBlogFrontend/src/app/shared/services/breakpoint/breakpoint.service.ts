import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { DESKTOP_BREAKPOINT } from '../../../core/constants/breakpoint';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver)

  readonly desktopBreakpoint = DESKTOP_BREAKPOINT;

  isDesktop$: Observable<boolean> = this.breakpointObserver.observe(this.desktopBreakpoint)
    .pipe(
      map(result => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  isMatched(breakpoint: string): boolean {
    return this.breakpointObserver.isMatched(breakpoint);
  }
}
