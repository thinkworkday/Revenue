import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SheetInterface } from 'src/app/shared/models/sheet.interface';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { GoogleSheetReportingService } from '../google-sheet-reporting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-sheets',
  templateUrl: './all-sheets.component.html',
  styleUrls: ['./all-sheets.component.scss']
})
export class AllSheetsComponent implements OnInit {
  loadingIndicator = true;
  rows: Array<SheetInterface>;
  hidden = false;
  //Local Storage Company
  localStorageCompany: any;
  constructor(
    private googlesheetService: GoogleSheetReportingService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UsersService,
    private notification: NotificationService,
  ) { }

  ngOnInit(): void {
    this.localStorageCompany = this.getSelectedCompanyFromLocalStorage();
    //access page part
    if (!this.localStorageCompany) {
      this.hidden = true;
      this.notification.showError("Please select your Company!", "")
    } else {
      this.hidden = false;
    }

    this.googlesheetService.getSheetList().subscribe((res) => {
      this.rows = res;
      this.loadingIndicator = false;
      this.cdr.detectChanges();
    }, (err) => {
      this.notification.showError(err.error, "");
    });
  }

  editSheet(sheetId: string) {
    this.router.navigateByUrl('/google-sheet-reporting/edit/' + sheetId);
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  deleteSheet(id: any) {
    if(window.confirm('Do you want to go ahead?')) {
      this.googlesheetService.deleteSheet(id).subscribe(x => {
        this.notification.showSuccess('Successfully deleted sheet.', "");
        this.router.navigate(['/google-sheet-reporting/all-sheets']).then(() => {
          window.location.reload();
        });
      }, (err) => {
        this.notification.showError(`Error deleting sheet: ${err.statusText}`, "");
      });
    } 
  }

}
