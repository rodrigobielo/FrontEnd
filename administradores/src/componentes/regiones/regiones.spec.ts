import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Regiones } from './regiones';

describe('Regiones', () => {
  let component: Regiones;
  let fixture: ComponentFixture<Regiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Regiones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Regiones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
