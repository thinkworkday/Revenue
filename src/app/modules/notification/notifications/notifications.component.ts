import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { NotificationSendService } from 'src/app/shared/service/notificationSend.service';
import { UsersService } from 'src/app/shared/service/users.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  hidden = false;
  loadingIndicator = true;
  rows: any = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UsersService,
    private notificationSendService: NotificationSendService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.getPublisherNotifications();
  }

  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  getPublisherNotifications() {
    let notificationArr = [];
    this.notificationSendService.publisherNotificatoins().subscribe({
      next: (res: any) => {
        res.map((d) => {
          notificationArr.push({
            _key: d._key,
            _id: d._id,
            content: d.content,
            title: d.title,
            createdAt: d.createdAt,
            sender: d.sender[0],
            status: d.status
          })
        })
        
        this.rows = notificationArr;
        this.loadingIndicator = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.notification.showError(e.error, "")
      }
    })
  }

  viewNotification(notificationID: string) {
    this.router.navigateByUrl('/notifications/detail/' + notificationID);
  }

}
