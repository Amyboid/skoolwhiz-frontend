import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientRecord } from '../../record.service';
import { CommonModule } from '@angular/common';
import { UniqueUidValidator } from '../../unique-uid.validator';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class FormComponent {
  @Input() set record(value: PatientRecord | null) {
    if (value) {
      console.log("val",value);
      
      this.editRecord(value);
    } else {
      this.resetForm();
    }
  }

  @Output() add = new EventEmitter<PatientRecord>();
  @Output() edit = new EventEmitter<PatientRecord>();
  @Output() close = new EventEmitter<void>();

  form: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  editingRecordId: number | null = null;
  originalValues: any; // To store original values for comparison
  hasChanged = false;

  constructor(private fb: FormBuilder, private uidValidator: UniqueUidValidator) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      uid: ['', [Validators.required, Validators.pattern(/^\d{11}$/)], [this.uidValidator.uniqueUidValidator()]],
      phone: ['', [Validators.required]],
      address: [''],
      height: [''],
      weight: [''],
      picture: [''],
      bloodGroup: ['', Validators.required],
      emergencyContact: ['', [Validators.required]],
      allergies: [''],
      notes: ['']
    });

    // Subscribe to form value changes
    this.form.valueChanges.subscribe(() => {
      this.checkIfChanged();
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const recordData = this.form.value;

    if (this.editingRecordId !== null) {
      this.edit.emit({ ...recordData, id: this.editingRecordId });
    } else {
      this.add.emit(recordData);
    }
    this.resetForm();
  }

  editRecord(record: PatientRecord) {
    this.editingRecordId = record.id ?? null;
    this.form.patchValue(record);
    this.previewUrl = record.picture ?? null;
    this.originalValues = { ...record };
    this.hasChanged = false;// Store original values for comparison
  }

  resetForm() {
    this.form.reset();
    this.editingRecordId = null;
    this.previewUrl = null;
    this.originalValues = null; // Reset original values
  }

  checkIfChanged() {
    if (!this.originalValues) {
      this.hasChanged = true;
      return;
    }

    const currentValues = this.form.value;

    this.hasChanged = Object.keys(this.originalValues).some(key => {
      return this.originalValues[key] !== currentValues[key];
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.form.patchValue({ picture: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
      this.form.patchValue({ picture: '' });
      console.error('Only JPG, JPEG, and PNG formats are supported.');
    }
  }
}
