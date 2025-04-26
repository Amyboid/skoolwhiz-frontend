import { Component } from '@angular/core';
import { FormComponent } from "./components/form/form.component";
import { TableComponent } from "./components/table/table.component"; 
import { PatientRecord, RecordService } from './record.service';


@Component({
  selector: 'app-root', 
  templateUrl: './app.component.html',
  imports: [FormComponent, TableComponent]
})
export class AppComponent {
  title = 'frontend';
  records: PatientRecord[] = [];
  selectedRecord: PatientRecord | null = null;

  constructor(private recordService: RecordService) {
    this.loadRecords();
  }

  loadRecords() {
    this.recordService.getRecords().subscribe(data => {
      this.records = data;
    });
  }

  onAddRecord(newRecord: PatientRecord) {
    this.recordService.addRecord(newRecord).subscribe(() => {
      this.loadRecords(); // Reload records after adding
    });
  }

  onEditRecord(updatedRecord: PatientRecord) {
    if (updatedRecord.id) {
      this.recordService.updateRecord(updatedRecord.id, updatedRecord).subscribe(() => {
        this.loadRecords(); // Reload records after updating
        this.selectedRecord = null; // Clear the selected record
      });
    }
  }

  onSelectRecord(record: PatientRecord) {
    this.selectedRecord = record; // Set the selected record for editing
  }

  onCloseEditModal() {
    this.selectedRecord = null; // Clear the selected record when closing the modal
  }
}
