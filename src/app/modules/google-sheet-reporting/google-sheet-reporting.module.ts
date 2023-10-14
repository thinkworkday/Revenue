import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoogleSheetReportingRoutingModule } from './google-sheet-reporting-routing.module';
import { GoogleSheetReportingComponent } from './google-sheet-reporting.component';
import { NewSheetComponent } from './new-sheet/new-sheet.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { InlineSVGModule } from 'ng-inline-svg';
import { MatIconModule } from '@angular/material/icon';
import { AllSheetsComponent } from './all-sheets/all-sheets.component';
import { EditSheetComponent } from './edit-sheet/edit-sheet.component';
import { SheetComponent } from './sheet/sheet.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from 'src/app/shared/modules/shared.module';


@NgModule({
  declarations: [GoogleSheetReportingComponent, NewSheetComponent, AllSheetsComponent, EditSheetComponent, SheetComponent],
  imports: [
    CommonModule,
    GoogleSheetReportingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    NgxDatatableModule,
    SharedModule,
    InlineSVGModule.forRoot()
  ],
  entryComponents: [],
})
export class GoogleSheetReportingModule { }
