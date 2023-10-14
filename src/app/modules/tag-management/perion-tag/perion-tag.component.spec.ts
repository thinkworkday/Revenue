import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerionTagComponent } from './perion-tag.component';

describe('PerionTagComponent', () => {
  let component: PerionTagComponent;
  let fixture: ComponentFixture<PerionTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerionTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerionTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
