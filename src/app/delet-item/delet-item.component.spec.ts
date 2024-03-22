import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletItemComponent } from './delet-item.component';

describe('DeletItemComponent', () => {
  let component: DeletItemComponent;
  let fixture: ComponentFixture<DeletItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
