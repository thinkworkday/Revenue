import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/_services/auth.service';

@Component({
  selector: 'app-superadmin-documentation',
  templateUrl: './superadmin-documentation.component.html',
  styleUrls: ['./superadmin-documentation.component.scss']
})
export class SuperadminDocumentationComponent implements OnInit {
  currentUser: any;
  userApiKey: string;
  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.userApiKey = this.currentUser.apiKey;
  }

}
