import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CURRICULUM, VOCABULARY, allUnits } from '../../content/index.ts';
import type { Gender, WordType } from '../../content/types.ts';
import { UI, WORD_TYPE_LABELS } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton, Card, EmptyState } from '../components/bits.tsx';
import { buildVocabViews, type VocabView } from '../selectors.ts';

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

  const topics = useMemo(() => [...new Set(VOCABULARY.flatMap((entry) => entry.tags))].sort(), []);
  const wordTypes = useMemo(() => [...new Set(VOCABULARY.map((entry) => entry.wordType))].sort(), []);
  const units = useMemo(() => allUnits().filter((candidate) => candidate.lessons.length > 0), []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
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

      if (needle.length === 0) return true;
      // Search German, English and Bulgarian at once.
      return (
        entry.german.toLowerCase().includes(needle) ||
        entry.display.toLowerCase().includes(needle) ||
        entry.translation.en.toLowerCase().includes(needle) ||
        entry.translation.bg.toLowerCase().includes(needle) ||
        (entry.plural ?? '').toLowerCase().includes(needle)
      );
    });
  }, [views, tab, query, level, unit, topic, wordType, gender]);

  return (
    <div className="page">
      <h1 className="page__title">{t('vocabTitle')}</h1>

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

      <Card>
        <div className="filters">
          <label className="filters__search">
            <span className="visually-hidden">{t('vocabSearch')}</span>
            <input
              type="search"
              value={query}
              placeholder={t('vocabSearch')}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

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
                {candidate}
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

        <p className="card__foot">{t('vocabCount', { n: filtered.length })}</p>

        {filtered.length === 0 ? (
          <EmptyState title={t('vocabEmpty')} />
        ) : (
          <ul className="vocab-grid">
            {filtered.map((view) => (
              <li key={view.entry.id} className={`vocab-card vocab-card--${view.state}`}>
                <div className="vocab-card__top">
                  <Link to={`/vocabulary/${view.entry.id}`} className="vocab-card__de" lang="de">
                    {view.entry.display}
                  </Link>
                  <AudioButton text={view.entry.display} compact />
                  <button
                    type="button"
                    className={`fav${view.favorite ? ' is-on' : ''}`}
                    aria-label={view.favorite ? t('vocabUnfavorite') : t('vocabFavorite')}
                    aria-pressed={view.favorite}
                    onClick={() => void toggleFavorite(view.entry.id)}
                  >
                    {view.favorite ? '★' : '☆'}
                  </button>
                </div>
                <p className="vocab-card__gloss">{say(view.entry.translation)}</p>
                <div className="vocab-card__tags">
                  <span className={`state-dot state-dot--${view.state}`} aria-hidden="true" />
                  <span>{stateLabel(view.state, lang)}</span>
                  {view.entry.plural ? (
                    <span lang="de" className="vocab-card__plural">
                      {view.entry.plural}
                    </span>
                  ) : null}
                  {view.mistakes > 0 ? (
                    <span className="vocab-card__mistakes">
                      {UI.mistakesOccurrences[lang].replace('{n}', String(view.mistakes))}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

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
