import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublisherReportingRoutingModule } from './publisher-reporting-routing.module';
import { PublisherComponent } from './publisher/publisher.component';
import { PublisherReportingComponent } from './publisher-reporting.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [
    PublisherComponent, 
    PublisherReportingComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    PublisherReportingRoutingModule,
    SharedModule,
    NgxDatatableModule
  ],
  providers: [DatePipe, PercentPipe, CurrencyPipe],
  entryComponents: [],
})
export class PublisherReportingModule { }
