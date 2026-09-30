import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CURRICULUM, VOCABULARY, allUnits } from '../../content/index.ts';
import type { Gender, WordType } from '../../content/types.ts';
import { TOPIC_LABELS, UI, WORD_TYPE_LABELS } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { Icon } from '../components/icons.tsx';
import { AudioButton, EmptyState } from '../components/bits.tsx';
import { buildVocabViews, vocabMatches, type VocabView } from '../selectors.ts';

type Tab = 'all' | 'learning' | 'known' | 'due' | 'favorites' | 'mistakes' | 'new';

const TABS: Array<{ id: Tab; key: keyof typeof UI }> = [
  { id: 'all', key: 'vocabAll' },
  { id: 'learning', key: 'vocabLearning' },
  { id: 'known', key: 'vocabKnown' },
  { id: 'due', key: 'vocabDue' },
  { id: 'favorites', key: 'vocabFavorites' },
  { id: 'mistakes', key: 'vocabMistakes' },
  { id: 'new', key: 'vocabNew' },
];

/** The vocabulary browser: search in three languages, filter, and open a word. */
export function VocabularyPage() {
  const { t, say, lang, reviewItems, mistakes, favorites, toggleFavorite } = useApp();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [unit, setUnit] = useState('');
  const [topic, setTopic] = useState('');
  const [wordType, setWordType] = useState('');
  const [gender, setGender] = useState('');

  const views = useMemo(
    () => buildVocabViews(reviewItems, mistakes, favorites),
    [reviewItems, mistakes, favorites],
  );

  // Named in the teaching language and sorted by the name shown; a tag with
  // no name yet shows as itself rather than disappearing.
  const topicLabel = (tag: string) => TOPIC_LABELS[tag]?.[lang] ?? tag.replace(/-/g, ' ');
  const topics = useMemo(
    () =>
      [...new Set(VOCABULARY.flatMap((entry) => entry.tags))].sort((a, b) =>
        (TOPIC_LABELS[a]?.[lang] ?? a).localeCompare(TOPIC_LABELS[b]?.[lang] ?? b, lang),
      ),
    [lang],
  );
  const wordTypes = useMemo(() => [...new Set(VOCABULARY.map((entry) => entry.wordType))].sort(), []);
  const units = useMemo(() => allUnits().filter((candidate) => candidate.lessons.length > 0), []);

  const filtered = useMemo(() => {
    return views.filter((view) => {
      const { entry } = view;

      if (tab === 'learning' && view.state !== 'learning' && view.state !== 'lapsed') return false;
      if (tab === 'known' && view.state !== 'known') return false;
      if (tab === 'due' && !view.due) return false;
      if (tab === 'favorites' && !view.favorite) return false;
      if (tab === 'mistakes' && view.mistakes === 0) return false;
      if (tab === 'new' && view.state !== 'new') return false;

      if (level && entry.level !== level) return false;
      if (unit && entry.unitId !== unit) return false;
      if (topic && !entry.tags.includes(topic)) return false;
      if (wordType && entry.wordType !== wordType) return false;
      if (gender && entry.gender !== gender) return false;

      // Search German, English and Bulgarian at once.
      return vocabMatches(entry, query);
    });
  }, [views, tab, query, level, unit, topic, wordType, gender]);

  // All 654 words at once made a page 160,000 pixels tall on a phone. They
  // come in pages now, and any change of search or filter starts again at the
  // top of the new list.
  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [tab, query, level, unit, topic, wordType, gender]);
  const visible = filtered.slice(0, shown);
  const activeFilters = [level, unit, topic, wordType, gender].filter(Boolean).length;

  return (
    <div className="page vocab">
      <h1 className="page__title">{t('vocabTitle')}</h1>

      <label className="searchbar">
        <Icon name="search" size={20} />
        <span className="visually-hidden">{t('vocabSearch')}</span>
        <input
          type="search"
          value={query}
          placeholder={t('vocabSearchShort')}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="tabs" role="tablist">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`tabs__tab${tab === entry.id ? ' is-active' : ''}`}
            onClick={() => setTab(entry.id)}
          >
            {UI[entry.key][lang]}
            <span className="tabs__count">{countFor(views, entry.id)}</span>
          </button>
        ))}
      </div>

      <details className="filters-panel">
        <summary>
          {t('vocabFilters')}
          {activeFilters > 0 ? <span className="filters-panel__count">{activeFilters}</span> : null}
        </summary>
        <div className="filters">
          <Select label={t('vocabFilterLevel')} value={level} onChange={setLevel}>
            {CURRICULUM.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.label}
              </option>
            ))}
          </Select>

          <Select label={t('vocabFilterUnit')} value={unit} onChange={setUnit}>
            {units.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {say(candidate.title)}
              </option>
            ))}
          </Select>

          <Select label={t('vocabFilterTopic')} value={topic} onChange={setTopic}>
            {topics.map((candidate) => (
              <option key={candidate} value={candidate}>
                {topicLabel(candidate)}
              </option>
            ))}
          </Select>

          <Select label={t('vocabFilterType')} value={wordType} onChange={setWordType}>
            {wordTypes.map((candidate) => (
              <option key={candidate} value={candidate}>
                {WORD_TYPE_LABELS[candidate as WordType]?.[lang] ?? candidate}
              </option>
            ))}
          </Select>

          <Select label={t('vocabFilterGender')} value={gender} onChange={setGender}>
            {(['m', 'f', 'n'] as Gender[]).map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate === 'm' ? UI.wordGenderM[lang] : candidate === 'f' ? UI.wordGenderF[lang] : UI.wordGenderN[lang]}
              </option>
            ))}
          </Select>
        </div>
      </details>

      <p className="vocab__count">{t('vocabCount', { n: filtered.length })}</p>

      {filtered.length === 0 ? (
        <EmptyState title={t('vocabEmpty')} />
      ) : (
        <>
          <ul className="word-list">
            {visible.map((view) => (
              <li key={view.entry.id} className={`word-row word-row--${view.state}`}>
                <Link to={`/vocabulary/${view.entry.id}`} className="word-row__main">
                  <span className="word-row__de" lang="de">
                    {view.entry.display}
                  </span>
                  <span className="word-row__gloss">{say(view.entry.translation)}</span>
                  <span className="word-row__meta">
                    <span className={`state-dot state-dot--${view.state}`} aria-hidden="true" />
                    <span>{stateLabel(view.state, lang)}</span>
                    {view.entry.plural ? (
                      <span lang="de" className="word-row__plural">
                        {view.entry.plural}
                      </span>
                    ) : null}
                    {view.mistakes > 0 ? (
                      <span className="word-row__mistakes">
                        {UI.mistakesOccurrences[lang].replace('{n}', String(view.mistakes))}
                      </span>
                    ) : null}
                  </span>
                </Link>
                <div className="word-row__actions">
                  <AudioButton text={view.entry.display} compact />
                  <button
                    type="button"
                    className={`fav${view.favorite ? ' is-on' : ''}`}
                    aria-label={view.favorite ? t('vocabUnfavorite') : t('vocabFavorite')}
                    aria-pressed={view.favorite}
                    onClick={() => void toggleFavorite(view.entry.id)}
                  >
                    <Icon name={view.favorite ? 'starFilled' : 'star'} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {filtered.length > shown ? (
            <button type="button" className="btn btn--ghost btn--lg vocab__more" onClick={() => setShown((n) => n + PAGE)}>
              {t('vocabShowMore', { n: Math.min(PAGE, filtered.length - shown) })}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

/** How many words a page shows before "show more". */
const PAGE = 50;

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const { t } = useApp();
  return (
    <label className="filters__select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{t('vocabFilterAny')}</option>
        {children}
      </select>
    </label>
  );
}

function countFor(views: VocabView[], tab: Tab): number {
  switch (tab) {
    case 'learning':
      return views.filter((view) => view.state === 'learning' || view.state === 'lapsed').length;
    case 'known':
      return views.filter((view) => view.state === 'known').length;
    case 'due':
      return views.filter((view) => view.due).length;
    case 'favorites':
      return views.filter((view) => view.favorite).length;
    case 'mistakes':
      return views.filter((view) => view.mistakes > 0).length;
    case 'new':
      return views.filter((view) => view.state === 'new').length;
    default:
      return views.length;
  }
}

export function stateLabel(state: VocabView['state'], lang: 'en' | 'bg'): string {
  switch (state) {
    case 'learning':
      return UI.reviewStateLearning[lang];
    case 'known':
      return UI.reviewStateKnown[lang];
    case 'lapsed':
      return UI.reviewStateLapsed[lang];
    default:
      return UI.reviewStateNew[lang];
  }
}
