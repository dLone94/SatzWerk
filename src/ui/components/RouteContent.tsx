import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureContent } from '../../content/browser.ts';
import { useApp } from '../../state/AppState.tsx';

export function RouteLoading() {
  const { t } = useApp();
  return <div className="route-loading" role="status">
    <span className="route-loading__mark" aria-hidden="true" />
    <p>{t('loading')}</p>
    <div className="route-loading__lines" aria-hidden="true"><span /><span /><span /></div>
  </div>;
}

function LoadFailure() {
  const { t } = useApp();
  return <div className="route-failure">
    <h1 className="page__title">{t('errorTitle')}</h1>
    <p>{t('routeLoadFailed')}</p>
    <button className="btn btn--primary" onClick={() => window.location.reload()}>{t('retry')}</button>
  </div>;
}

class ChunkBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <LoadFailure /> : this.props.children; }
}

/** Never mount a player with the catalog's non-playable progress metadata. */
export function RouteContent({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [loaded, setLoaded] = useState<{ path: string; failed: boolean } | null>(null);
  useEffect(() => {
    let current = true;
    void ensureContent(pathname).then(
      () => { if (current) setLoaded({ path: pathname, failed: false }); },
      () => { if (current) setLoaded({ path: pathname, failed: true }); },
    );
    return () => { current = false; };
  }, [pathname]);
  if (loaded?.path !== pathname) return <RouteLoading />;
  if (loaded.failed) return <LoadFailure />;
  return <ChunkBoundary key={pathname}><Suspense fallback={<RouteLoading />}>{children}</Suspense></ChunkBoundary>;
}
