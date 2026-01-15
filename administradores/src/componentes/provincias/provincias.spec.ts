import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Provincias } from './provincias';

describe('Provincias', () => {
  let component: Provincias;
  let fixture: ComponentFixture<Provincias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Provincias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Provincias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
