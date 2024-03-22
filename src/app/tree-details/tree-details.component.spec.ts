import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDetailsComponent } from './tree-details.component';

describe('TreeDetailsComponent', () => {
  let component: TreeDetailsComponent;
  let fixture: ComponentFixture<TreeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
