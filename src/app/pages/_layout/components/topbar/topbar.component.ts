import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { LayoutService } from '../../../../_metronic/core';
import { AuthService } from '../../../../modules/auth/_services/auth.service';
import { UserModel } from '../../../../modules/auth/_models/user.model';
import KTLayoutQuickSearch from '../../../../../assets/js/layout/extended/quick-search';
import KTLayoutQuickNotifications from '../../../../../assets/js/layout/extended/quick-notifications';
import KTLayoutQuickActions from '../../../../../assets/js/layout/extended/quick-actions';
import KTLayoutQuickCartPanel from '../../../../../assets/js/layout/extended/quick-cart';
import KTLayoutQuickPanel from '../../../../../assets/js/layout/extended/quick-panel';
import KTLayoutQuickUser from '../../../../../assets/js/layout/extended/quick-user';
import KTLayoutHeaderTopbar from '../../../../../assets/js/layout/base/header-topbar';
import { KTUtil } from '../../../../../assets/js/components/util';
import { NotificationSendService } from 'src/app/shared/service/notificationSend.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, AfterViewInit {
  user$: Observable<UserModel>;
  // tobbar extras
  extraSearchDisplay: boolean;
  extrasSearchLayout: 'offcanvas' | 'dropdown';
  extrasNotificationsDisplay: boolean;
  extrasNotificationsLayout: 'offcanvas' | 'dropdown';
  extrasQuickActionsDisplay: boolean;
  extrasQuickActionsLayout: 'offcanvas' | 'dropdown';
  extrasCartDisplay: boolean;
  extrasCartLayout: 'offcanvas' | 'dropdown';
  extrasQuickPanelDisplay: boolean;
  extrasLanguagesDisplay: boolean;
  extrasUserDisplay: boolean;
  extrasUserLayout: 'offcanvas' | 'dropdown';
  publisherRows: any = [];
  superAdminRows: any = [];
  unreadCounter = 0;
  unreadSuperCounter = 0;
  unreadAdminCounter = 0;
  currentUser: any;
  constructor(
    private layout: LayoutService, 
    private auth: AuthService,
    private notificationSendService: NotificationSendService,
    private cdr: ChangeDetectorRef,
  ) {
    this.user$ = this.auth.currentUserSubject.asObservable();
  }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUserValue;
    // topbar extras
    this.extraSearchDisplay = this.layout.getProp('extras.search.display');
    this.extrasSearchLayout = this.layout.getProp('extras.search.layout');
    this.extrasNotificationsDisplay = this.layout.getProp(
      'extras.notifications.display'
    );
    this.extrasNotificationsLayout = this.layout.getProp(
      'extras.notifications.layout'
    );
    this.extrasQuickActionsDisplay = this.layout.getProp(
      'extras.quickActions.display'
    );
    this.extrasQuickActionsLayout = this.layout.getProp(
      'extras.quickActions.layout'
    );
    this.extrasCartDisplay = this.layout.getProp('extras.cart.display');
    this.extrasCartLayout = this.layout.getProp('extras.cart.layout');
    this.extrasLanguagesDisplay = this.layout.getProp(
      'extras.languages.display'
    );
    this.extrasUserDisplay = this.layout.getProp('extras.user.display');
    this.extrasUserLayout = this.layout.getProp('extras.user.layout');
    this.extrasQuickPanelDisplay = this.layout.getProp(
      'extras.quickPanel.display'
    );
    this.getSuperadminNotifications();
    this.getPublisherNotifications();
    this.notificationSendService.getMessage().subscribe((notifications:any)=> {
      const myNotifications = notifications.notifications.filter(res => res.receiver == this.currentUser._id)
      if (myNotifications.length) {
        if (this.currentUser.role !== 1) {
          this.unreadCounter = this.unreadCounter + myNotifications.length;
          this.cdr.detectChanges();
        } else {
          this.unreadSuperCounter = this.unreadSuperCounter + myNotifications.length;
          this.cdr.detectChanges();
        }
        
      }
      console.log(notifications,this.unreadCounter, this.currentUser, 'ddddd')
      
    })
  }

  handleNotification() {
    if (this.currentUser.role == 1) {
      this.getSuperadminNotifications();
    } else {
      this.getPublisherNotifications();
    }
  }

  getPublisherNotifications() {
    let notificationArr = [];
    this.unreadCounter = 0;
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

  ngAfterViewInit(): void {
    KTUtil.ready(() => {
      // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      // Add 'implements AfterViewInit' to the class.
      if (this.extraSearchDisplay && this.extrasSearchLayout === 'offcanvas') {
        KTLayoutQuickSearch.init('kt_quick_search');
      }

      if (
        this.extrasNotificationsDisplay &&
        this.extrasNotificationsLayout === 'offcanvas'
      ) {
        // Init Quick Notifications Offcanvas Panel
        KTLayoutQuickNotifications.init('kt_quick_notifications');
      }

      if (
        this.extrasQuickActionsDisplay &&
        this.extrasQuickActionsLayout === 'offcanvas'
      ) {
        // Init Quick Actions Offcanvas Panel
        KTLayoutQuickActions.init('kt_quick_actions');
      }

      if (this.extrasCartDisplay && this.extrasCartLayout === 'offcanvas') {
        // Init Quick Cart Panel
        KTLayoutQuickCartPanel.init('kt_quick_cart');
      }

      if (this.extrasQuickPanelDisplay) {
        // Init Quick Offcanvas Panel
        KTLayoutQuickPanel.init('kt_quick_panel');
      }

      if (this.extrasUserDisplay && this.extrasUserLayout === 'offcanvas') {
        // Init Quick User Panel
        KTLayoutQuickUser.init('kt_quick_user');
      }

      // Init Header Topbar For Mobile Mode
      KTLayoutHeaderTopbar.init('kt_header_mobile_topbar_toggle');
    });
  }
}
