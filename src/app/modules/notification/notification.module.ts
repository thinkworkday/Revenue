import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationComponent } from './notification.component';
import { NewNotificationComponent } from './new-notification/new-notification.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { DetailNotificationComponent } from './detail-notification/detail-notification.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatIconModule } from '@angular/material/icon';
import { InlineSVGModule } from 'ng-inline-svg';
import { SuperAdminNotificationsComponent } from './super-admin-notifications/super-admin-notifications.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DateAsAgoPipe } from 'src/app/shared/pipes/date-as-ago.pipe';

@NgModule({
  declarations: [NotificationComponent, NewNotificationComponent, NotificationsComponent, DetailNotificationComponent, SuperAdminNotificationsComponent, DateAsAgoPipe],
  imports: [
    CommonModule,
    NotificationRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgxMatSelectSearchModule,
    InlineSVGModule.forRoot()
  ], 
  providers: [],
  entryComponents: [NewNotificationComponent], 
  exports: [DateAsAgoPipe]
})
export class NotificationModule { }
