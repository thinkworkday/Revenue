import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherDocumentationComponent } from './publisher-documentation.component';

describe('PublisherDocumentationComponent', () => {
  let component: PublisherDocumentationComponent;
  let fixture: ComponentFixture<PublisherDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublisherDocumentationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublisherDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
