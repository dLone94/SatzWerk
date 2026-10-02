/** Reading and answering count; an unattended screen stops after two minutes. */
export const STUDY_IDLE_MS = 120_000;
export type StudyStatus = 'ready' | 'active' | 'paused';

export class StudyClock {
  private last: number;
  private interaction: number;
  private eligible = false;

  constructor(now: number) {
    this.last = now;
    this.interaction = now;
  }

  sample(now: number): number {
    const until = Math.min(now, this.interaction + STUDY_IDLE_MS);
    const seconds = this.eligible ? Math.max(0, until - this.last) / 1000 : 0;
    this.last = now;
    return seconds;
  }

  setEligible(eligible: boolean, now: number): number {
    const seconds = this.sample(now);
    if (eligible && !this.eligible) this.interaction = now;
    this.eligible = eligible;
    return seconds;
  }

  interact(now: number): number {
    const seconds = this.sample(now);
    this.interaction = now;
    return seconds;
  }

  status(now: number): StudyStatus {
    return !this.eligible ? 'ready' : now >= this.interaction + STUDY_IDLE_MS ? 'paused' : 'active';
  }
}
