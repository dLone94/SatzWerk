import { useMemo, useState } from 'react';
import { lessonById } from '../../content/index.ts';
import type { ErrorCategory } from '../../content/types.ts';
import { CATEGORY_LABELS, UI } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton, Card, EmptyState, Meter, formatRelativeDate } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { buildMistakePractice } from '../reviewBuilder.ts';

/**
 * The mistake bank.
 *
 * Every row came from a real attempt. The page shows the correct form, an
 * explanation category in the learner's language, and a way to practise it —
 * and it distinguishes an original mistake from a successful retyping.
 */
export function MistakesPage() {
  const { t, say, lang, mistakes, stats, resolveMistake } = useApp();
  const [category, setCategory] = useState<ErrorCategory | ''>('');
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);

  const filtered = useMemo(
    () => (category ? mistakes.filter((mistake) => mistake.category === category) : mistakes),
    [mistakes, category],
  );

  const exercises = useMemo(() => buildMistakePractice(filtered), [filtered]);
  const maxCount = stats.categoryCounts.reduce((max, entry) => Math.max(max, entry.count), 0);

  if (running && exercises.length > 0) {
    return (
      <div className="page page--player">
        <header className="player-header">
          <p className="player-header__lesson">{t('mistakesTitle')}</p>
          <p className="player-header__phase">{t('mistakesPractise')}</p>
        </header>
        <ExercisePlayer
          exercises={exercises}
          context="practice"
          level="pre-a1"
          onFinish={(result) => {
            setSummary(result);
            setRunning(false);
          }}
          onExit={() => setRunning(false)}
          exitLabel={t('cancel')}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">{t('mistakesTitle')}</h1>
      <p className="page__lede">{t('mistakesSubtitle')}</p>

      {summary ? (
        <Card tone="accent" title={t('exerciseDone')}>
          <p className="done-note">
            {t('exerciseScore', { correct: summary.firstTryCorrect, total: summary.total })}
          </p>
        </Card>
      ) : null}

      {mistakes.length === 0 ? (
        <Card>
          <EmptyState title={t('mistakesEmpty')} />
        </Card>
      ) : (
        <>
          {stats.categoryCounts.length > 0 ? (
            <Card title={t('mistakesByCategory')}>
              <ul className="cat-bars">
                {stats.categoryCounts.map((entry) => (
                  <li key={entry.category}>
                    <button
                      type="button"
                      className={`cat-bars__label${category === entry.category ? ' is-active' : ''}`}
                      onClick={() => setCategory(category === entry.category ? '' : entry.category)}
                      aria-pressed={category === entry.category}
                    >
                      {say(CATEGORY_LABELS[entry.category] ?? CATEGORY_LABELS.unknown)}
                    </button>
                    <Meter value={entry.count} max={maxCount} tone="muted" />
                    <span className="cat-bars__n">{entry.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card
            title={t('mistakesRecent')}
            actions={
              <button
                type="button"
                className="btn btn--primary"
                disabled={exercises.length === 0}
                onClick={() => {
                  setSummary(null);
                  setRunning(true);
                }}
              >
                {t('mistakesPractise')}
              </button>
            }
          >
            <ul className="mistake-list mistake-list--full">
              {filtered.map((mistake) => {
                const lesson = mistake.lessonId ? lessonById(mistake.lessonId) : undefined;
                return (
                  <li key={mistake.id}>
                    <div className="mistake-list__main">
                      <span className="mistake-list__label">{t('mistakesYouWrote')}</span>
                      <span className="mistake-list__wrong" lang="de">
                        {mistake.lastGiven}
                      </span>
                      <span className="mistake-list__label">{t('mistakesCorrectIs')}</span>
                      <span className="mistake-list__right" lang="de">
                        {mistake.expected}
                      </span>
                      <AudioButton text={mistake.expected} compact />
                    </div>
                    <div className="mistake-list__meta">
                      <span className={`tag tag--${mistake.category}`}>
                        {say(CATEGORY_LABELS[mistake.category] ?? CATEGORY_LABELS.unknown)}
                      </span>
                      <span className="muted">
                        {UI.mistakesOccurrences[lang].replace('{n}', String(mistake.occurrences))}
                      </span>
                      {mistake.correctedCount > 0 ? (
                        <span className="muted muted--good">
                          {UI.mistakesCorrected[lang].replace('{n}', String(mistake.correctedCount))}
                        </span>
                      ) : null}
                      {lesson ? <span className="muted">{say(lesson.title)}</span> : null}
                      <span className="muted">{formatRelativeDate(mistake.lastSeenAt, lang)}</span>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => void resolveMistake(mistake.id)}
                      >
                        {t('mistakesResolve')}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
