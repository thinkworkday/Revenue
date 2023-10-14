import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllSheetsComponent } from './all-sheets/all-sheets.component';
import { GoogleSheetReportingComponent } from './google-sheet-reporting.component';
import { NewSheetComponent } from './new-sheet/new-sheet.component';
import { EditSheetComponent } from './edit-sheet/edit-sheet.component';
import { SheetComponent } from './sheet/sheet.component';

const routes: Routes = [
  {
    path: '',
    component: GoogleSheetReportingComponent,
    children: [
      {
        path: 'all-sheets',
        component: AllSheetsComponent,
      },
      {
        path: 'new-sheet',
        component: NewSheetComponent,
      },
      {
        path: 'edit/:id',
        component: EditSheetComponent,
        pathMatch: 'full'
      },
      {
        path: 'sheet/:sheetId',
        component: SheetComponent,
        pathMatch: 'full'
      },
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoogleSheetReportingRoutingModule { }
