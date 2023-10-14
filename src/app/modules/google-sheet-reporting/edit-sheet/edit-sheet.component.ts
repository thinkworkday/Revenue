import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { GoogleSheetReportingService } from '../google-sheet-reporting.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/shared/service/users.service';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { SheetInterface } from 'src/app/shared/models/sheet.interface';

@Component({
  selector: 'app-edit-sheet',
  templateUrl: './edit-sheet.component.html',
  styleUrls: ['./edit-sheet.component.scss']
})
export class EditSheetComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  editSheetFG: FormGroup;
  sheet: SheetInterface;
  hidden = false;
  localStorageCompany: any;
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UsersService,
    private notification: NotificationService,
    private googleSheetReportingServie: GoogleSheetReportingService,
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

    this.editSheetFG = new FormGroup({
      sheetName: new FormControl('', Validators.required),
      sheetUrl: new FormControl('', Validators.required),
    });

    if (this.route.snapshot.params.id) {
      this.googleSheetReportingServie.getOneSheet(this.route.snapshot.params.id).subscribe(res => {
        this.sheet = res;

        this.editSheetFG.setValue({
          sheetName: res['sheetName'],
          sheetUrl: res['sheetUrl'],
        });
      })
    }

  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  submitHandle() {
    this.editSheetFG.markAllAsTouched();
    if (this.editSheetFG.valid) {
      this.sheet = { ...this.sheet, ...this.editSheetFG.value };
      this.googleSheetReportingServie.updateSheet(this.sheet).subscribe(res => {
        this.notification.showSuccess('Successfully updated the Sheet.', "");
      }, (err) => {
        this.notification.showError(`Error updating sheet: ${err.statusText}`, "");
      })
    }
  }

}
