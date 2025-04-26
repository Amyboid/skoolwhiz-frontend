import { AbstractControl, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const phonePattern = /^\d{10}$/; // Adjust the pattern as needed
        const valid = phonePattern.test(control.value);
        return valid ? null : { invalidPhone: { value: control.value } };
    };
}
