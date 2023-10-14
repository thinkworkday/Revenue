import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicAsideMenuConfig } from '../../configs/dynamic-aside-menu.config';
import { AuthService } from 'src/app/modules/auth/_services/auth.service';
import { UserInterface } from 'src/app/shared/models/user.interface';
import { TagsService } from 'src/app/shared/service/tags.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { GoogleSheetReportingService } from 'src/app/modules/google-sheet-reporting/google-sheet-reporting.service';

const emptyMenuConfig = {
  items: []
};

@Injectable({
  providedIn: 'root'
})
export class DynamicAsideMenuService {
  private menuConfigSubject = new BehaviorSubject<any>(emptyMenuConfig);
  menuConfig$: Observable<any>;
  currentUser: UserInterface;
  tagList: any = [];
  selectedCompany: any;
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private tagService: TagsService,
    private googleSheetReportingService: GoogleSheetReportingService,
  ) {
    this.selectedCompany = this.getSelectedCompanyFromLocalStorage();
    this.menuConfig$ = this.menuConfigSubject.asObservable();
    this.currentUser = this.authService.currentUserValue;
    this.loadMenu();
  }

  // Here you able to load your menu from server/data-base/localStorage
  // Default => from DynamicAsideMenuConfig
  private loadMenu() {
    this.setMenu(DynamicAsideMenuConfig);
  }

  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }

  private async setMenu(menuConfig: { items: any; }) {
    let tagsIdList = this.currentUser.tagsId[this.selectedCompany] ? this.currentUser.tagsId[this.selectedCompany] : [];
    this.tagList = await this.tagService.getUserTags(tagsIdList).toPromise();
    let submenuList = [];
    this.tagList.map((tag: any) => {
      submenuList.push({
        title: `${tag.nickName ? tag.nickName : tag.name}`,
        page: `/publisher-reporting/${tag._key}`
      })
    });

    let sheetList = await this.googleSheetReportingService.getSheetList().toPromise();

    var apiDocumentationMenu = {
      title: 'API Documentation',
      root: true,
      icon: 'flaticon2-architecture-and-city',
      svg: './assets/media/svg/icons/Files/File.svg',
      page: '/api-documentation',
      bullet: 'dot',
      permissionName: "apiDocumentationManage",
      submenu: [
        {
          title: 'Super Admin Documentation',
          page: '/api-documentation/superadmin-documentation',
        },
        {
          title: 'Publisher Documentation',
          page: '/api-documentation/publisher-documentation',
        },
      ],
    }
    var publisherMenu = {
      title: 'Publisher Reporting',
      root: true,
      icon: 'flaticon2-architecture-and-city',
      svg: './assets/media/svg/icons/Shopping/Box1.svg',
      page: '/publisher-reporting',
      bullet: 'dot',
      permissionName: "publisherReportingManage",
    }

    //Google Sheet Reporting
    var googlesheetReprotingMenu = {
      title: 'Google Sheet Reporting',
      root: true,
      bullet: 'dot',
      icon: 'flaticon2-mail-1',
      svg: './assets/media/svg/icons/Devices/CPU1.svg',
      page: '/google-sheet-reporting',
      permissionName: "companyManage",
    }
    var googlesheetSubmenuList = [];
    googlesheetSubmenuList.push(
      {
        title: 'All Google Sheets',
        page: '/google-sheet-reporting/all-sheets',
      },
    );
    googlesheetSubmenuList.push(
      {
        title: 'New Sheet Reporting',
        page: '/google-sheet-reporting/new-sheet',
      },
    );

    sheetList.map((sheet: any) => {
      googlesheetSubmenuList.push({
        title: `${sheet.sheetName ? sheet.sheetName : sheet.sheetName}`,
        page: `/google-sheet-reporting/sheet/${sheet._key}`
      });                                        
    });
    
    googlesheetReprotingMenu['submenu'] = googlesheetSubmenuList;
    publisherMenu['submenu'] = submenuList;
    menuConfig.items.push({ section: 'Google Sheet Reporting' });
    menuConfig.items.push(googlesheetReprotingMenu);
    menuConfig.items.push({ section: 'Publisher Reporting' });
    menuConfig.items.push(publisherMenu);
    menuConfig.items.push({ section: 'API Documentation' });
    menuConfig.items.push(apiDocumentationMenu);
    this.menuConfigSubject.next(menuConfig);
  }

  private getMenu(): any {
    return this.menuConfigSubject.value;
  }
}
