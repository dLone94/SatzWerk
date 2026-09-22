import { Link } from 'react-router-dom';
import type { UiKey } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';

/**
 * The destinations that do not fit in a phone's tab bar.
 *
 * Nine of them used to share one bar that scrolled sideways with nothing to
 * say it did, so on an iPhone four were simply off the screen — Settings among
 * them, and with it the switch for who is studying. Measured at 375, 390 and
 * 430 points: the last four were never visible. A phone now gets four tabs and
 * this page; a wide screen still gets every tab, because there they fit.
 */
const ENTRIES: Array<{ to: string; label: UiKey; note: UiKey }> = [
  { to: '/vocabulary', label: 'navVocabulary', note: 'moreVocabulary' },
  { to: '/mistakes', label: 'navMistakes', note: 'moreMistakes' },
  { to: '/real-life', label: 'navRealLife', note: 'moreRealLife' },
  { to: '/coach', label: 'navCoach', note: 'moreCoach' },
  { to: '/settings', label: 'navSettings', note: 'moreSettings' },
];

/** The routes the More tab stands for, so it can show as the current one. */
export const MORE_ROUTES = ['/more', ...ENTRIES.map((entry) => entry.to), '/scenario', '/placement'];

export function MorePage() {
  const { t } = useApp();
  return (
    <div className="page">
      <h1 className="page__title">{t('moreTitle')}</h1>
      <ul className="more">
        {ENTRIES.map((entry) => (
          <li key={entry.to}>
            <Link className="more__link" to={entry.to}>
              <span className="more__label">{t(entry.label)}</span>
              <span className="more__note">{t(entry.note)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
