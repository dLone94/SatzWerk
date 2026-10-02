import { StudyClock, type StudyStatus } from '../core/progress/studyClock.ts';

/** Learning surfaces opt in. Account screens and route loaders never do. */
export function trackStudy({ allowed, addSeconds, status }: {
  allowed: () => boolean;
  addSeconds: (seconds: number) => void;
  status: (status: StudyStatus) => void;
}) {
  const clock = new StudyClock(Date.now());
  const eligible = () => allowed() && document.visibilityState === 'visible' &&
    document.querySelector('[data-study-active="true"]') !== null;
  const update = () => {
    addSeconds(clock.setEligible(eligible(), Date.now()));
    status(clock.status(Date.now()));
  };
  const interact = () => {
    addSeconds(clock.interact(Date.now()));
    update();
  };
  const observer = new MutationObserver(update);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-study-active'] });
  document.addEventListener('visibilitychange', update);
  for (const event of ['keydown', 'pointerdown', 'scroll', 'focusin']) {
    document.addEventListener(event, interact, { capture: true, passive: true });
  }
  const timer = window.setInterval(update, 5_000);
  update();
  return {
    sample: update,
    stop: () => {
      update();
      observer.disconnect();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
      for (const event of ['keydown', 'pointerdown', 'scroll', 'focusin']) {
        document.removeEventListener(event, interact, true);
      }
    },
  };
}
