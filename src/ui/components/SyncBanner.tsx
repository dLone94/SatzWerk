import { useState } from 'react';
import { useApp } from '../../state/AppState.tsx';

/**
 * What is not in the database yet.
 *
 * The app's one rule about numbers is that it does not invent them, and an
 * answer held in the browser is exactly the case where it would be tempting
 * to: the streak, the accuracy and the review queue on every other screen are
 * what the *server* knows, so while answers are waiting they are a little
 * behind. Rather than guessing forward, the app says how many are waiting.
 *
 * It appears only when there is something to say, and it never blocks the
 * lesson underneath it — the answers have already been marked.
 */
export function SyncBanner() {
  const { t, sync, syncAnswers, dismissRefusedAnswers, notice, dismissNotice } = useApp();
  const [working, setWorking] = useState(false);

  const nothingWaiting =
    sync.pending === 0 && sync.other === 0 && sync.refused === 0 && sync.lost === 0;
  if (nothingWaiting && notice === null) return null;

  const trouble = sync.refused > 0 || sync.lost > 0 || notice !== null;

  return (
    <div className={`sync${trouble ? ' sync--trouble' : ''}`} role="status" aria-live="polite">
      <div className="sync__body">
        <p className="sync__headline">
          <span className="sync__dot" aria-hidden="true" />
          {notice !== null && nothingWaiting
            ? t('notSavedTitle')
            : sync.pending > 0
              ? t('syncPending', { n: sync.pending })
              : t('syncTitle')}
        </p>
        {/*
          * A preference that did not save, named. It sits above the queue
          * counts because it is the thing that just happened, and it is the
          * one the learner can do something about — tapping again.
          */}
        {notice !== null ? (
          <>
            <p className="sync__note sync__note--warn">{t(notice)}</p>
            <p className="sync__note">{t('notSavedReason')}</p>
          </>
        ) : null}
        {sync.other > 0 ? <p className="sync__note">{t('syncOther', { n: sync.other })}</p> : null}
        {sync.pending > 0 ? <p className="sync__note">{t('syncExplain')}</p> : null}
        {sync.atRisk ? <p className="sync__note sync__note--warn">{t('syncAtRisk')}</p> : null}
        {sync.refused > 0 ? (
          <p className="sync__note sync__note--warn">{t('syncRefused', { n: sync.refused })}</p>
        ) : null}
        {sync.lost > 0 ? (
          <p className="sync__note sync__note--warn">{t('syncLost', { n: sync.lost })}</p>
        ) : null}
      </div>

      <div className="sync__actions">
        {sync.pending + sync.other > 0 ? (
          <button
            type="button"
            className="btn btn--quiet btn--sm"
            disabled={working}
            onClick={() => {
              setWorking(true);
              void syncAnswers().finally(() => setWorking(false));
            }}
          >
            {working ? t('syncWorking') : t('syncNow')}
          </button>
        ) : null}
        {trouble ? (
          <button
            type="button"
            className="btn btn--quiet btn--sm"
            onClick={() => {
              dismissNotice();
              dismissRefusedAnswers();
            }}
          >
            {t('syncDismiss')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
