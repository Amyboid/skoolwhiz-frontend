import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface PatientRecord {
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
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getRecords(): Observable<PatientRecord[]> {
    return this.http.get<PatientRecord[]>(this.apiUrl).pipe(
      catchError(() => of([])))
  }

  addRecord(record: PatientRecord): Observable<PatientRecord> {
    return this.http.post<PatientRecord>(this.apiUrl, record);
  }

  updateRecord(id: number, record: PatientRecord): Observable<PatientRecord> {
    return this.http.put<PatientRecord>(`${this.apiUrl}/${id}`, {
      ...record,
      id // Ensure ID is included in the body for JSON Server
    });
  }

  deleteRecords(ids: number[]): Observable<void> {
    const params = new HttpParams().set('id', ids.join(','));
    return this.http.delete<void>(this.apiUrl, { params });
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkUid(uid: string): Observable<boolean> {
    if (!uid) return of(true);
    
    return this.http.get<PatientRecord[]>(`${this.apiUrl}?uid=${uid}`).pipe(
      map(records => records.length === 0),
      catchError(() => of(false))
    );
  }
}