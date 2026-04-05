import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SweetTreats } from './sweet-treats';

describe('SweetTreats', () => {
  let component: SweetTreats;
  let fixture: ComponentFixture<SweetTreats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SweetTreats],
    }).compileComponents();

    fixture = TestBed.createComponent(SweetTreats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
