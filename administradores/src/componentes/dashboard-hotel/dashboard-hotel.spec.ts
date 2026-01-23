import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardHotel } from './dashboard-hotel';

describe('DashboardHotel', () => {
  let component: DashboardHotel;
  let fixture: ComponentFixture<DashboardHotel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHotel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardHotel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
