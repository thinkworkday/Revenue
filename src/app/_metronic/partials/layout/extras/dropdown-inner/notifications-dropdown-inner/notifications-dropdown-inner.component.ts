import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/_services/auth.service';
import { NotificationSendService } from 'src/app/shared/service/notificationSend.service';
import { LayoutService } from '../../../../../core';

@Component({
  selector: 'app-notifications-dropdown-inner',
  templateUrl: './notifications-dropdown-inner.component.html',
  styleUrls: ['./notifications-dropdown-inner.component.scss'],
})
export class NotificationsDropdownInnerComponent implements OnInit {
  extrasNotificationsDropdownStyle: 'light' | 'dark' = 'dark';
  currentUser: any;
  @Input() public superAdminRows: any;
  @Input() public publisherRows: any;
  @Input() public unreadSuperCounter: any;
  @Input() public unreadCounter: any;
  activeTabId:
    | 'topbar_notifications_notifications'
    | 'topbar_notifications_events'
    | 'topbar_notifications_logs' = 'topbar_notifications_notifications';
  constructor(
    private layout: LayoutService,
    private notificationSendService: NotificationSendService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.superAdminRows = this.getSuperAdminRows(this.superAdminRows);
    this.publisherRows = this.getPublisherRows(this.publisherRows);
    this.unreadSuperCounter = this.getUnreadSuperCounter(this.unreadSuperCounter);
    this.unreadCounter = this.getUnreadCounter(this.unreadCounter);
    this.extrasNotificationsDropdownStyle = this.layout.getProp(
      'extras.notifications.dropdown.style'
    );
  }

  setActiveTabId(tabId) {
    this.activeTabId = tabId;
  }

  getSuperAdminRows(superAdminRows: any) {
		if (!superAdminRows) return;
		
		var result = superAdminRows;
		return result;
	}

  getPublisherRows(publisherRows: any) {
		// our logic to group the posts by category
		if (!publisherRows) return;
		
		var result = publisherRows;

		return result;
	}

  getUnreadCounter(unreadCounter: any) {
		// our logic to group the posts by category
		if (!unreadCounter) return;
		
		var result = unreadCounter;

		return result;
	}

  getUnreadSuperCounter(unreadSuperCounter: any) {
		// our logic to group the posts by category
		if (!unreadSuperCounter) return;
		
		var result = unreadSuperCounter;

		return result;
	}

  getActiveCSSClasses(tabId) {
    if (tabId !== this.activeTabId) {
      return '';
    }
    return 'active show';
  }

  viewNotification(notificationID: string) {
    this.route.params.subscribe(async routeParams => {
      this.router.navigateByUrl('/notifications/detail/' + notificationID);
    });
    if (this.currentUser.role == 1) {
      this.getSuperadminNotifications();
    }
    else {
      this.getPublisherNotifications();
    }
  }

  clearSuperNotification(notificationID: string) {
    this.notificationSendService.clearSuperNotification(notificationID).subscribe({
      next: (res: any) => {
        if (this.currentUser.role == 1) {
          this.getSuperadminNotifications();
        }
        else {
          this.getPublisherNotifications();
        }
      },
      error: (e) => {
        console.log(e.error);
      }
    })
  }

  clearNotification(notificationID: string) {
    this.notificationSendService.clearNotification(notificationID).subscribe({
      next: (res: any) => {
        if (this.currentUser.role == 1) {
          this.getSuperadminNotifications();
        }
        else {
          this.getPublisherNotifications();
        }
      },
      error: (e) => {
        console.log(e.error);
      }
    })
  }

  seeAll() {
    if (this.currentUser.role == 1) {
      this.router.navigateByUrl('/notifications/super-admin-notifications');
    }
    else {
      this.router.navigateByUrl('/notifications/publisher-notifications');
    }
  }

  getPublisherNotifications() {
    let notificationArr = [];
    this.notificationSendService.publisherNotificatoins().subscribe({
      next: (res: any) => {
        this.unreadCounter = 0;
        res.map((d) => {
          notificationArr.push({
            _key: d._key,
            _id: d._id,
            content: d.content,
            title: d.title,
            createdAt: d.createdAt,
            sender: d.sender[0],
            status: d.status
          });
          if (!d.status) {
            this.unreadCounter++;
          }
        })
        
        this.publisherRows = notificationArr;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.log(e.error)
      }
    })
  }

  getSuperadminNotifications() {
    let supernotificationArr = [];
    this.unreadSuperCounter = 0;
    this.notificationSendService.superAdminNotificatoins().subscribe({
      next: (res: any) => {
        res.map((d) => {
          supernotificationArr.push({
            _key: d._key,
            _id: d._id,
            content: d.content,
            title: d.title,
            createdAt: d.createdAt,
            sender: d.sender[0],
            status: d.status
          });
          if (typeof d.status === 'boolean' && !d.status) {
            this.unreadSuperCounter++;
          }
        })
        this.superAdminRows = supernotificationArr;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.log(e.error)
      }
    })
  }
}
