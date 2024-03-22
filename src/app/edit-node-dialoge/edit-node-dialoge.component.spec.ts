import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNodeDialogeComponent } from './edit-node-dialoge.component';

describe('EditNodeDialogeComponent', () => {
  let component: EditNodeDialogeComponent;
  let fixture: ComponentFixture<EditNodeDialogeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditNodeDialogeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditNodeDialogeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
