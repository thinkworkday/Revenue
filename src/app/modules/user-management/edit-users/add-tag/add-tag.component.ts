import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { UserInterface } from 'src/app/shared/models/user.interface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersService } from 'src/app/shared/service/users.service';
import { TagsService } from 'src/app/shared/service/tags.service';
import { TagManagementService } from 'src/app/modules/tag-management/tag-management.service';

@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.scss']
})
export class AddTagComponent implements OnInit {
  //Variable for loading indicator
  loadingIndicator = true;

  //Variable for current user
  user: UserInterface;
  companySelected: any;
  userTags: string[];
  reportProviderData: any = [];
  allTags: any = [];

  constructor(
    private tagService: TagsService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddTagComponent>,
    private userService: UsersService,
    private tagManagementService: TagManagementService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.companySelected = this.getSelectedCompanyLocalStorage();
  }

  ngOnInit(): void {
    //Sets current user to data input variable
    this.user = this.data;
    //Sets userAdvertisers to user's current tags
    this.userTags = this.user.tagsId[this.companySelected] ? this.user.tagsId[this.companySelected] : [];

    //Gets ALL companies available
    this.getAllTags();
    //this.getReportingProviderList();
  }
  //Gets the Selected Company from Local Storage
  getSelectedCompanyLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  checkAllCheckBox(event: any) {
    this.allTags.forEach((x: { checked: any; }) => x.checked = event.target.checked);
  }

  isAllCheckBoxChecked() {
    return this.allTags.every(p => p.checked);
  }

  //get report Provider List
  // getReportingProviderList() {
  //   if (this.companySelected) {
  //     this.tagService.getTagUserAdvertiser(this.user._key).subscribe(res => {
  //       for (var resAdvertiser of res) {
  //         this.reportProviderData.push({
  //           value: resAdvertiser.advertiser,
  //           viewValue: resAdvertiser.advertiser,
  //         })
  //       }
  //       this.cdr.detectChanges();
  //     });
  //   }
  // }

  getAllTags() {
    this.tagManagementService.getAllTags().subscribe((response) => {
      this.loadingIndicator = false;
      let tempTags = [];
      let currentCompanyTag = response.filter(current => current.company[0]["_id"] == this.companySelected);
      currentCompanyTag.map(res => {
        tempTags.push({
          _id: res._id,
          tagName: res.name,
          publisher: res.publisher[0]["fullname"],
          advertiser: res.advertiser,
          checked: this.userTags.includes(res._id)
        })
      })
      this.allTags = tempTags;
      this.cdr.detectChanges();
    });
  }
  handleSubmit(): void {
    let userNewTags = [];
    this.allTags.map(data => {
      if (data.checked) {
        userNewTags.push(data._id);
      }
    });
    this.userTags = userNewTags;
    this.user.tagsId = [...this.userTags];
    this.dialogRef.close({ user: this.user });
  }

  close() {
    this.dialogRef.close();
  }

}
