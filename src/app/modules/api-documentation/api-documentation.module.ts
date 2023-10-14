import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiDocumentationRoutingModule } from './api-documentation-routing.module';
import { ApiDocumentationComponent } from './api-documentation.component';
import { PublisherDocumentationComponent } from './publisher-documentation/publisher-documentation.component';
import { SuperadminDocumentationComponent } from './superadmin-documentation/superadmin-documentation.component';


@NgModule({
  declarations: [ApiDocumentationComponent, PublisherDocumentationComponent, SuperadminDocumentationComponent],
  imports: [
    CommonModule,
    ApiDocumentationRoutingModule
  ]
})
export class ApiDocumentationModule { }
