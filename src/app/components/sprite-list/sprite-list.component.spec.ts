import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpriteListComponent } from './sprite-list.component';

describe('SpriteListComponent', () => {
  let component: SpriteListComponent;
  let fixture: ComponentFixture<SpriteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpriteListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpriteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
