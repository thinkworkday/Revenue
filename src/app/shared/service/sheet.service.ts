import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SheetInterface } from '../models/sheet.interface';

const API_SHEET_REPORTING_URL = `${environment.apiUrl}/google-sheet-reporting`;

@Injectable({
    providedIn: 'root',
})

export class SheetService {
    constructor(private http: HttpClient) { }

    add(sheet: SheetInterface): Observable<SheetInterface> {
        return this.http.post<SheetInterface>(`${API_SHEET_REPORTING_URL}/create`, sheet);
    }

    getSheets(): Observable<SheetInterface[]> {
        return this.http.get<SheetInterface[]>(`${API_SHEET_REPORTING_URL}/all-sheets`);
    }

    getSheetData(sheetId: string, startDate: string, endDate: string) {
        return this.http.get(`${API_SHEET_REPORTING_URL}/googlesheet-data/${sheetId}`, { params: { startDate: startDate, endDate: endDate } });
    }

    getOneSheet(sheet: SheetInterface): Observable<SheetInterface> {
        return this.http.get<SheetInterface>(
            API_SHEET_REPORTING_URL + `/get-sheet/${sheet}`
        );
    }

    updateSheet(sheet: SheetInterface): Observable<SheetInterface> {
        return this.http.put<SheetInterface>(
            `${API_SHEET_REPORTING_URL}/update/${sheet._key}`,
            sheet
        );
    }

    deleteSheet(sheetId: string) {
        return this.http.delete(API_SHEET_REPORTING_URL + `/delete/${sheetId}`);
    }
}