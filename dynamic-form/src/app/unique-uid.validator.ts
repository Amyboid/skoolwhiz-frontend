import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, catchError } from 'rxjs/operators';
import { RecordService } from './record.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UniqueUidValidator {
  constructor(private recordService: RecordService) {}

  uniqueUidValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);  // Skip validation if empty
      }

      return of(control.value).pipe(
        debounceTime(300), // Delay before API call
        switchMap((uid) =>
          this.recordService.checkUid(uid).pipe(
            map((isUnique) => (isUnique ? null : { uidTaken: true })),  // If not unique, return error
            catchError(() => of(null))  // If API fails, return null (no error)
          )
        )
      );
    };
  }
}
