import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { NotificationSendService } from 'src/app/shared/service/notificationSend.service';
import { UsersService } from 'src/app/shared/service/users.service';

@Component({
  selector: 'app-new-notification',
  templateUrl: './new-notification.component.html',
  styleUrls: ['./new-notification.component.scss']
})
export class NewNotificationComponent implements OnInit {
  hidden = false;
  newNotificationFG: FormGroup;
  receiverData: any = [];

  receiverMultiFilterCtrl: FormControl = new FormControl();
  filteredReceiverDataMulti = new ReplaySubject(1);
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  protected _onDestroy = new Subject();
  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private cdr: ChangeDetectorRef,
    private notificationSendService: NotificationSendService,
    private notificationService: NotificationService
  ) {
    this.getReceiver();
  }

  ngOnInit(): void {
    this.newNotificationFG = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      role: ['', Validators.required],
      receivers: ['']
    });
  }

  getReceiver() {
    this.userService.getReceiverAll().subscribe(data => {
      console.log(data);
      data.map((d) => {
        this.receiverData.push({
          id: d._id,
          name: d.fullname, 
          role: d.role
        })
      });
      this.filteredReceiverDataMulti.next(this.receiverData.slice());

      this.receiverMultiFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterReceiverMulti();
        });
      this.cdr.detectChanges();
    })
  }

  handleRole(event: any) {
    let tempReceiverData = this.receiverData.filter(data => data.role == parseInt(event.value));
    this.filteredReceiverDataMulti.next(tempReceiverData.slice());
    this.receiverMultiFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterReceiverMulti();
        });
  }

  filterReceiverMulti() {
    if (!this.receiverData) {
      return;
    }

    let search = this.receiverMultiFilterCtrl.value;
    if (!search) {
      this.filteredReceiverDataMulti.next(this.receiverData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredReceiverDataMulti.next(
      this.receiverData.filter(receiver => receiver.name.toLowerCase().indexOf(search) > -1)
    );
  }

  submitNotification() { 
    if (this.newNotificationFG.valid) {
      this.notificationSendService.sendNotitication(this.newNotificationFG.value).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.formGroupDirective.resetForm();
            this.notificationService.showSuccess("You sent notification!", "")
          }
        },
        error: (e) => {
          this.notificationService.showError("Error while sending notification!", "")
        }
      })
    }
  }

}
