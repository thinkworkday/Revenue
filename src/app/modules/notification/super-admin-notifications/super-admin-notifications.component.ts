import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { NotificationSendService } from 'src/app/shared/service/notificationSend.service';
import { SnackbarService } from 'src/app/shared/service/snackbar.service';

@Component({
  selector: 'app-super-admin-notifications',
  templateUrl: './super-admin-notifications.component.html',
  styleUrls: ['./super-admin-notifications.component.scss']
})
export class SuperAdminNotificationsComponent implements OnInit {
  hidden = false;
  loadingIndicator = true;
  rows: any = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private notificationSendService: NotificationSendService, 
    private notification: NotificationService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getSuperadminNotifications();
  }

  getSuperadminNotifications() {
    this.notificationSendService.superAdminNotificatoins().subscribe({
      next: (res: any) => {
        this.rows = res;
        this.loadingIndicator = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.notification.showError(e.error, "")
      }
    });
  }

  viewNotification(subId: string) {
    this.router.navigateByUrl('/notifications/detail/' + subId);
  }

  clearNotification(id: any) {
    this.notificationSendService.clearNotification(id).subscribe({
      next: (res: any) => {
        this.notification.showSuccess('Cleared a Notification!', "");
        this.getSuperadminNotifications();
      },
      error: (e) => {
        this.notification.showError(e.error, "");
      }
    })
  }

}
