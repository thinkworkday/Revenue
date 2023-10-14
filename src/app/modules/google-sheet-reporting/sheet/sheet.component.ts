import { ChangeDetectorRef, Component, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/shared/service/users.service';
import { GoogleSheetReportingService } from '../google-sheet-reporting.service';
import { NotificationService } from 'src/app/shared/service/notification.service';

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.scss']
})
export class SheetComponent implements AfterViewInit {
  @ViewChild('expandableTable') table: any;
  loadingIndicator = true;
  selectedCompany: any;
  sheetData: any = [];
  googlesheetId: string;
  range = {
    startDate: '',
    endDate: '',
  };

  constructor(
    private route: ActivatedRoute,
    private userService: UsersService,
    private cdr: ChangeDetectorRef,
    private googleSheetReportingService: GoogleSheetReportingService,
    private notification: NotificationService
  ) {
    this.selectedCompany = this.getSelectedCompanyFromLocalStorage();
   }

   async ngAfterViewInit() {
    this.loadingIndicator = true;
    this.route.params.subscribe(async routeParams => {
      this.googlesheetId = routeParams.sheetId;
      this.sheetData = [];
      this.sheetData = await this.getSheetInformation(this.googlesheetId, this.range.startDate, this.range.endDate);
      this.cdr.markForCheck();
    });
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  public async sheetFiltering(range: any) {
    this.loadingIndicator = true;
    this.range = range;
    this.sheetData = [];
    this.route.params.subscribe(async routeParams => {
      this.sheetData = [];
      this.sheetData = await this.getSheetInformation(routeParams.sheetId, this.range.startDate, this.range.endDate);
      this.cdr.markForCheck();
    })
  }

  getSheetInformation(googlesheetId, startDate, endDate) {
    this.loadingIndicator = true;
    return this.googleSheetReportingService.getSheetData(googlesheetId, startDate, endDate).toPromise().then((res) => {
      this.loadingIndicator = false;
      return res;
    }).catch((error) => {
      return error;
    });
  }

}
