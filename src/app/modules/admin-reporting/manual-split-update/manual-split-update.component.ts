import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/_services/auth.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { ManualUpdateService } from 'src/app/shared/service/admin-stats/update.service';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { CompanyManagementService } from 'src/app/modules/company-management/company-management.service';
import * as moment from 'moment';
import { TagManagementService } from '../../tag-management/tag-management.service';

interface preSetDateRanges {
  value: string;
  viewValue: string;
}

interface PreSetDateRange {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-manual-split-update',
  templateUrl: './manual-split-update.component.html',
  styleUrls: ['./manual-split-update.component.scss']
})
export class ManualSplitUpdateComponent implements OnInit {
  manaulUpFG: FormGroup;
  reportProviderData: any = [];
  tagData: any =[];
  selectedTagData: any =[];
  reportUpdateTitle = 'Report Split Update'
  selectedTagName = '';
  preSetDateRanges: preSetDateRanges[];
  range: FormGroup;
  selectedRange: PreSetDateRange;

  preSelectValue: String;

  preSelectDates: any;
  companySelected: any;
  currentUser: any;

  constructor(
    private manualUpdateService: ManualUpdateService,
    private fb: FormBuilder,
    private companyService: CompanyManagementService,
    private authService: AuthService,
    private userService: UsersService,
    private notification: NotificationService,
    private tagService: TagManagementService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.companySelected = this.getSelectedCompanyLocalStorage();
  }

  ngOnInit(): void {
    this.getReportingProviderList();
    this.getAllTags();
    this.manaulUpFG = this.fb.group({
      reportType: new FormControl('', Validators.required),
      tag: new FormControl('', Validators.required),
      preSelectValue: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
    })
    //Get the all PRESELECT ranges
    this.preSetDateRanges = this.getDateRanges();
    this.range = new FormGroup({
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required)
    });

    //Selected range of date picker
    this.selectedRange = {
      startDate: '',
      endDate: '',
    };

    //Starting value of mat select
    this.preSelectValue = 'last7days';

    //Gets the true start and end date values in date format
    this.preSelectDates = this.getPreSetDateRange(this.preSelectValue);

    //Manually updates the mat date picker with new start and end dates
    this.updateDatePickerRange(
      this.preSelectDates.startDate,
      this.preSelectDates.endDate
    );
  }
  //Gets the Selected Company from Local Storage
  getSelectedCompanyLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  getAllTags() {
    this.tagService.getAllTags().subscribe((response) => {
      var resData = [];
      if(this.companySelected) {
        resData = response.filter(res => res.company[0]['_id'] == this.companySelected);
      }
      resData.map(res => {
        this.tagData.push({
          value: res._id,
          viewValue: res.name,
          advertiser: res.advertiser

        })
      });
      this.selectedTagData = this.tagData;
      this.cdr.detectChanges();
    });
    
  }

  handleTag(event: any) {
    this.selectedTagName = this.tagData.filter((tag: { value: any; }) => tag.value == event.value)[0].viewValue;
  }
  //get report Provider List
  getReportingProviderList() {
    if (this.companySelected) {
      this.companyService.getOneCompany(this.companySelected.split('/')[1]).subscribe(res => {
        res.reportingProviders.map(report => {
          this.reportProviderData.push({
            value: report.reportingProvider,
            viewValue: report.reportingProvider
          })
        });
      });
    }
  }
  //Updates the date picker range manually
  //Params startDate and endDate
  updateDatePickerRange(startDate: moment.MomentInput, endDate: moment.MomentInput) {
    this.manaulUpFG.patchValue({
      startDate: moment(startDate, 'MM-DD-YYYY').toDate(),
      endDate: moment(endDate, 'MM-DD-YYYY').toDate(),
    });
    this.range.patchValue({
      startDate: moment(startDate, 'MM-DD-YYYY').toDate(),
      endDate: moment(endDate, 'MM-DD-YYYY').toDate(),
    });
  }
  //Grabbing the mat selector options
  private getDateRanges() {
    return [
      { value: 'today', viewValue: 'Today' },
      { value: 'yesterday', viewValue: 'Yesterday' },
      { value: 'last7days', viewValue: 'Last 7 Days' },
      { value: 'last30days', viewValue: 'Last 30 Days' },
      { value: 'monthToDate', viewValue: 'Month to Date' },
      { value: 'lastMonth', viewValue: 'Last Month' },
      { value: 'custom', viewValue: 'Custom' },
    ];
  }
  //Monitors mat selector, if changed (and not custom). updates the actual date picker
  onPreSetRangeSelectChange(selection: any) {
    if (selection.value !== 'custom') {
      this.preSelectValue = selection.value;
      this.preSelectDates = this.getPreSetDateRange(this.preSelectValue);

      //Updates the date picker range manually
      this.updateDatePickerRange(
        this.preSelectDates.startDate,
        this.preSelectDates.endDate
      );
    }
  }
  //Convert mat selector options and return actual dates
  private getPreSetDateRange(selection: any) {
    let dateFormat = 'MM-DD-YYYY';
    switch (selection) {
      case 'today':
        return {
          startDate: moment().utc().startOf('day').format(dateFormat),
          endDate: moment().utc().endOf('day').format(dateFormat),
        };
      case 'yesterday':
        return {
          startDate: moment()
            .subtract(1, 'days')
            .utc()
            .startOf('day')
            .format(dateFormat),
          endDate: moment()
            .subtract(1, 'days')
            .utc()
            .endOf('day')
            .format(dateFormat),
        };
      case 'last7days':
        return {
          startDate: moment()
            .subtract(7, 'days')
            .utc()
            .startOf('day')
            .format(dateFormat),
          endDate: moment().utc().endOf('day').format(dateFormat),
        };
      case 'last30days':
        return {
          startDate: moment()
            .subtract(30, 'days')
            .utc()
            .startOf('day')
            .format(dateFormat),
          endDate: moment().utc().endOf('day').format(dateFormat),
        };
      case 'monthToDate':
        return {
          startDate: moment()
            .startOf('month')
            .utc()
            .startOf('day')
            .format(dateFormat),
          endDate: moment().utc().endOf('day').format(dateFormat),
        };
      case 'lastMonth':
        return {
          startDate: moment()
            .subtract(1, 'months')
            .startOf('month')
            .utc()
            .startOf('day')
            .format(dateFormat),
          endDate: moment()
            .utc()
            .subtract(1, 'months')
            .endOf('month')
            .format(dateFormat),
        };
    }
  }
  handleReport(event: { value: string; }) {
    if (event.value.length > 0) {
      var typeName = event.value.toLowerCase().replace(/\b[a-z]/g, function (letter) {
        return letter.toUpperCase();
      });
      this.reportUpdateTitle = `${typeName} Split Update`;
      
      this.selectedTagData = this.tagData.filter((tag: { advertiser: string; }) => tag.advertiser == event.value);
      this.cdr.detectChanges();
    }
  }

  onReportSubmit() {
    if (this.manaulUpFG.valid) {
      this.manaulUpFG.addControl('company', new FormControl('', Validators.required));
      this.manaulUpFG.patchValue({
        company: this.companySelected,
      });
      //var reportTypeValue = this.manaulUpFG.value['reportType'];
      this.manualUpdateService.updateManualSplit(this.manaulUpFG.value).subscribe((response) => {
        var checkExist = this.isObjectEmpty(response);
        if (!checkExist) {
          this.notification.showSuccess(`${this.selectedTagName} data splits  successfully updated!`, "")
        } else {
          this.notification.showWarning(`${this.selectedTagName} data not existed!`, "")
        }
      })
    }
  }
  isObjectEmpty(obj: {}) {
    return Object.keys(obj).length === 0;
  }
  //Detects when datepicker change is updated
  public changeDatePicker(): void {
    if (this.range.valid) {

      this.selectedRange.startDate = this.range.value.startDate;
      this.selectedRange.endDate = this.range.value.endDate;

      this.manaulUpFG.patchValue({
        startDate: moment(this.range.value.startDate, 'MM-DD-YYYY').toDate(),
        endDate: moment(this.range.value.endDate, 'MM-DD-YYYY').toDate(),
      });

      this.preSelectValue = 'custom';
    }
  }
}
