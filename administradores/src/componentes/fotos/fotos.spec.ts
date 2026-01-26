import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fotos } from './fotos';

describe('Fotos', () => {
  let component: Fotos;
  let fixture: ComponentFixture<Fotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fotos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fotos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
