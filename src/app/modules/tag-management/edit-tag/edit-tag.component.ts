import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from 'src/app/shared/service/snackbar.service';
import { TagManagementService } from '../tag-management.service';
import { TagInterface } from 'src/app/shared/models/tag.interface';
import { CompanyService } from 'src/app/shared/service/companies.service';
import { CompanyInterface } from 'src/app/shared/models/company.interface';
import { AuthService } from 'src/app/modules/auth/_services/auth.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { ClipboardService } from 'ngx-clipboard';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormGroupDirective,
} from '@angular/forms';

@Component({
  selector: 'app-edit-tag',
  templateUrl: './edit-tag.component.html',
  styleUrls: ['./edit-tag.component.scss']
})
export class EditTagComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  updateTagFG: FormGroup;
  //User Companies
  userCompanies: Array<CompanyInterface>;
  companyList: any = []
  adServerUrlList: any = []
  publisherList: any = []
  publishertempList: any = []
  advertiserList: any = []
  companySelected = "";
  statTypes: any;
  rotationTypes: any;
  paramTypes: any;
  url: String;
  adserverURL = new URL('http://3.227.27.140/search');
  company: String;
  countries: any;
  versions: any;
  versionList: any = [];
  edgeVersions: any;
  operaVersions: any;
  browserVersions: any;
  internetExplorers: any;
  tag: TagInterface;
  selectBrowserStatus: any;
  selectDeviceTypeStatus: any;
  selectVersionStatus: any;
  selectCountryStatus: any;
  hidden = false;
  tagId: any;

  constructor(
    private route: ActivatedRoute,
    private tagManagementService: TagManagementService,
    private fb: FormBuilder,
    private _snackBarService: SnackbarService,
    private notification: NotificationService,
    router: Router,
    private auth: AuthService,
    private userService: UsersService,
    private companyService: CompanyService,
    private changeDetectorRefs: ChangeDetectorRef,
    private clipboardService: ClipboardService,
  ) {

  }

  ngOnInit(): void {

    this.updateTagFG = this.fb.group({
      name: ['', Validators.required],
      nickName: ['', Validators.required],
      publisher: ['', Validators.required],
      advertiser: ['', Validators.required],
      advertiserProvider: ['', Validators.required],
      browserStatus: ['', Validators.required],
      browser: ['', Validators.required],
      deviceTypeStatus: ['', Validators.required],
      deviceType: ['', Validators.required],
      versionStatus: ['', Validators.required],
      version: ['', Validators.required],
      countryStatus: ['', Validators.required],
      country: ['', Validators.required],
      company: ['', Validators.required],
      adServerUrl: ['', Validators.required],
      statType: ['', Validators.required],
      numFilterTag: ['ExactValue', Validators.required],
      numLimit: ['1000', Validators.required],
      numSubid: [''],
      numSplit: ['70', Validators.required],
      subids: this.fb.array([]),
      rotationType: ['', Validators.required],
      tagUrls: this.fb.array([]),
      initialURL: [this.adserverURL, Validators.required],
    });
    this.statTypes = this.getStatTypes();
    this.rotationTypes = this.getRotationTypes();
    this.paramTypes = this.getParamTypes();
    this.countries = this.getCountries();

    this.browserVersions = this.getVersions();

    this.getPublisherAll();
    //get Company
    this.companySelected = this.getSelectedCompanyFromLocalStorage();
    //access page part
    if (!this.companySelected) {
      this.hidden = true;
      this.notification.showError("Please select your Company!", "")
    } else {
      this.hidden = false;
    }
    const currentUserInfo = this.auth.currentUserValue;
    this.companyService.getUserCompanies(currentUserInfo.companies).subscribe(companyResult => {
      companyResult.map(company => {
        this.companyList.push({
          value: company._id,
          viewValue: company.name
        });
        if (company._id == this.companySelected) {
          company.adServerUrls.map(url => {
            this.adServerUrlList.push({
              value: url['adServerUrl'],
              viewValue: url['adServerUrl']
            });
          });
          //advertiser GET
          company.reportingProviders.map(reporting => {
            this.advertiserList.push({
              value: reporting.reportingProvider,
              viewValue: reporting.reportingProvider
            });
          });
        }
      })
    });

    //Get the current tag to edit
    if (this.route.snapshot.params.id) {
      this.tagId = this.route.snapshot.params.id;
      this.tagManagementService.getOneTag(this.route.snapshot.params.id).subscribe(x => {
        this.tag = x;
        var browserVal = [];
        var deviceTypeVal = [];
        var versionVal = [];
        var countryVal = [];
        this.adserverURL = new URL('http://3.227.27.140/search');
        for (var bval of x['browser'].toString().split(",")) {
          browserVal.push(bval)
        }

        for (var dval of x['deviceType'].toString().split(",")) {
          deviceTypeVal.push(dval)
        }
        for (var vval of x['version'].toString().split(",")) {
          versionVal.push(vval)
        }
        for (var cval of x['country'].toString().split(",")) {
          countryVal.push(cval)
        }
        x['subids'].map((item) => {
          this.subids.push(this.fb.group(item));
        });

        let tagUrlsList = [];
        tagUrlsList = x['tagUrls'];
        tagUrlsList.map(itemTag => {
          const temp = this.fb.array([]);
          itemTag.param.map(ip => {
            temp.push(this.fb.group(ip));
          });
          this.tagUrls.push(this.fb.group({
            finalUrl: itemTag.finalUrl,
            percentage: itemTag.percentage,
            param: temp,
          }));
        });
        // this.updateTagFG.patchValue(x);
        this.updateTagFG.patchValue({
          name: x['name'],
          nickName: x['nickName'],
          company: x['company'],
          advertiser: x['advertiser'],
          advertiserProvider: x['advertiserProvider'],
          publisher: x.publisher ? x.publisher['_key'] : '',
          browserStatus: x['browserStatus'],
          browser: browserVal,
          deviceTypeStatus: x['deviceTypeStatus'],
          deviceType: deviceTypeVal,
          countryStatus: x['countryStatus'],
          country: countryVal,
          versionStatus: x['versionStatus'],
          version: versionVal,
          adServerUrl: x['adServerUrl'],
          statType: x['statType'],
          numFilterTag: 'ExactValue',
          numLimit: '1000',
          numSubid: '',
          numSplit: '70',
          subids: x['subids'],
          rotationType: x['rotationType'],
          tagUrls: x['tagUrls'],
          initialURL: x['initialURL'],
        });
      });
    }
    this.changeDetectorRefs.detectChanges();
  }
  openClipBoardDialog(initUrl: any) {
    var initialUri = `${decodeURI(initUrl)}&tid=${this.tagId}`;
    this.clipboardService.copyFromContent(initialUri);
    this.notification.showSuccess(`Copied Aderser InitialURL ${initialUri}`, "");
  }
  getPublisherAll() {
    this.userService.getPublisherAll().subscribe(data => {
      // console.log(data);
      if (this.companySelected) {
        this.publishertempList = data.filter(userData => userData.companies.includes(this.companySelected));
      } else {
        this.publishertempList = data;
      }
      this.publishertempList.map(publisher => {
        this.publisherList.push({
          value: publisher._key,
          viewValue: publisher.fullname
        })
      })
    });
  }
  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }
  //Update the tag onto the database
  updateTag() {
    this.updateTagFG.markAllAsTouched();
    if (this.updateTagFG.valid) {
      this.tag = { ...this.tag, ...this.updateTagFG.value };
      this.tagManagementService.updateOneTag(this.tag).subscribe(res => {
        this._snackBarService.info('Updated a tag');
      }, (err) => {
        this._snackBarService.info(err.error);
      },
      )
    }
  }
  get subids() {
    return this.updateTagFG.controls['subids'] as FormArray;
  }
  newSubids(): FormGroup {
    return this.fb.group({
      subid: ['', Validators.required],
      limit: ['', Validators.required],
      split: ['', Validators.required],
      filterTag: ['', Validators.required],
    })
  }

  addSubid(event) {
    this.subids.push(this.newSubids());
  }
  removeSubid(i: number) {
    this.subids.removeAt(i);
  }
  //Detects when URL is pasted into the field
  //https://google.com/search?hspart=brandclick&hsimp=yhs-calm&p=flowers
  getUrlParams(finalUrl, tagIndex) {
    //Resets the URL params on every change
    this.deleteValueOfFormControl('param', tagIndex);
    if (this.isValidURL(finalUrl)) {
      finalUrl = new URL(finalUrl);
      for (var key of finalUrl.searchParams.keys()) {
        let value = finalUrl.searchParams.get(key);
        this.addParamsToUrlForm(key, value, tagIndex);
      }
    } else {
      return;
    }
  }

  newTagUrl(): FormGroup {
    return this.fb.group({
      finalUrl: ['https://google.com/search', Validators.required],
      percentage: '',
      param: this.fb.array([]),
    });
  }

  addTagUrl() {
    this.tagUrls.push(this.newTagUrl());
  }

  //Gets the value of any form Array
  //Returns a form array
  get tagUrls() {
    return this.updateTagFG.controls['tagUrls'] as FormArray;
  }

  //Deletes value of any given form control
  deleteValueOfFormControl(controlName, tagIndex) {
    this.tagUrlParams(tagIndex).clear();
  }

  removeTagUrl(tagIndex: number) {
    let subInitialURL = new URL(this.updateTagFG.get("initialURL")?.value);
    this.tagUrlParams(tagIndex).controls.forEach((element, index) => {
      subInitialURL.searchParams.delete(element.value.key)
    });
    this.updateTagFG.patchValue({ initialURL: subInitialURL });
    this.tagUrls.removeAt(tagIndex);
  }

  tagUrlParams(tagIndex: number): FormArray {
    return this.tagUrls.at(tagIndex).get('param') as FormArray;
  }

  //Updates the original parameters that will be received and sent on the first server request
  //Example: domain.com/search?subid={{dynamic}}&q={{dynamic}}&search=[bing]
  updateInitialParams(param, tagIndex, index) {
    console.log('Updating Initial Params');
    if (param.value === 'static') {
      console.log('static!', tagIndex, index);
      this.tagUrlParams(tagIndex).controls[index]
        .get('initialParam')
        .setValue(this.tagUrlParams(tagIndex).controls[index].get('value').value);
      this.createInitialURL(tagIndex);
    } else {
      this.tagUrlParams(tagIndex).controls[index]
        .get('initialParam')
        .setValue('');
    }
  }

  //Checks to see if initialParam mat input field has been touched and updates initial URL
  updateInitialParamURL(value, tagIndex, paramsIndex) {
    if (this.tagUrlParams(tagIndex).controls[paramsIndex].get('paramType').value === 'dynamic') {
      this.createInitialURL(tagIndex);
    }
  }

  //Builds the initial URL from the paramaters
  createInitialURL(tagIndex) {
    console.log('Updating URL');
    let subInitialURL = new URL(this.updateTagFG.get("initialURL")?.value);
    this.tagUrlParams(tagIndex).controls.forEach((element, index) => {
      if (element.value.paramType === 'dynamic') {
        subInitialURL.searchParams.delete(element.value.key)
        subInitialURL.searchParams.append(
          element.value.key,
          '{{' + element.value.initialParam + '}}'
        );
        this.updateTagFG.patchValue({ initialURL: subInitialURL });
      } else if (element.value.paramType === 'static') {
        this.tagUrlParams(tagIndex).controls.forEach((element, index) => {
          subInitialURL.searchParams.delete(element.value.key)
        });
        this.updateTagFG.patchValue({ initialURL: subInitialURL });
        // this.initialURL.searchParams.append(
        //   element.value.key,
        //   element.value.value
        // );
      } else {
      }
    });
  }

  //Decodes the URL for the Angular Template
  decodeURL(url) {
    return decodeURI(url);
  }

  //Adds key/valuew to FormArray 'Params'
  addParamsToUrlForm(key, value, tagIndex) {
    let paramForm = this.fb.group({
      key: [key, Validators.required],
      value: [value, Validators.required],
      paramType: ['', Validators.required],
      initialParam: ['', Validators.required],
    });
    this.tagUrlParams(tagIndex).push(paramForm);
  }

  //Checks to see if URL entered is valid
  //If URL is valid return true
  //Else if URL is invalid return false and throw mat-error
  private isValidURL(url) {
    try {
      let finalUrl = new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }
  getBrowers(event) {
    if (event.value.length > 0) {
      let vTemp: any[] = [];
      if (event.value.includes('Any')) {
        this.browserVersions = this.versionList
      } else {
        for (var e of event.value) {
          let filterdata = this.versionList.filter(function (version: any) {
            return version.value.includes(e)
          })
          filterdata.map((filter: any) => {
            vTemp.push(filter);
          })
        }
        this.browserVersions = vTemp;
      }

    } else {
      this.browserVersions = []
    }
  }
  //update the tag as a template
  updateTemplate() { }

  //Gets different ways a tag can display stats
  private getStatTypes() {
    return [
      { value: 'rpm', viewValue: 'RPM Based' },
      { value: 'subid', viewValue: 'Sub-ID Based' },
    ];
  }

  //Gets Country List
  private getCountries() {
    return [
      { viewValue: 'Afghanistan', value: 'AF' },
      { viewValue: 'Åland Islands', value: 'AX' },
      { viewValue: 'Albania', value: 'AL' },
      { viewValue: 'Algeria', value: 'DZ' },
      { viewValue: 'American Samoa', value: 'AS' },
      { viewValue: 'AndorrA', value: 'AD' },
      { viewValue: 'Angola', value: 'AO' },
      { viewValue: 'Anguilla', value: 'AI' },
      { viewValue: 'Antarctica', value: 'AQ' },
      { viewValue: 'Antigua and Barbuda', value: 'AG' },
      { viewValue: 'Argentina', value: 'AR' },
      { viewValue: 'Armenia', value: 'AM' },
      { viewValue: 'Aruba', value: 'AW' },
      { viewValue: 'Australia', value: 'AU' },
      { viewValue: 'Austria', value: 'AT' },
      { viewValue: 'Azerbaijan', value: 'AZ' },
      { viewValue: 'Bahamas', value: 'BS' },
      { viewValue: 'Bahrain', value: 'BH' },
      { viewValue: 'Bangladesh', value: 'BD' },
      { viewValue: 'Barbados', value: 'BB' },
      { viewValue: 'Belarus', value: 'BY' },
      { viewValue: 'Belgium', value: 'BE' },
      { viewValue: 'Belize', value: 'BZ' },
      { viewValue: 'Benin', value: 'BJ' },
      { viewValue: 'Bermuda', value: 'BM' },
      { viewValue: 'Bhutan', value: 'BT' },
      { viewValue: 'Bolivia', value: 'BO' },
      { viewValue: 'Bosnia and Herzegovina', value: 'BA' },
      { viewValue: 'Botswana', value: 'BW' },
      { viewValue: 'Bouvet Island', value: 'BV' },
      { viewValue: 'Brazil', value: 'BR' },
      { viewValue: 'British Indian Ocean Territory', value: 'IO' },
      { viewValue: 'Brunei Darussalam', value: 'BN' },
      { viewValue: 'Bulgaria', value: 'BG' },
      { viewValue: 'Burkina Faso', value: 'BF' },
      { viewValue: 'Burundi', value: 'BI' },
      { viewValue: 'Cambodia', value: 'KH' },
      { viewValue: 'Cameroon', value: 'CM' },
      { viewValue: 'Canada', value: 'CA' },
      { viewValue: 'Cape Verde', value: 'CV' },
      { viewValue: 'Cayman Islands', value: 'KY' },
      { viewValue: 'Central African Republic', value: 'CF' },
      { viewValue: 'Chad', value: 'TD' },
      { viewValue: 'Chile', value: 'CL' },
      { viewValue: 'China', value: 'CN' },
      { viewValue: 'Christmas Island', value: 'CX' },
      { viewValue: 'Cocos (Keeling) Islands', value: 'CC' },
      { viewValue: 'Colombia', value: 'CO' },
      { viewValue: 'Comoros', value: 'KM' },
      { viewValue: 'Congo', value: 'CG' },
      { viewValue: 'Congo, The Democratic Republic of the', value: 'CD' },
      { viewValue: 'Cook Islands', value: 'CK' },
      { viewValue: 'Costa Rica', value: 'CR' },
      { viewValue: 'Cote D\'Ivoire', value: 'CI' },
      { viewValue: 'Croatia', value: 'HR' },
      { viewValue: 'Cuba', value: 'CU' },
      { viewValue: 'Cyprus', value: 'CY' },
      { viewValue: 'Czech Republic', value: 'CZ' },
      { viewValue: 'Denmark', value: 'DK' },
      { viewValue: 'Djibouti', value: 'DJ' },
      { viewValue: 'Dominica', value: 'DM' },
      { viewValue: 'Dominican Republic', value: 'DO' },
      { viewValue: 'Ecuador', value: 'EC' },
      { viewValue: 'Egypt', value: 'EG' },
      { viewValue: 'El Salvador', value: 'SV' },
      { viewValue: 'Equatorial Guinea', value: 'GQ' },
      { viewValue: 'Eritrea', value: 'ER' },
      { viewValue: 'Estonia', value: 'EE' },
      { viewValue: 'Ethiopia', value: 'ET' },
      { viewValue: 'Falkland Islands (Malvinas)', value: 'FK' },
      { viewValue: 'Faroe Islands', value: 'FO' },
      { viewValue: 'Fiji', value: 'FJ' },
      { viewValue: 'Finland', value: 'FI' },
      { viewValue: 'France', value: 'FR' },
      { viewValue: 'French Guiana', value: 'GF' },
      { viewValue: 'French Polynesia', value: 'PF' },
      { viewValue: 'French Southern Territories', value: 'TF' },
      { viewValue: 'Gabon', value: 'GA' },
      { viewValue: 'Gambia', value: 'GM' },
      { viewValue: 'Georgia', value: 'GE' },
      { viewValue: 'Germany', value: 'DE' },
      { viewValue: 'Ghana', value: 'GH' },
      { viewValue: 'Gibraltar', value: 'GI' },
      { viewValue: 'Greece', value: 'GR' },
      { viewValue: 'Greenland', value: 'GL' },
      { viewValue: 'Grenada', value: 'GD' },
      { viewValue: 'Guadeloupe', value: 'GP' },
      { viewValue: 'Guam', value: 'GU' },
      { viewValue: 'Guatemala', value: 'GT' },
      { viewValue: 'Guernsey', value: 'GG' },
      { viewValue: 'Guinea', value: 'GN' },
      { viewValue: 'Guinea-Bissau', value: 'GW' },
      { viewValue: 'Guyana', value: 'GY' },
      { viewValue: 'Haiti', value: 'HT' },
      { viewValue: 'Heard Island and Mcdonald Islands', value: 'HM' },
      { viewValue: 'Holy See (Vatican City State)', value: 'VA' },
      { viewValue: 'Honduras', value: 'HN' },
      { viewValue: 'Hong Kong', value: 'HK' },
      { viewValue: 'Hungary', value: 'HU' },
      { viewValue: 'Iceland', value: 'IS' },
      { viewValue: 'India', value: 'IN' },
      { viewValue: 'Indonesia', value: 'ID' },
      { viewValue: 'Iran, Islamic Republic Of', value: 'IR' },
      { viewValue: 'Iraq', value: 'IQ' },
      { viewValue: 'Ireland', value: 'IE' },
      { viewValue: 'Isle of Man', value: 'IM' },
      { viewValue: 'Israel', value: 'IL' },
      { viewValue: 'Italy', value: 'IT' },
      { viewValue: 'Jamaica', value: 'JM' },
      { viewValue: 'Japan', value: 'JP' },
      { viewValue: 'Jersey', value: 'JE' },
      { viewValue: 'Jordan', value: 'JO' },
      { viewValue: 'Kazakhstan', value: 'KZ' },
      { viewValue: 'Kenya', value: 'KE' },
      { viewValue: 'Kiribati', value: 'KI' },
      { viewValue: 'Korea, Democratic People\'S Republic of', value: 'KP' },
      { viewValue: 'Korea, Republic of', value: 'KR' },
      { viewValue: 'Kuwait', value: 'KW' },
      { viewValue: 'Kyrgyzstan', value: 'KG' },
      { viewValue: 'Lao People\'S Democratic Republic', value: 'LA' },
      { viewValue: 'Latvia', value: 'LV' },
      { viewValue: 'Lebanon', value: 'LB' },
      { viewValue: 'Lesotho', value: 'LS' },
      { viewValue: 'Liberia', value: 'LR' },
      { viewValue: 'Libyan Arab Jamahiriya', value: 'LY' },
      { viewValue: 'Liechtenstein', value: 'LI' },
      { viewValue: 'Lithuania', value: 'LT' },
      { viewValue: 'Luxembourg', value: 'LU' },
      { viewValue: 'Macao', value: 'MO' },
      { viewValue: 'Macedonia, The Former Yugoslav Republic of', value: 'MK' },
      { viewValue: 'Madagascar', value: 'MG' },
      { viewValue: 'Malawi', value: 'MW' },
      { viewValue: 'Malaysia', value: 'MY' },
      { viewValue: 'Maldives', value: 'MV' },
      { viewValue: 'Mali', value: 'ML' },
      { viewValue: 'Malta', value: 'MT' },
      { viewValue: 'Marshall Islands', value: 'MH' },
      { viewValue: 'Martinique', value: 'MQ' },
      { viewValue: 'Mauritania', value: 'MR' },
      { viewValue: 'Mauritius', value: 'MU' },
      { viewValue: 'Mayotte', value: 'YT' },
      { viewValue: 'Mexico', value: 'MX' },
      { viewValue: 'Micronesia, Federated States of', value: 'FM' },
      { viewValue: 'Moldova, Republic of', value: 'MD' },
      { viewValue: 'Monaco', value: 'MC' },
      { viewValue: 'Mongolia', value: 'MN' },
      { viewValue: 'Montserrat', value: 'MS' },
      { viewValue: 'Morocco', value: 'MA' },
      { viewValue: 'Mozambique', value: 'MZ' },
      { viewValue: 'Myanmar', value: 'MM' },
      { viewValue: 'Namibia', value: 'NA' },
      { viewValue: 'Nauru', value: 'NR' },
      { viewValue: 'Nepal', value: 'NP' },
      { viewValue: 'Netherlands', value: 'NL' },
      { viewValue: 'Netherlands Antilles', value: 'AN' },
      { viewValue: 'New Caledonia', value: 'NC' },
      { viewValue: 'New Zealand', value: 'NZ' },
      { viewValue: 'Nicaragua', value: 'NI' },
      { viewValue: 'Niger', value: 'NE' },
      { viewValue: 'Nigeria', value: 'NG' },
      { viewValue: 'Niue', value: 'NU' },
      { viewValue: 'Norfolk Island', value: 'NF' },
      { viewValue: 'Northern Mariana Islands', value: 'MP' },
      { viewValue: 'Norway', value: 'NO' },
      { viewValue: 'Oman', value: 'OM' },
      { viewValue: 'Pakistan', value: 'PK' },
      { viewValue: 'Palau', value: 'PW' },
      { viewValue: 'Palestinian Territory, Occupied', value: 'PS' },
      { viewValue: 'Panama', value: 'PA' },
      { viewValue: 'Papua New Guinea', value: 'PG' },
      { viewValue: 'Paraguay', value: 'PY' },
      { viewValue: 'Peru', value: 'PE' },
      { viewValue: 'Philippines', value: 'PH' },
      { viewValue: 'Pitcairn', value: 'PN' },
      { viewValue: 'Poland', value: 'PL' },
      { viewValue: 'Portugal', value: 'PT' },
      { viewValue: 'Puerto Rico', value: 'PR' },
      { viewValue: 'Qatar', value: 'QA' },
      { viewValue: 'Reunion', value: 'RE' },
      { viewValue: 'Romania', value: 'RO' },
      { viewValue: 'Russian Federation', value: 'RU' },
      { viewValue: 'RWANDA', value: 'RW' },
      { viewValue: 'Saint Helena', value: 'SH' },
      { viewValue: 'Saint Kitts and Nevis', value: 'KN' },
      { viewValue: 'Saint Lucia', value: 'LC' },
      { viewValue: 'Saint Pierre and Miquelon', value: 'PM' },
      { viewValue: 'Saint Vincent and the Grenadines', value: 'VC' },
      { viewValue: 'Samoa', value: 'WS' },
      { viewValue: 'San Marino', value: 'SM' },
      { viewValue: 'Sao Tome and Principe', value: 'ST' },
      { viewValue: 'Saudi Arabia', value: 'SA' },
      { viewValue: 'Senegal', value: 'SN' },
      { viewValue: 'Serbia and Montenegro', value: 'CS' },
      { viewValue: 'Seychelles', value: 'SC' },
      { viewValue: 'Sierra Leone', value: 'SL' },
      { viewValue: 'Singapore', value: 'SG' },
      { viewValue: 'Slovakia', value: 'SK' },
      { viewValue: 'Slovenia', value: 'SI' },
      { viewValue: 'Solomon Islands', value: 'SB' },
      { viewValue: 'Somalia', value: 'SO' },
      { viewValue: 'South Africa', value: 'ZA' },
      { viewValue: 'South Georgia and the South Sandwich Islands', value: 'GS' },
      { viewValue: 'Spain', value: 'ES' },
      { viewValue: 'Sri Lanka', value: 'LK' },
      { viewValue: 'Sudan', value: 'SD' },
      { viewValue: 'SuriviewValue', value: 'SR' },
      { viewValue: 'Svalbard and Jan Mayen', value: 'SJ' },
      { viewValue: 'Swaziland', value: 'SZ' },
      { viewValue: 'Sweden', value: 'SE' },
      { viewValue: 'Switzerland', value: 'CH' },
      { viewValue: 'Syrian Arab Republic', value: 'SY' },
      { viewValue: 'Taiwan, Province of China', value: 'TW' },
      { viewValue: 'Tajikistan', value: 'TJ' },
      { viewValue: 'Tanzania, United Republic of', value: 'TZ' },
      { viewValue: 'Thailand', value: 'TH' },
      { viewValue: 'Timor-Leste', value: 'TL' },
      { viewValue: 'Togo', value: 'TG' },
      { viewValue: 'Tokelau', value: 'TK' },
      { viewValue: 'Tonga', value: 'TO' },
      { viewValue: 'Trinidad and Tobago', value: 'TT' },
      { viewValue: 'Tunisia', value: 'TN' },
      { viewValue: 'Turkey', value: 'TR' },
      { viewValue: 'Turkmenistan', value: 'TM' },
      { viewValue: 'Turks and Caicos Islands', value: 'TC' },
      { viewValue: 'Tuvalu', value: 'TV' },
      { viewValue: 'Uganda', value: 'UG' },
      { viewValue: 'Ukraine', value: 'UA' },
      { viewValue: 'United Arab Emirates', value: 'AE' },
      { viewValue: 'United Kingdom', value: 'GB' },
      { viewValue: 'United States', value: 'US' },
      { viewValue: 'United States Minor Outlying Islands', value: 'UM' },
      { viewValue: 'Uruguay', value: 'UY' },
      { viewValue: 'Uzbekistan', value: 'UZ' },
      { viewValue: 'Vanuatu', value: 'VU' },
      { viewValue: 'Venezuela', value: 'VE' },
      { viewValue: 'Viet Nam', value: 'VN' },
      { viewValue: 'Virgin Islands, British', value: 'VG' },
      { viewValue: 'Virgin Islands, U.S.', value: 'VI' },
      { viewValue: 'Wallis and Futuna', value: 'WF' },
      { viewValue: 'Western Sahara', value: 'EH' },
      { viewValue: 'Yemen', value: 'YE' },
      { viewValue: 'Zambia', value: 'ZM' },
      { viewValue: 'Zimbabwe', value: 'ZW' }
    ]
  }
  //Gets Browser Versions
  private getVersions() {
    this.edgeVersions = [
      { value: "Edge - 102.0.1245.7", viewValue: "Edge - 102.0.1245.7" },
      { value: "Edge - 101.0.1210.10", viewValue: "Edge - 101.0.1210.10" },
      { value: "Edge - 100.0.1185.10", viewValue: "Edge - 100.0.1185.10" },
      { value: "Edge - 99.0.1150.11", viewValue: "Edge - 99.0.1150.11" },
      { value: "Edge - 98.0.1108.23", viewValue: "Edge - 98.0.1108.23" },
      { value: "Edge - 97.0.1072.21", viewValue: "Edge - 97.0.1072.21" },
      { value: "Edge - 96.0.1054.8", viewValue: "Edge - 96.0.1054.8" },
      { value: "Edge - 95.0.1020.9", viewValue: "Edge - 95.0.1020.9" },
      { value: "Edge - 94.0.992.9", viewValue: "Edge - 94.0.992.9" },
      { value: "Edge - 93.0.961.11", viewValue: "Edge - 93.0.961.11" },
      { value: "Edge - 92.0.902.9", viewValue: "Edge - 92.0.902.9" },
      { value: "Edge - 91.0.864.11", viewValue: "Edge - 91.0.864.11" },
      { value: "Edge - 90.0.818.8", viewValue: "Edge - 90.0.818.8" },
      { value: "Edge - 89.0.774.18", viewValue: "Edge - 89.0.774.18" },
      { value: "Edge - 88.0.705.18", viewValue: "Edge - 88.0.705.18" },
    ];
    this.operaVersions = [
      { value: "Opera - 12.15", viewValue: "Opera - 12.15" },
      { value: "Opera - 12.14", viewValue: "Opera - 12.14" },
      { value: "Opera - 12.13", viewValue: "Opera - 12.13" },
      { value: "Opera - 12.12", viewValue: "Opera - 12.12" },
      { value: "Opera - 12.11", viewValue: "Opera - 12.11" },
      { value: "Opera - 12.10", viewValue: "Opera - 12.10" },
      { value: "Opera - 12.10b", viewValue: "Opera - 12.10b" },
      { value: "Opera - 12.02", viewValue: "Opera - 12.02" },
      { value: "Opera - 12.01", viewValue: "Opera - 12.01" },
      { value: "Opera - 12.00", viewValue: "Opera - 12.00" },
      { value: "Opera - 12.00b", viewValue: "Opera - 12.00b" },
      { value: "Opera - 12.00a", viewValue: "Opera - 12.00a" },
      { value: "Opera - 11.64", viewValue: "Opera - 11.64" },
      { value: "Opera - 11.62", viewValue: "Opera - 11.62" },
      { value: "Opera - 11.61", viewValue: "Opera - 11.61" },
      { value: "Opera - 11.60", viewValue: "Opera - 11.60" },
      { value: "Opera - 11.60b", viewValue: "Opera - 11.60b" },
      { value: "Opera - 11.52", viewValue: "Opera - 11.52" },
      { value: "Opera - 11.51", viewValue: "Opera - 11.51" },
      { value: "Opera - 11.50", viewValue: "Opera - 11.50" },
    ];
    this.internetExplorers = [
      { value: "Internet Explorer - 11.0.220", viewValue: "Internet Explorer - 11.0.220" },
      { value: "Internet Explorer - 9.0.195", viewValue: "Internet Explorer - 9.0.195" },
      { value: "Internet Explorer - 8.0.6001.18702", viewValue: "Internet Explorer - 8.0.6001.18702" },
      { value: "Internet Explorer - 6.0 SP1", viewValue: "Internet Explorer - 6.0 SP1" },
      { value: "Internet Explorer - 5.5 SP2", viewValue: "Internet Explorer - 5.5 SP2" },
      { value: "Internet Explorer - 5.01 SP2", viewValue: "Internet Explorer - 5.01 SP2" },
      { value: "Internet Explorer - 5.2.3", viewValue: "Internet Explorer - 5.2.3" },
      { value: "Internet Explorer - 5.1.7", viewValue: "Internet Explorer - 5.1.7" },
      { value: "Internet Explorer - 4.0.1", viewValue: "Internet Explorer - 4.0.1" },
      { value: "Internet Explorer - 2.0.1", viewValue: "Internet Explorer - 2.0.1" },
    ]
    this.versionList.push(
      { value: "Any", viewValue: "Any" }
    );
    //Chrome Version List Get
    this.tagManagementService.getChromeBrowserVersion().subscribe((res: any) => {
      let versionsChromeData = res.slice(0, 30);
      versionsChromeData.map((version: { version: string; }) => {
        this.versionList.push(
          {
            value: "Chrome - " + version.version,
            viewValue: "Chrome - " + version.version
          }
        )
      });
    });
    this.edgeVersions.map((edge: any) => {
      this.versionList.push(edge);
    });

    //FireFox Version List Get
    this.tagManagementService.getFirefoxBrowserVersion().subscribe(res => {
      var firefoxList = [];
      for (var i in res) {
        firefoxList.push(
          {
            value: "Firefox - " + i,
            viewValue: "Firefox - " + i
          }
        )
      }
      firefoxList.slice(firefoxList['length'] - 30, firefoxList['length']).map((version: { version: string; }) => {
        this.versionList.push(
          {
            value: version['value'],
            viewValue: version['viewValue']
          }
        )
      });
    });


    this.internetExplorers.map((internet: any) => {
      this.versionList.push(internet);
    });
    this.operaVersions.map((opera: any) => {
      this.versionList.push(opera);
    });

    return this.versionList;
  }
  //Gets different ways a tag can display stats
  private getRotationTypes() {
    return [
      { value: 'roundRobin', viewValue: 'Round Robin' },
      { value: 'percentage', viewValue: 'Percentage' },
    ];
  }

  private getParamTypes() {
    return [
      { value: 'static', viewValue: 'Static' },
      { value: 'dynamic', viewValue: 'Dynamic' },
    ];
  }
  handleBrowserStatus(event) {
  }
  handleDeviceTypeStatus(event) {
  }
  handleVersionStatus(event) {
  }
  handleCountryStatus(event) {
  }

  addRange() {
    var subList = [];
    var numericId = this.updateTagFG.value['numSubid'];
    if (numericId) {
      if (numericId.includes("-") || numericId.includes("~")) {
        var startNum = parseInt(numericId.split('-')[0] || numericId.split('~')[0]);
        var endNum = parseInt(numericId.split('-')[1] || numericId.split('~')[1]);
        if (startNum < endNum) {
          for (var i = startNum; i <= endNum; i++) {
            subList.push({
              "filterTag": this.updateTagFG.value.numFilterTag,
              "subid": i.toString(),
              "limit": this.updateTagFG.value.numLimit,
              "split": this.updateTagFG.value.numSplit,
            })
          }
        } else if (startNum == endNum) {
          subList.push({
            "filterTag": this.updateTagFG.value.numFilterTag,
            "subid": i.toString(),
            "limit": this.updateTagFG.value.numLimit,
            "split": this.updateTagFG.value.numSplit,
          })
        } else if (startNum > endNum) {
          for (var i = endNum; i <= startNum; i++) {
            subList.push({
              "filterTag": this.updateTagFG.value.numFilterTag,
              "subid": i.toString(),
              "limit": this.updateTagFG.value.numLimit,
              "split": this.updateTagFG.value.numSplit,
            })
          }
        }
      }

      subList.map((sub) => {
        var subidsArr = this.fb.group({
          subid: [sub.subid, Validators.required],
          limit: [sub.limit, Validators.required],
          split: [sub.split, Validators.required],
          filterTag: [sub.filterTag, Validators.required],
        })
        this.subids.push(subidsArr);
      });
    }
    else {
      this.notification.showError("Please fill valid Subid range!", "");
    }

  }
}
