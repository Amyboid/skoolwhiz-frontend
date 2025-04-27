import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { RecordService, PatientRecord } from '../../record.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class TableComponent implements OnInit {

  headers: string[] = [
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
  
  @Input() records: PatientRecord[] = [];
  @Output() edit = new EventEmitter<PatientRecord>();
  @Output() delete = new EventEmitter<PatientRecord>();

  constructor(private recordService: RecordService) {}

  ngOnInit() {}

  deleteRecord(record: PatientRecord) {
    this.delete.emit(record)
  }

  editRecord(record: PatientRecord) {
    this.edit.emit(record);
  }
}
