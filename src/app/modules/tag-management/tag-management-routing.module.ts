import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewTagComponent } from './new-tag/new-tag.component';
import { EditTagComponent } from './edit-tag/edit-tag.component';
import { TagsComponent } from './tags/tags.component';
import { TagManagementComponent } from './tag-management.component';
import { TemplateComponent } from './template/template.component';
import { PerionTagComponent } from './perion-tag/perion-tag.component';
import { LyonsTagComponent } from './lyons-tag/lyons-tag.component';
import { RubiTagComponent } from './rubi-tag/rubi-tag.component';
import { ApptitudeTagComponent } from './apptitude-tag/apptitude-tag.component';
import { VerizonDirectTagComponent } from './verizon-direct-tag/verizon-direct-tag.component';
import { SolexBcTagComponent } from './solex-bc-tag/solex-bc-tag.component';
import { System1TagComponent } from './system1-tag/system1-tag.component';
import { HopkinTagComponent } from './hopkin-tag/hopkin-tag.component';

const routes: Routes = [
  {
    path: '',
    component: TagManagementComponent,
    children: [
      {
        path: 'all',
        component: TagsComponent
      },
      {
        path: 'perion',
        component: PerionTagComponent
      },
      {
        path: 'lyons',
        component: LyonsTagComponent
      },
      {
        path: 'rubi',
        component: RubiTagComponent
      },
      {
        path: 'apptitude',
        component: ApptitudeTagComponent
      },
      {
        path: 'hopkins',
        component: HopkinTagComponent
      },
      {
        path: 'verizon-direct',
        component: VerizonDirectTagComponent
      },
      {
        path: 'solex-bc',
        component: SolexBcTagComponent
      },
      {
        path: 'system1',
        component: System1TagComponent
      },
      {
        path: 'templates',
        component: TemplateComponent
      },
      {
        path: 'new',
        component: NewTagComponent
      },
      {
        path: 'edit/:id',
        component: EditTagComponent,
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
export class TagManagementRoutingModule { }
