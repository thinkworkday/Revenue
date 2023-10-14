import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyAdserverComponent } from './copy-adserver.component';

describe('CopyAdserverComponent', () => {
  let component: CopyAdserverComponent;
  let fixture: ComponentFixture<CopyAdserverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyAdserverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyAdserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
