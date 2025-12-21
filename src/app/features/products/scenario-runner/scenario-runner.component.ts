import { Component } from '@angular/core';
import { ScenarioService, Scenario } from '../../../core/services/scenario.service';
import { SetupUsersService } from '../../../core/services/setup-users.service';

@Component({
  selector: 'app-scenario-runner',
  standalone: false,
  templateUrl: './scenario-runner.component.html',
  styleUrls: ['./scenario-runner.component.scss']
})
export class ScenarioRunnerComponent {
  scenarios: Scenario[] = [];
  isRunning = false;
  currentScenario: string = '';
  usersCreated = false;

  constructor(
    private scenarioService: ScenarioService,
    private setupUsersService: SetupUsersService
  ) {
    this.scenarios = this.scenarioService.getAllScenarios();
  }

  async setupUsers(): Promise<void> {
    this.isRunning = true;
    try {
      await this.setupUsersService.createAllTestUsers();
      this.usersCreated = true;
    } catch (error) {
      console.error('Error creating users:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async runAllScenarios(): Promise<void> {
    this.isRunning = true;
    
    try {
      await this.scenarioService.executeAllScenarios();
    } catch (error) {
      console.error('Error executing scenarios:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async runScenario(scenario: Scenario): Promise<void> {
    this.isRunning = true;
    this.currentScenario = scenario.name;
    
    try {
      await this.scenarioService.executeScenario(scenario);
    } catch (error) {
      console.error('Error executing scenario:', error);
    } finally {
      this.isRunning = false;
      this.currentScenario = '';
    }
  }
}