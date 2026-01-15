import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Csocio } from './csocio';

describe('Csocio', () => {
  let component: Csocio;
  let fixture: ComponentFixture<Csocio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Csocio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Csocio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
