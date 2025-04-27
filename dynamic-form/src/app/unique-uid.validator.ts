import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RecordService } from './record.service';

export function UniqueUidValidator(recordService: RecordService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
    // Skip validation if empty or invalid pattern
    if (!control.value || control.errors?.['pattern']) {
      return of(null);
    }

    return timer(500).pipe( // Debounce 500ms
      switchMap(() => recordService.checkUid(control.value)),
      map(isAvailable => isAvailable ? null : { uidTaken: true }),
      catchError(() => of(null))
    );
  };
}