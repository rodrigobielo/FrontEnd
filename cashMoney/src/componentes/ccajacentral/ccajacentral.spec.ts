import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ccajacentral } from './ccajacentral';

describe('Ccajacentral', () => {
  let component: Ccajacentral;
  let fixture: ComponentFixture<Ccajacentral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ccajacentral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ccajacentral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
