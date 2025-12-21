import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioRunnerComponent } from './scenario-runner.component';

describe('ScenarioRunnerComponent', () => {
  let component: ScenarioRunnerComponent;
  let fixture: ComponentFixture<ScenarioRunnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScenarioRunnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScenarioRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
