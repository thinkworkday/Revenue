import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApiDocumentationComponent } from './api-documentation.component';
import { SuperadminDocumentationComponent } from './superadmin-documentation/superadmin-documentation.component';
import { PublisherDocumentationComponent } from './publisher-documentation/publisher-documentation.component';

const routes: Routes = [
  {
    path: '',
    component: ApiDocumentationComponent,
    children: [
      {
        path: 'superadmin-documentation',
        component: SuperadminDocumentationComponent
      },
      {
        path: 'publisher-documentation',
        component: PublisherDocumentationComponent
      },
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApiDocumentationRoutingModule { }
