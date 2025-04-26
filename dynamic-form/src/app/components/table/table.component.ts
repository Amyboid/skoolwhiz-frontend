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
  @Input() records: PatientRecord[] = [];
  @Output() edit = new EventEmitter<PatientRecord>();

  constructor(private recordService: RecordService) {}

  ngOnInit() {}

  deleteRecord(id: number) {
    this.recordService.deleteRecord(id).subscribe(() => {
      // Optionally, you can emit an event to notify the parent to refresh records
    });
  }

  editRecord(record: PatientRecord) {
    this.edit.emit(record);
  }
}
