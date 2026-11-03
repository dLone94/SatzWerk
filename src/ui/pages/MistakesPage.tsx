import { useMemo, useState } from 'react';
import { lessonById, practiceForCategory } from '../../content/browser.ts';
import type { ErrorCategory, Exercise } from '../../content/types.ts';
import { CATEGORY_LABELS, UI } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton, Card, EmptyState, Meter, formatRelativeDate } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { buildMistakePractice } from '../reviewBuilder.ts';
import { taughtLessons } from '../selectors.ts';

/**
 * The mistake bank.
 *
 * Every row came from a real attempt. The page shows the correct form, an
 * explanation category in the learner's language, and a way to practise it —
 * and it distinguishes an original mistake from a successful retyping.
 */
export function MistakesPage() {
  const { t, say, lang, lessons, mistakes, stats, resolveMistake } = useApp();
  const [category, setCategory] = useState<ErrorCategory | ''>('');
  const [mode, setMode] = useState<'mistakes' | 'category'>('mistakes');
  /*
   * The practice set, fixed when practice starts.
   *
   * A wrong answer reloads the bank, which then gains a row at the top. Built
   * live, the card under the retype became a different mistake, and typing
   * the correction on screen was refused every time.
   */
  const [session, setSession] = useState<{ id: number; exercises: Exercise[] } | null>(null);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);

  const filtered = useMemo(
    () => (category ? mistakes.filter((mistake) => mistake.category === category) : mistakes),
    [mistakes, category],
  );

  const exercises = useMemo(() => buildMistakePractice(filtered), [filtered]);
  const maxCount = stats.categoryCounts.reduce((max, entry) => Math.max(max, entry.count), 0);

  // Practice for a kind of mistake: the course's own tasks for it, from the
  // lessons already taught, never from further on; when those have none, the
  // learner's own mistakes of that kind.
  const taught = useMemo(() => taughtLessons(lessons), [lessons]);
  const kindPractice = (kind: ErrorCategory): Exercise[] => {
    const authored = practiceForCategory(kind, 10, taught);
    return authored.length > 0 ? authored : buildMistakePractice(mistakes.filter((mistake) => mistake.category === kind));
  };

  const start = (next: Exercise[]) => {
    setSummary(null);
    setSession({ id: (session?.id ?? 0) + 1, exercises: next });
  };

  if (session && session.exercises.length > 0) {
    return (
      <div className="page page--player">
        <header className="player-header">
          <p className="player-header__lesson">{t('mistakesTitle')}</p>
          <p className="player-header__phase">
            {mode === 'category' && category
              ? `${say(CATEGORY_LABELS[category] ?? CATEGORY_LABELS.unknown)} — ${t('mistakesPractiseCategory')}`
              : t('mistakesPractise')}
          </p>
        </header>
        <ExercisePlayer
          key={session.id}
          exercises={session.exercises}
          context="practice"
          level="pre-a1"
          onFinish={(result) => {
            setSummary(result);
            setSession(null);
          }}
          onExit={() => setSession(null)}
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
            <Card title={t('mistakesByCategory')} subtitle={t('mistakesCategoryIntro')}>
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
                    <Meter value={entry.count} max={maxCount} tone="muted" decorative />
                    <span className="cat-bars__n">{entry.count}</span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={kindPractice(entry.category).length === 0}
                      onClick={() => {
                        setCategory(entry.category);
                        setMode('category');
                        start(kindPractice(entry.category));
                      }}
                      // One per row, so each needs the row's name to be told apart.
                      aria-label={`${t('mistakesPractiseCategory')}: ${say(CATEGORY_LABELS[entry.category] ?? CATEGORY_LABELS.unknown)}`}
                    >
                      {t('mistakesPractiseCategory')}
                    </button>
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
                  setMode('mistakes');
                  start(exercises);
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
