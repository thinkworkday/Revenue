import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminDocumentationComponent } from './superadmin-documentation.component';

describe('SuperadminDocumentationComponent', () => {
  let component: SuperadminDocumentationComponent;
  let fixture: ComponentFixture<SuperadminDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuperadminDocumentationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperadminDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
