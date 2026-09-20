import type { CefrLevel, ContentStatus, ScenarioScript } from '../types.ts';
import { SCENARIOS, type Scenario } from '../outline/realLife.ts';
import { BAKERY_SCRIPTS } from './bakery.ts';
import { RESTAURANT_SCRIPTS } from './restaurant.ts';
import { SUPERMARKET_SCRIPTS } from './supermarket.ts';
import { EMERGENCY_SCRIPTS } from './emergency.ts';
import { HEALTH_SCRIPTS } from './health.ts';
import { HOME_SCRIPTS } from './home.ts';
import { OFFICE_SCRIPTS } from './offices.ts';
import { TRANSPORT_SCRIPTS } from './transport.ts';
import { WORK_SCRIPTS } from './work.ts';

/**
 * Every playable scenario conversation.
 *
 * A scenario's status is derived from this list rather than written down: a
 * stage is playable when a script exists for it, and the Real Life page says
 * "planned" for the rest. There is no field anyone can forget to update.
 */
export const SCENARIO_SCRIPTS: ScenarioScript[] = [
  ...BAKERY_SCRIPTS,
  ...RESTAURANT_SCRIPTS,
  ...SUPERMARKET_SCRIPTS,
  ...TRANSPORT_SCRIPTS,
  ...HEALTH_SCRIPTS,
  ...EMERGENCY_SCRIPTS,
  ...HOME_SCRIPTS,
  ...OFFICE_SCRIPTS,
  ...WORK_SCRIPTS,
];

export function scriptById(id: string): ScenarioScript | undefined {
  return SCENARIO_SCRIPTS.find((entry) => entry.id === id);
}

export function scriptsForScenario(scenarioId: string): ScenarioScript[] {
  return SCENARIO_SCRIPTS.filter((entry) => entry.scenarioId === scenarioId);
}

export function scriptFor(scenarioId: string, level: CefrLevel): ScenarioScript | undefined {
  return SCENARIO_SCRIPTS.find((entry) => entry.scenarioId === scenarioId && entry.level === level);
}

/** Playable, partly playable, or still only an outline. */
export function scenarioStatus(scenario: Scenario): ContentStatus {
  const written = scenario.stages.filter((stage) => scriptFor(scenario.id, stage.level)).length;
  if (written === 0) return 'planned';
  return written === scenario.stages.length ? 'available' : 'partial';
}

export function playableScenarios(): Scenario[] {
  return SCENARIOS.filter((scenario) => scenarioStatus(scenario) !== 'planned');
}

/** How many answer steps a script asks for, in the given teaching path. */
export function scriptAnswerCount(script: ScenarioScript, lang: 'en' | 'bg'): number {
  let total = 0;
  for (const beat of script.beats) {
    if (beat.who !== 'you') continue;
    if (beat.exercise.only && !beat.exercise.only.includes(lang)) continue;
    total += beat.exercise.steps.filter((step) => !step.only || step.only.includes(lang)).length;
  }
  return total;
}
