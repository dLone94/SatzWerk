import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lessonById, vocabById } from '../../content/index.ts';
import { UI, WORD_TYPE_LABELS, tr } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton, Card, EmptyState, formatRelativeDate } from '../components/bits.tsx';
import { buildVocabViews, type VocabView } from '../selectors.ts';
import { stateLabel } from './VocabularyPage.tsx';

/** Everything known about one word, including the learner's own history with it. */
export function WordPage() {
  const { wordId = '' } = useParams();
  const { t, say, lang, reviewItems, mistakes, favorites, toggleFavorite } = useApp();

  const entry = vocabById(wordId);
  const views = useMemo(
    () => buildVocabViews(reviewItems, mistakes, favorites),
    [reviewItems, mistakes, favorites],
  );
  const view: VocabView | undefined = views.find((candidate) => candidate.entry.id === wordId);

  if (!entry || !view) {
    return (
      <div className="page">
        <p>{t('errorTitle')}</p>
        <Link className="btn btn--ghost" to="/vocabulary">
          {t('navVocabulary')}
        </Link>
      </div>
    );
  }

  const lesson = entry.lessonId ? lessonById(entry.lessonId) : undefined;
  const related = (entry.related ?? []).map((id) => vocabById(id)).filter(Boolean);
  const wordMistakes = mistakes.filter((mistake) =>
    mistake.expected.toLowerCase().includes(entry.german.toLowerCase()),
  );
  const note = entry.notes?.[lang];
  const genderLabel =
    entry.gender === 'm'
      ? UI.wordGenderM[lang]
      : entry.gender === 'f'
        ? UI.wordGenderF[lang]
        : entry.gender === 'n'
          ? UI.wordGenderN[lang]
          : null;

  return (
    <div className="page">
      <nav className="crumbs">
        <Link to="/vocabulary">{t('navVocabulary')}</Link>
      </nav>

      <div className="word-head">
        <div>
          <h1 className="word-head__de" lang="de">
            {entry.display}
          </h1>
          <p className="word-head__gloss">{say(entry.translation)}</p>
        </div>
        <div className="word-head__actions">
          <AudioButton text={entry.display} />
          <AudioButton text={entry.display} slow />
          <button
            type="button"
            className={`fav fav--lg${view.favorite ? ' is-on' : ''}`}
            aria-pressed={view.favorite}
            aria-label={view.favorite ? t('vocabUnfavorite') : t('vocabFavorite')}
            onClick={() => void toggleFavorite(entry.id)}
          >
            {view.favorite ? '★' : '☆'}
          </button>
        </div>
      </div>

      <div className="grid grid--2">
        <Card title={t('wordGrammar')}>
          <dl className="facts">
            {entry.article ? (
              <>
                <dt>{t('wordArticle')}</dt>
                <dd lang="de">{entry.article}</dd>
              </>
            ) : null}
            {genderLabel ? (
              <>
                <dt>{t('wordGender')}</dt>
                <dd>{genderLabel}</dd>
              </>
            ) : null}
            {entry.plural ? (
              <>
                <dt>{t('wordPlural')}</dt>
                <dd lang="de">
                  {entry.plural}
                  <AudioButton text={entry.plural} compact />
                </dd>
              </>
            ) : null}
            <dt>{t('wordType')}</dt>
            <dd>{WORD_TYPE_LABELS[entry.wordType]?.[lang] ?? entry.wordType}</dd>
            {entry.pronunciation ? (
              <>
                <dt>{t('wordPronunciation')}</dt>
                <dd>[{say(entry.pronunciation)}]</dd>
              </>
            ) : null}
            <dt>{t('wordLevel')}</dt>
            <dd>{entry.level.toUpperCase()}</dd>
            {lesson ? (
              <>
                <dt>{t('navCourse')}</dt>
                <dd>
                  <Link to={`/lesson/${lesson.id}`}>{say(lesson.title)}</Link>
                </dd>
              </>
            ) : null}
          </dl>

          {note ? <aside className="callout callout--compare">{note}</aside> : null}
        </Card>

        <Card title={t('wordLearningState')}>
          <div className="state-row">
            <span className={`state-dot state-dot--${view.state}`} aria-hidden="true" />
            <strong>{stateLabel(view.state, lang)}</strong>
          </div>

          {view.item ? (
            <dl className="facts">
              <dt>{t('wordNextReview')}</dt>
              <dd>{formatRelativeDate(view.item.dueAt, lang)}</dd>
              <dt>{t('wordMasteryHistory')}</dt>
              <dd>
                {tr('wordSuccesses', lang, { n: view.item.successCount })}
                {' · '}
                {tr('wordFailures', lang, { n: view.item.failureCount })}
              </dd>
            </dl>
          ) : (
            <p className="muted">{t('wordNoHistory')}</p>
          )}
        </Card>
      </div>

      <Card title={t('wordExamples')}>
        <div className="example">
          <p className="example__de" lang="de">
            {entry.example.de}
          </p>
          <p className="example__gloss">{say(entry.example.gloss)}</p>
          <AudioButton text={entry.example.de} compact />
        </div>

        {entry.collocations && entry.collocations.length > 0 ? (
          <>
            <h4 className="mini-head">{t('wordCollocations')}</h4>
            <ul className="collocations">
              {entry.collocations.map((collocation, index) => (
                <li key={index}>
                  <span lang="de">{collocation.de}</span>
                  {collocation.gloss ? <span className="muted"> {'—'} {say(collocation.gloss)}</span> : null}
                  <AudioButton text={collocation.de} compact />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {related.length > 0 ? (
          <>
            <h4 className="mini-head">{t('wordRelated')}</h4>
            <ul className="pill-list">
              {related.map((candidate) =>
                candidate ? (
                  <li key={candidate.id}>
                    <Link to={`/vocabulary/${candidate.id}`} lang="de">
                      {candidate.display}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </>
        ) : null}
      </Card>

      <Card title={t('wordMistakeHistory')}>
        {wordMistakes.length === 0 ? (
          <EmptyState title={t('wordNoMistakes')} />
        ) : (
          <ul className="mistake-list">
            {wordMistakes.map((mistake) => (
              <li key={mistake.id}>
                <span className="mistake-list__wrong" lang="de">
                  {mistake.lastGiven}
                </span>
                <span aria-hidden="true">{'→'}</span>
                <span className="mistake-list__right" lang="de">
                  {mistake.expected}
                </span>
                <span className="muted">
                  {UI.mistakesOccurrences[lang].replace('{n}', String(mistake.occurrences))}
                  {mistake.correctedCount > 0
                    ? ` · ${UI.mistakesCorrected[lang].replace('{n}', String(mistake.correctedCount))}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
