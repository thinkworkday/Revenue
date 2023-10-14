import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetailNotificationComponent } from './detail-notification/detail-notification.component';
import { NewNotificationComponent } from './new-notification/new-notification.component';
import { NotificationComponent } from './notification.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SuperAdminNotificationsComponent } from './super-admin-notifications/super-admin-notifications.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationComponent,
    children: [
      {
        path: 'super-admin-notifications',
        component: SuperAdminNotificationsComponent
      },
      {
        path: 'publisher-notifications',
        component: NotificationsComponent
      },
      {
        path: 'new-notification',
        component: NewNotificationComponent
      },
      {
        path: 'detail/:id',
        component: DetailNotificationComponent,
        pathMatch: 'full'
      },
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule { }
