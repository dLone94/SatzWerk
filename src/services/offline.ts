/** The worker downloads only assets approved by this build's manifest. */
export async function saveLevel(level: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const ready = await new Promise<ServiceWorkerRegistration | null>(resolve => {
      const timer = window.setTimeout(() => resolve(null), 15_000);
      void navigator.serviceWorker.ready.then(value => { window.clearTimeout(timer); resolve(value); });
    });
    if (!ready) return false;
    const worker = navigator.serviceWorker.controller ?? ready.active;
    if (!worker) return false;
    return await new Promise<boolean>(resolve => {
      const channel = new MessageChannel();
      const timer = window.setTimeout(() => finish(false), 60_000);
      const finish = (saved: boolean) => {
        window.clearTimeout(timer);
        channel.port1.close();
        resolve(saved);
      };
      channel.port1.onmessage = event => finish(event.data?.ok === true);
      worker.postMessage({ type: 'SAVE_LEVEL', level }, [channel.port2]);
    });
  } catch {
    return false;
  }
}
