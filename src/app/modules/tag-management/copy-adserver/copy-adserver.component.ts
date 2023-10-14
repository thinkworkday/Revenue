import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TagManagementService } from '../../tag-management/tag-management.service';
import { ClipboardService } from 'ngx-clipboard';
import { NotificationService } from 'src/app/shared/service/notification.service';

@Component({
  selector: 'app-copy-adserver',
  templateUrl: './copy-adserver.component.html',
  styleUrls: ['./copy-adserver.component.scss']
})
export class CopyAdserverComponent implements OnInit {
  //Variable for loading indicator
  loadingIndicator = true;
  adServerUrl: any;
  tagKey: any;

  constructor(
    private tagManagementService: TagManagementService,
    private cdr: ChangeDetectorRef,
    private clipboardService: ClipboardService,
    public dialogRef: MatDialogRef<CopyAdserverComponent>,
    private notification: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data)
    this.tagKey = this.data;
    this.getTagData(this.tagKey);
  }

  getTagData(tagKey: any) {
    this.tagManagementService.getOneTag(tagKey).subscribe((response) => {
      this.loadingIndicator = false;
      console.log(response)
      this.adServerUrl = response.initialURL;
      this.cdr.detectChanges();
    });
  }
  decodeURI(url) {
    return decodeURI(url);
  }

  /**
  * close()
  * * Closes the dialog and does not make any changes.
  *
  */
  close() {
    this.dialogRef.close();
  }

  openClipBoardDialog(initialURL: any, tagKeyVal: any) {
    var initialUri = `${decodeURI(initialURL)}&tid=${tagKeyVal}`;
    this.clipboardService.copyFromContent(initialUri);
    this.notification.showSuccess(`Copied Aderser InitialURL ${initialUri}`, "");
  }

}
