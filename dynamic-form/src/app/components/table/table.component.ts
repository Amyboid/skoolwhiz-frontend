import { Component, EventEmitter, Output, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientRecord } from '../../record.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class TableComponent {
  // Selection state
  selectedRecords = signal<Set<number>>(new Set());
  allSelected = computed(() => {
    const records = this.records;
    return records.length > 0 && this.selectedRecords().size === records.length;
  });
  isDeleting = signal(false);

  // Input handling
  @Input({ required: true }) set records(value: PatientRecord[]) {
    this._records.set(value);
    this.selectedRecords.set(new Set()); // Clear selection on new data
  }
  get records() {
    return this._records();
  }
  private _records = signal<PatientRecord[]>([]);

  // Output events
  @Output() edit = new EventEmitter<PatientRecord>();
  @Output() delete = new EventEmitter<number[]>(); 

  // Table configuration
  headers = [
    '', // Checkbox column
    'Picture',
    'Name',
    'UID',
    'Phone',
    'Address',
    'Height',
    'Weight',
    'Blood Group',
    'Emergency Contact',
    'Allergies',
    'Notes',
    'Actions'
  ];

  // Selection management
  toggleSelectAll() {
    this.selectedRecords.update(selected => {
      const newSelection = new Set(selected);
      if (this.allSelected()) {
        newSelection.clear();
      } else {
        this.records.forEach(record => {
          if (record.id) newSelection.add(record.id);
        });
      }
      return newSelection;
    });
  }

  toggleRecordSelection(id: number) {
    this.selectedRecords.update(selected => {
      const newSelection = new Set(selected);
      newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
      return newSelection;
    });
  }

  // Delete handling
  async deleteSelected() {
    const ids = Array.from(this.selectedRecords());
    if (ids.length === 0) return;

    this.isDeleting.set(true);
    try {
      this.delete.emit(ids);
      this.selectedRecords.set(new Set());
    } finally {
      this.isDeleting.set(false);
    }
  }
  
  // Edit handling
  editRecord(record: PatientRecord) {
    this.edit.emit(record);
  }
}