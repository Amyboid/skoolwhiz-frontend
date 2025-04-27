import { AbstractControl, ValidatorFn } from '@angular/forms';

export const phoneValidator = (): ValidatorFn => {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;
    
    const phonePattern = /^\d{10}$/;
    const isValid = phonePattern.test(value);
    
    return isValid ? null : { 
      invalidPhone: { 
        value: control.value,
        message: 'Phone number must be exactly 10 digits'
      }
    };
  };
};