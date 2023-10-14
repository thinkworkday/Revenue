import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TagManagementService } from '../tag-management.service';
import { TagInterface } from 'src/app/shared/models/tag.interface';
import { SnackbarService } from 'src/app/shared/service/snackbar.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { ClipboardService } from 'ngx-clipboard';
import { CopyAdserverComponent } from '../copy-adserver/copy-adserver.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { TagsService } from 'src/app/shared/service/tags.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  loadingIndicator = true;
  rows: Array<TagInterface>;
  //Local Storage Company
  localStorageCompany: any;
  hidden = false;
  publishertempList: any = []
  publisherList: any = [];
  publisherValue = "";
  advertiserValue = "";

  tagList = [];
  reportingProviderList = []
  reportingProviderHandleList = [];
  constructor(
    private tagService: TagManagementService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private _snackBarService: SnackbarService,
    private userService: UsersService,
    private notification: NotificationService,
    private clipboardService: ClipboardService,
    public dialog: MatDialog,
    private tagFilterService: TagsService,
  ) {
  }

  ngOnInit(): void {
    this.localStorageCompany = this.getSelectedCompanyFromLocalStorage();
    //access page part
    if (!this.localStorageCompany) {
      this.hidden = true;
      this.notification.showError("Please select your Company!", "")
    } else {
      this.hidden = false;
    }
    this.getAllTags();
    this.getPublisherAll();
    this.getAdvertiserList();
    this.reportingProviderHandleList = this.reportingProviderList.sort((a, b) => (a.viewValue > b.viewValue) ? 1 : -1);
    this.cdr.detectChanges();
  }
  // copyTagId(tagId: any) {
  //   this.clipboardService.copyFromContent(tagId);
  //   this.notification.showSuccess(`Copied Tag ID ${tagId}`, "");
  // }
  editTag(tagID: any) {
    this.router.navigateByUrl('/tag-management/edit/' + tagID);
  }
  deleteTag(id: any) {
    if (window.confirm('Do you want to go ahead?')) {
      this.tagService.deleteTag(id).subscribe((res) => {
        this.getAllTags();
        this._snackBarService.info('Deleted a tag');
      })
    }
  }
  getAdvertiserList() {
    if (this.localStorageCompany) {
      this.tagFilterService.getTagAdvertiser(this.localStorageCompany.split('/')[1]).subscribe(res => {
        for (var resAdvertiser of res) {
          let adverValue = resAdvertiser.advertiser;
          let viewValue = "";
          if (adverValue.includes("-")) {
            viewValue = adverValue.replace("-", " ").split(" ")[0].charAt(0).toUpperCase() + adverValue.replace("-", " ").split(" ")[0].slice(1) + " " + adverValue.replace("-", " ").split(" ")[1].charAt(0).toUpperCase() + adverValue.replace("-", " ").split(" ")[1].slice(1);
          } else {
            viewValue = adverValue.charAt(0).toUpperCase() + adverValue.slice(1);
          }
          this.reportingProviderList.push({
            value: adverValue, 
            viewValue: viewValue
          });
        }
      });
      
    } 
    
  }

  getPublisherAll() {
    this.userService.getPublisherAll().subscribe(data => {
      // console.log(data);
      if (this.localStorageCompany) {
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

  handleChangeProvider(event: any) {
    this.advertiserValue = event;
    if (this.advertiserValue && this.publisherValue) {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.advertiser == this.advertiserValue && tag.publisher[0]['_key'] == this.publisherValue);
    } else if (this.advertiserValue && !this.publisherValue) {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.advertiser == this.advertiserValue);
    } else {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany);
    }

    this.cdr.detectChanges();
  }

  handleChangePublisher(event: any) {
    this.publisherValue = event;
    if (this.advertiserValue && this.publisherValue) {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.publisher[0]['_key'] == this.publisherValue && tag.advertiser == this.advertiserValue);
    } else if (!this.advertiserValue && this.publisherValue) {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany && tag.publisher[0]['_key'] == this.publisherValue);
    } else {
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany);
    }

    this.cdr.detectChanges();
  }

  getAllTags() {
    this.tagService.getAllTags().subscribe((x) => {
      this.tagList = x
      this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany)
      this.loadingIndicator = false;
      this.cdr.detectChanges();
    });
  }
  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }
  handleAddTag() {
    this.router.navigateByUrl('/tag-management/new');
  }

  handleReset() {
    this.publisherValue = "";
    this.advertiserValue = "";
    this.rows = this.tagList.filter(tag => tag.company[0]['_id'] == this.localStorageCompany);
    this.cdr.detectChanges();
  }
  openClipBoardDialog(tagKey: any) {
    let tagdialog = this.dialog
      .open(CopyAdserverComponent, {
        height: 'auto',
        width: '650px',
        data: tagKey,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          console.log(response)
        }
      });
  }
}
