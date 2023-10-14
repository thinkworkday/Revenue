import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SheetInterface } from 'src/app/shared/models/sheet.interface';
import { SheetService } from 'src/app/shared/service/sheet.service';

@Injectable({
    providedIn: 'root',
})

export class GoogleSheetReportingService {
    constructor(private sheetService: SheetService) {}

    addSheet(sheet: SheetInterface): Observable<SheetInterface> {
        return this.sheetService.add(sheet);
    }

    getSheetList(): Observable<SheetInterface[]> {
        return this.sheetService.getSheets();
    }

    getOneSheet(sheet: SheetInterface): Observable<SheetInterface> {
        return this.sheetService.getOneSheet(sheet);
    }

    updateSheet(sheet: SheetInterface): Observable<SheetInterface> {
        return this.sheetService.updateSheet(sheet);
    }

    deleteSheet(sheetId: string) {
        return this.sheetService.deleteSheet(sheetId);
    }

    getSheetData(sheetId: string, startDate: string, endDate: string) {
        return this.sheetService.getSheetData(sheetId, startDate, endDate);
    }
}