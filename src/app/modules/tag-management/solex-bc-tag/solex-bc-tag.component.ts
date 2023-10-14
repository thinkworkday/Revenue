import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TagInterface } from 'src/app/shared/models/tag.interface';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { SnackbarService } from 'src/app/shared/service/snackbar.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { TagManagementService } from '../tag-management.service';

@Component({
  selector: 'app-solex-bc-tag',
  templateUrl: './solex-bc-tag.component.html',
  styleUrls: ['./solex-bc-tag.component.scss']
})
export class SolexBcTagComponent implements OnInit {

  loadingIndicator = true;
  rows: Array<TagInterface>;
  //Local Storage Company
  localStorageCompany: any;
  hidden = false;
  publishertempList: any = []
  publisherList: any = [];
  publisherValue = "";

  tagList = [];
  constructor(
    private tagService: TagManagementService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private _snackBarService: SnackbarService,
    private userService: UsersService,
    private notification: NotificationService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.localStorageCompany = this.getSelectedCompanyFromLocalStorage();
    //access page part
    if(!this.localStorageCompany){
      this.hidden = true;
      this.notification.showError("Please select your Company!", "")
    } else {
      this.hidden = false;
    }
    this.getSolexBCTags();
    this.getPublisherSolexBC();
    this.cdr.detectChanges();
  }

  getSolexBCTags() {
    this.tagService.getAllTags().subscribe((x) => {
      this.tagList = x;
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.advertiser == "solex-bc")
      this.loadingIndicator = false;
      this.cdr.detectChanges();
    });
  }

  getPublisherSolexBC() {
    this.userService.getPublisherAll().subscribe(data => {
      if(this.localStorageCompany) {
        this.publishertempList = data.filter(userData => userData.companies.includes(this.localStorageCompany));
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

  editTag(tagID:any) {
    this.router.navigateByUrl('/tag-management/edit/' + tagID);
  }
  deleteTag(id: any) {
    if(window.confirm('Do you want to go ahead?')) {
      this.tagService.deleteTag(id).subscribe((res) => {
        this.getSolexBCTags();
        this._snackBarService.info('Deleted a tag');
      })
    } 
  }
  handleAddTag() {
    this.router.navigateByUrl('/tag-management/new');
  }

  handleReset() {
    this.publisherValue = "";
    this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.advertiser == "solex-bc");
    this.cdr.detectChanges();
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  handleChangePublisher(event:any) {
    this.publisherValue = event;
    if (this.publisherValue) {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.publisher[0]['_key'] == this.publisherValue && tag.advertiser == "solex-bc");
    } else {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.advertiser == "solex-bc");
    }

    this.cdr.detectChanges();
  }

}
