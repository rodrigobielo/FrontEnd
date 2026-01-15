import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hoteles } from './hoteles';

describe('Hoteles', () => {
  let component: Hoteles;
  let fixture: ComponentFixture<Hoteles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hoteles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hoteles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
