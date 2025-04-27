import { Component, Input, Output, EventEmitter, inject, signal, effect, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientRecord, RecordService } from '../../record.service';
import { CommonModule } from '@angular/common';
import { UniqueUidValidator } from '../../unique-uid.validator';
import { phoneValidator } from '../../ph-no.validator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [RecordService]
})
export class FormComponent {
  // Signals
  private readonly destroyRef = inject(DestroyRef);
  private recordService = inject(RecordService);
  editingRecordId = signal<number | null>(null);
  hasChanged = signal(false);
  originalValues = signal<Partial<PatientRecord> | null>(null);
  previewUrl = signal<string | null>(null);
  bloodGroups = signal(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
  // Form Control
  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    uid: ['', {
      validators: [Validators.required, Validators.pattern(/^\d{11}$/)],
      asyncValidators: [UniqueUidValidator(this.recordService)]
    }],
    phone: ['', [Validators.required, phoneValidator()]],
    address: [''],
    height: ['', [Validators.min(0)]],  // Change to string input
    weight: ['', [Validators.min(0)]],
    picture: [''],
    bloodGroup: ['', Validators.required],
    emergencyContact: ['', [Validators.required, phoneValidator()]],
    allergies: [''],
    notes: ['']
  });

  // Input/Output
  @Input() set record(value: PatientRecord | null) {
    value ? this.editRecord(value) : this.resetForm();
  }

  @Output() add = new EventEmitter<PatientRecord>();
  @Output() edit = new EventEmitter<PatientRecord>();
  @Output() close = new EventEmitter<void>();

  constructor() {
    this.setupChangeDetection();
  }

  
  // Lifecycle Methods
  private setupChangeDetection() {
    effect(() => {
      const original = this.originalValues();
      const current = this.form.value;

      this.hasChanged.set(original ?
        Object.keys(original).some(key =>
          JSON.stringify(original[key as keyof PatientRecord]) !== JSON.stringify(current[key as keyof typeof current])
        ) : false
      );
    }, { allowSignalWrites: true });
  }

  // Public Methods
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const recordData = this.prepareFormData();
    this.emitFormData(recordData);
    this.resetForm();
  }

  onCancel() {
    this.resetForm();
    this.close.emit();
  }

  editRecord(record: PatientRecord) {
    this.setEditingState(record);
    this.setupUidValidation(record.uid);
  }

  resetForm() {
    this.form.reset();
    this.editingRecordId.set(null);
    this.previewUrl.set(null);
    this.originalValues.set(null);
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      this.handleInvalidFile();
      return;
    }

    this.readAndPreviewFile(file);
  }

  // Private Methods
  private prepareFormData(): PatientRecord {
    const rawValue = this.form.getRawValue();
    return {
      ...rawValue,
      height: rawValue.height ? Number(rawValue.height) : undefined,
      weight: rawValue.weight ? Number(rawValue.weight) : undefined,
      address: rawValue.address?.trim() || undefined,
      allergies: rawValue.allergies?.trim() || undefined,
      notes: rawValue.notes?.trim() || undefined,
      picture: rawValue.picture?.trim() || undefined
    };
  }

  private emitFormData(data: PatientRecord) {
    const id = this.editingRecordId();
    if (id) {
      this.edit.emit({ ...data, id });
    } else {
      this.add.emit(data);
    }
  }

  private setEditingState(record: PatientRecord) {
    this.editingRecordId.set(record.id ?? null);
    this.form.patchValue({
      ...record,
      height: record.height?.toString() ?? '',  // Convert number to string
      weight: record.weight?.toString() ?? ''   // Convert number to string
    });
    this.previewUrl.set(record.picture ?? null);
    this.originalValues.set({ ...record });
  }


  private setupUidValidation(originalUid: string) {
    const uidControl = this.form.controls.uid;
    
    uidControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(newUid => {
      if (newUid !== originalUid) {
        // Clear previous errors
        if (uidControl.hasError('uidTaken')) {
          uidControl.setErrors(null);
        }
        // Add fresh validation
        uidControl.setAsyncValidators([UniqueUidValidator(this.recordService)]);
      } else {
        uidControl.clearAsyncValidators();
      }
      uidControl.updateValueAndValidity({ emitEvent: false });
    });
  }


  private handleInvalidFile() {
    this.previewUrl.set(null);
    this.form.controls.picture.setValue('');
    console.error('Unsupported file format. Please use JPG, JPEG, or PNG.');
  }

  private readAndPreviewFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
      this.form.controls.picture.setValue(reader.result?.toString() ?? '');
    };
    reader.readAsDataURL(file);
  }

  // Template helper
  get isEditing(): boolean {
    return this.editingRecordId() !== null;
  }
}