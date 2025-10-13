import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthErrorService {

  public errors$ = new Subject<string>();

  public emitError(message: string): void {
    this.errors$.next(message);
  }
}
