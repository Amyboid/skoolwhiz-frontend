import { Component, signal, effect } from '@angular/core';
import { FormComponent } from "./components/form/form.component";
import { TableComponent } from "./components/table/table.component";
import { PatientRecord, RecordService } from './record.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, FormComponent, TableComponent]
})
export class AppComponent {
  title = 'Patient Management System';
  records = signal<PatientRecord[]>([]);
  selectedRecord = signal<PatientRecord | null>(null);
  showForm = signal(false);
  isLoading = signal(false);

  constructor(
    private recordService: RecordService,
    private snackBar: MatSnackBar
  ) {
    effect(() => {
      if (!this.selectedRecord()) this.showForm.set(false);
    });
    this.loadRecords();
  }

  async loadRecords() {
    this.isLoading.set(true);
    try {
      const records = await lastValueFrom(this.recordService.getRecords());
      this.records.set(records);
    } catch (error) {
      this.showError('Failed to load records');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onAddRecord(record: PatientRecord) {
    try {
      await lastValueFrom(this.recordService.addRecord(record));
      await this.loadRecords();
      this.showForm.set(false);
      this.showSuccess('Record added successfully');
    } catch (error) {
      this.showError('Failed to add record');
    }
  }

  async onEditRecord(record: PatientRecord) {
    if (!record.id) return;

    this.isLoading.set(true);
    try {
      await lastValueFrom(this.recordService.updateRecord(record.id, record));
      await this.loadRecords();
      this.selectedRecord.set(null);
      this.showSuccess('Record updated successfully');
    } catch (error) {
      this.showError('Failed to update record');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteRecords(ids: number[]) {
    if (ids.length === 0) return;
  
    this.isLoading.set(true);
    try {
      const deleteOperations = ids.map(id => 
        lastValueFrom(this.recordService.deleteRecord(id))
      );
      
      await Promise.all(deleteOperations);
      await this.loadRecords();
      this.showSuccess(`Deleted ${ids.length} records successfully`);
    } catch (error) {
      console.error('Delete failed:', error);
      this.showError('Failed to delete records');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSelectRecord(record: PatientRecord) {
    this.selectedRecord.set(record);
    this.showForm.set(true);
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) this.selectedRecord.set(null);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { 
      duration: 3000,
      panelClass: ['success-snackbar'] 
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { 
      duration: 3000,
      panelClass: ['error-snackbar'] 
    });
  }
}