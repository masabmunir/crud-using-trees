import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDialougeComponent } from './update-dialouge.component';

describe('UpdateDialougeComponent', () => {
  let component: UpdateDialougeComponent;
  let fixture: ComponentFixture<UpdateDialougeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDialougeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateDialougeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
