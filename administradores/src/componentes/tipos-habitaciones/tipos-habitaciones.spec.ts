import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposHabitaciones } from './tipos-habitaciones';

describe('TiposHabitaciones', () => {
  let component: TiposHabitaciones;
  let fixture: ComponentFixture<TiposHabitaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposHabitaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiposHabitaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
