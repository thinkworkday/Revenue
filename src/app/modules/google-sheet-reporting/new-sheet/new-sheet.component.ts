import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { GoogleSheetReportingService } from '../google-sheet-reporting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-sheet',
  templateUrl: './new-sheet.component.html',
  styleUrls: ['./new-sheet.component.scss']
})
export class NewSheetComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  sheetFG: FormGroup;
  hidden = false;
  localStorageCompany: any;

  constructor(
    private userService: UsersService,
    private googleSheetReportingServie: GoogleSheetReportingService,
    private router: Router,
    private notification: NotificationService,
  ) {
    this.localStorageCompany = this.getSelectedCompanyFromLocalStorage();
  }

  ngOnInit(): void {
    //access page part
    if (!this.localStorageCompany) {
      this.hidden = true;
      this.notification.showError("Please select your Company!", "")
    } else {
      this.hidden = false;
    }

    this.sheetFG = new FormGroup({
      sheetName: new FormControl('', Validators.required),
      sheetUrl: new FormControl('', Validators.required),
    });
  }

  submitHandle() {
    this.sheetFG.markAllAsTouched();
    if (this.sheetFG.valid) {
      this.googleSheetReportingServie.addSheet(this.sheetFG.value).subscribe(res => {
        this.notification.showSuccess('Successfully added a new Sheet.', "");
        this.router.navigate(['/google-sheet-reporting/all-sheets']);
      }, (err) => {
        this.notification.showError(err.error, "");
      })
    }
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

}
