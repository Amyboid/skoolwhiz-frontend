import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface PatientRecord  {
  id?: number;
  name: string;
  uid: string;
  phone: string;
  address?: string;
  height?: number;
  weight?: number;
  picture?: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private apiUrl = 'http://localhost:3000/records';

  constructor(private http: HttpClient) {}

  getRecords(): Observable<PatientRecord []> {
    return this.http.get<PatientRecord []>(this.apiUrl);
  }

  addRecord(record: PatientRecord): Observable<PatientRecord > {
    return this.http.post<PatientRecord>(this.apiUrl, record);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Check if UID already exists in the database
  checkUid(uid: string): Observable<boolean> {
    return this.http.get<PatientRecord[]>(`${this.apiUrl}?uid=${uid}`).pipe(
      map((records) => records.length === 0),  // If length is 0, the UID is unique
      catchError((error) => {
        console.error('Error checking UID:', error); // Log the error
        return of(false);  // Return false if there's an error (considered not unique)
      })
    );
  }

  updateRecord(id: number, record: PatientRecord): Observable<PatientRecord> {
    return this.http.put<PatientRecord>(`${this.apiUrl}/${id}`, record);
  }
  
}
