import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/_services/auth.service';

@Component({
  selector: 'app-publisher-documentation',
  templateUrl: './publisher-documentation.component.html',
  styleUrls: ['./publisher-documentation.component.scss']
})
export class PublisherDocumentationComponent implements OnInit {

  currentUser: any;
  tagIds: any = [];
  userApiKey: string;
  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.userApiKey = this.currentUser.apiKey;

    this.tagIds = this.currentUser.tagsId.map((tagId: any) => {
      const tagKey = tagId.split("/")[1];
      return tagKey;
    });

  }

}
