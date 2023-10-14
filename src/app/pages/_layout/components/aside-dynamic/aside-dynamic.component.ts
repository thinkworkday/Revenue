import { Component, OnInit,Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService, DynamicAsideMenuService } from '../../../../_metronic/core';
import { AuthService } from 'src/app/modules/auth/_services/auth.service';
import { CompanyManagementService } from 'src/app/modules/company-management/company-management.service';
import { UsersService } from 'src/app/shared/service/users.service';
import { TagsService } from 'src/app/shared/service/tags.service';

@Component({
  selector: 'app-aside-dynamic',
  templateUrl: './aside-dynamic.component.html',
  styleUrls: ['./aside-dynamic.component.scss']
})
export class AsideDynamicComponent implements OnInit, OnDestroy {
  menuConfig: any;
  subscriptions: Subscription[] = [];

  disableAsideSelfDisplay: boolean;
  headerLogo: string;
  brandSkin: string;
  ulCSSClasses: string;
  asideMenuHTMLAttributes: any = {};
  asideMenuCSSClasses: string;
  brandClasses: string;
  asideMenuScroll = 1;
  asideSelfMinimizeToggle = false;
  companySelected: any;
  reportingProviderList = [];
  companyTagAdvertiserList = [];
  currentUrl: string;
  currentUser: any;
  
  @Input() companyList: any;
  @Input() advertiserList: any;
  constructor(
    private authService: AuthService,
    private companyService: CompanyManagementService,
    private layout: LayoutService,
    private router: Router,
    private menu: DynamicAsideMenuService,
    private userService: UsersService,
    private tagSevice: TagsService,
    private cdr: ChangeDetectorRef) { 
      this.currentUser = this.authService.currentUserValue;
    }

  ngOnInit(): void {
    this.companySelected = this.getSelectedCompanyFromLocalStorage();
    this.reportingProviderList = this.getCompanyList(this.companyList);
    this.companyTagAdvertiserList = this.getAdvertiserList(this.advertiserList);
    // load view settings
    this.disableAsideSelfDisplay =
      this.layout.getProp('aside.self.display') === false;
    this.brandSkin = this.layout.getProp('brand.self.theme');
    this.headerLogo = this.getLogo();
    this.ulCSSClasses = this.layout.getProp('aside_menu_nav');
    this.asideMenuCSSClasses = this.layout.getStringCSSClasses('aside_menu');
    this.asideMenuHTMLAttributes = this.layout.getHTMLAttributes('aside_menu');
    this.brandClasses = this.layout.getProp('brand');
    this.asideSelfMinimizeToggle = this.layout.getProp(
      'aside.self.minimize.toggle'
    );
    this.asideMenuScroll = this.layout.getProp('aside.menu.scroll') ? 1 : 0;
    // router subscription
    this.currentUrl = this.router.url.split(/[?#]/)[0];
    const routerSubscr = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(routerSubscr);

    // menu load
    const menuSubscr = this.menu.menuConfig$.subscribe(res => {
      this.menuConfig = res;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(menuSubscr);
  }

  private getLogo() {
    if (this.brandSkin === 'light') {
      return './assets/media/logos/logo-dark.png';
    } else {
      return './assets/media/logos/logo-light.png';
    }
  }
  showMenuItem(item: { permissionName: string | number; }) {
    
    if (item.permissionName) {
      var permission = this.currentUser['permission'][0];
      return permission[item.permissionName];
    }
    return false;
  }
  showSubMenuItem(item: { page: string; }) {
    if(item.page.includes("reporting") && !item.page.includes("google-sheet-reporting")) {
      var itemPath = item.page.split("/")[2];
      if(this.reportingProviderList.includes(itemPath)) { 
        return true;
      } else {
        if((itemPath == "manual-stat-update" || itemPath == "manual-split-update") && this.currentUser.role == 1) {
          return true;
        } 
        else if (item.page.includes("publisher-reporting")) {
          return true;
        }
        else if (item.page.includes("accounting")) {
          return true;
        }
        return false;
      }
      
    } 
    
    if (item.page.includes("tag-management")) {
      var itemPath = item.page.split("/")[2];
      if(this.companyTagAdvertiserList.includes(itemPath)) { 
        return true;
      } else {
        if((itemPath == "new" || itemPath == "templates")) {
          return true;
        } 
        return false;
      }
    }
    if (item.page.includes("notifications")) {
      var itemPath = item.page.split("/")[2];
      if(this.currentUser.role == 1 && (itemPath == "new-notification" || itemPath == "super-admin-notifications")) {
        return true;
      } else if(this.currentUser.role !== 1 && (itemPath == "publisher-notifications")) {
        return true;
      }
      return false;
    }
    if (item.page.includes("api-documentation")) {
      var itemPath = item.page.split("/")[2];
      if(this.currentUser.role == 1 && itemPath == "superadmin-documentation") {
        return true;
      } else if(this.currentUser.role !== 1 && (itemPath == "publisher-documentation")) {
        return true;
      }
      return false;
    }
    return true;
    
  }

  isMenuItemActive(path: string) {
    if (!this.currentUrl || !path) {
      return false;
    }

    if (this.currentUrl === path) {
      return true;
    }

    if (this.currentUrl.indexOf(path) > -1) {
      return true;
    }

    return false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
  //get Report Providers in Current Company
  getReportingProviderList() {
    if(this.companySelected) {
      this.companyService.getReportCompany(this.companySelected.split('/')[1]).subscribe(res => {
        console.log("resese",  res)
        res.reportingProviders.map(report=> {
          this.reportingProviderList.push(report.reportingProvider)
        });
      });

      if (this.reportingProviderList.length > 0) return;
      let result = this.reportingProviderList;

      return result;
    } else {
      return this.reportingProviderList;
    }
  }
  //Gets the Selected Company from Local Storage
  getSelectedCompanyFromLocalStorage() {
    return this.userService.getSelectedCompanyFromLocalStorage();
  }
  getCompanyList(companyList: any) {
    if(!companyList) return;
    let result = companyList;
    return result
  }

  getAdvertiserList(advertiserList: any) {
    if(!advertiserList) return;
    let result = advertiserList;
    return result
  }
  
}
