import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { NotificationSendService } from 'src/app/shared/service/notificationSend.service';

@Component({
  selector: 'app-detail-notification',
  templateUrl: './detail-notification.component.html',
  styleUrls: ['./detail-notification.component.scss']
})
export class DetailNotificationComponent implements OnInit {
  notificationId: string;
  notificationData: any;
  constructor(
    private route: ActivatedRoute,
    private notificationSendService: NotificationSendService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async routeParams => {
      if (routeParams.id) {
        this.notificationId = routeParams.id;
        this.getNotificationDetail();
      }
    });
    
  }

  getNotificationDetail() {
    this.notificationSendService.getDetailNotificatoin(this.notificationId).subscribe({
      next: (res: any) => {
        this.notificationData = res;
        this.cdr.detectChanges();
      }, 
      error: (e) => {
        this.notification.showError(e.error, "")
      } 
    })
  }

}
