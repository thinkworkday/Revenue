import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagManagementRoutingModule } from './tag-management-routing.module';
import { TagManagementComponent } from './tag-management.component';
import { NewTagComponent } from './new-tag/new-tag.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SnackbarService } from 'src/app/shared/service/snackbar.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatIconModule } from '@angular/material/icon';
import { TagsComponent } from './tags/tags.component';
import { EditTagComponent } from './edit-tag/edit-tag.component';
import { TemplateNameComponent } from './template-name/template-name.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TemplateComponent } from './template/template.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { CopyAdserverComponent } from './copy-adserver/copy-adserver.component';
import { PerionTagComponent } from './perion-tag/perion-tag.component';
import { LyonsTagComponent } from './lyons-tag/lyons-tag.component';
import { RubiTagComponent } from './rubi-tag/rubi-tag.component';
import { ApptitudeTagComponent } from './apptitude-tag/apptitude-tag.component';
import { VerizonDirectTagComponent } from './verizon-direct-tag/verizon-direct-tag.component';
import { SolexBcTagComponent } from './solex-bc-tag/solex-bc-tag.component';
import { System1TagComponent } from './system1-tag/system1-tag.component';
import { HopkinTagComponent } from './hopkin-tag/hopkin-tag.component';

@NgModule({
  declarations: [TagManagementComponent, NewTagComponent, TagsComponent, EditTagComponent, TemplateNameComponent, TemplateComponent, CopyAdserverComponent, PerionTagComponent, LyonsTagComponent, RubiTagComponent, ApptitudeTagComponent, VerizonDirectTagComponent, SolexBcTagComponent, System1TagComponent, HopkinTagComponent],
  imports: [
    CommonModule,
    TagManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
    NgxDatatableModule,
    MatDialogModule,
    InlineSVGModule,
  ],
  providers: [SnackbarService],
  entryComponents: [NewTagComponent],
})
export class TagManagementModule { }
