import type { ReactNode } from 'react';
import type { Block, ContentStatus, VocabEntry } from '../../content/types.ts';
import { NORMAL_RATE, SLOW_RATE } from '../../services/tts/index.ts';
import { useApp } from '../../state/AppState.tsx';
import { WORD_TYPE_LABELS } from '../../i18n.ts';

/** Small shared building blocks: buttons, badges, meters, block rendering. */

export function Card({
  title,
  subtitle,
  children,
  actions,
  tone,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: 'plain' | 'accent';
}) {
  return (
    <section className={`card${tone === 'accent' ? ' card--accent' : ''}`}>
      {title ? (
        <header className="card__head">
          <div>
            <h2 className="card__title">{title}</h2>
            {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="card__actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const { t } = useApp();
  const label =
    status === 'available' ? t('statusAvailable') : status === 'partial' ? t('statusPartial') : t('statusPlanned');
  return <span className={`badge badge--${status}`}>{label}</span>;
}

export function Meter({
  value,
  max = 1,
  label,
  tone = 'accent',
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: 'accent' | 'muted' | 'good';
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={`meter meter--${tone}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className="meter__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className={`stat${emphasis ? ' stat--emphasis' : ''}`}>
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
      {hint ? <span className="stat__hint">{hint}</span> : null}
    </div>
  );
}

/** Speak a German string. Hidden entirely when the browser cannot speak. */
export function AudioButton({
  text,
  slow = false,
  compact = false,
}: {
  text: string;
  slow?: boolean;
  compact?: boolean;
}) {
  const { tts, t } = useApp();
  if (!tts.available) return null;
  return (
    <button
      type="button"
      className={`audio-btn${compact ? ' audio-btn--compact' : ''}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => tts.speak(text, { rate: slow ? SLOW_RATE : NORMAL_RATE })}
      aria-label={`${slow ? t('exercisePlaySlow') : t('exercisePlayAudio')}: ${text}`}
      title={slow ? t('exercisePlaySlow') : t('exercisePlayAudio')}
    >
      <span aria-hidden="true">{slow ? '\u{1F40C}' : '\u{1F50A}'}</span>
      {compact ? null : <span>{slow ? t('exercisePlaySlow') : t('exercisePlayAudio')}</span>}
    </button>
  );
}

/** Renders the authored teaching blocks for the active teaching path. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const { lang, say } = useApp();
  const visible = blocks.filter((block) => !block.only || block.only.includes(lang));

  return (
    <div className="blocks">
      {visible.map((block, index) => {
        const key = `${block.t}-${index}`;
        switch (block.t) {
          case 'p':
            return (
              <p key={key} className="blocks__p">
                {say(block.text)}
              </p>
            );
          case 'list':
            return (
              <ul key={key} className="blocks__list">
                {block.items.map((item, i) => (
                  <li key={i}>{say(item)}</li>
                ))}
              </ul>
            );
          case 'de':
            return (
              <div key={key} className="example">
                <p className="example__de" lang="de">
                  {block.de}
                </p>
                {block.gloss ? <p className="example__gloss">{say(block.gloss)}</p> : null}
                <AudioButton text={block.de} compact />
              </div>
            );
          case 'contrast':
            return (
              <div key={key} className="contrast">
                <p className="contrast__de" lang="de">
                  {block.de}
                </p>
                <p className="contrast__other">{say(block.other)}</p>
                {block.note ? <p className="contrast__note">{say(block.note)}</p> : null}
              </div>
            );
          case 'table':
            return (
              <div key={key} className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      {block.headers.map((header, i) => (
                        <th key={i} scope="col">
                          {say(header)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c}>{typeof cell === 'string' ? cell : say(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.caption ? <p className="table-caption">{say(block.caption)}</p> : null}
              </div>
            );
          case 'callout':
            return (
              <aside key={key} className={`callout callout--${block.tone}`}>
                {block.title && say(block.title) ? <h4>{say(block.title)}</h4> : null}
                <p>{say(block.text)}</p>
              </aside>
            );
          case 'breakdown':
            return (
              <div key={key} className="breakdown">
                <div className="breakdown__head">
                  <p lang="de" className="breakdown__sentence">
                    {block.de}
                  </p>
                  <AudioButton text={block.de} compact />
                </div>
                <ul className="breakdown__parts">
                  {block.parts.map((part, i) => (
                    <li key={i}>
                      <span lang="de" className="breakdown__de">
                        {part.de}
                      </span>
                      <span className="breakdown__arrow" aria-hidden="true">
                        {'→'}
                      </span>
                      <span className="breakdown__gloss">{say(part.gloss)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** A vocabulary row with audio, article and translation. */
export function VocabRow({ entry, onOpen }: { entry: VocabEntry; onOpen?: () => void }) {
  const { say, lang } = useApp();
  const typeLabel = WORD_TYPE_LABELS[entry.wordType];
  return (
    <div className="vocab-row">
      <div className="vocab-row__main">
        <p className="vocab-row__de" lang="de">
          {onOpen ? (
            <button type="button" className="linkish" onClick={onOpen}>
              {entry.display}
            </button>
          ) : (
            entry.display
          )}
        </p>
        <p className="vocab-row__gloss">{say(entry.translation)}</p>
      </div>
      <div className="vocab-row__meta">
        {entry.plural ? (
          <span className="vocab-row__plural" lang="de">
            {entry.plural}
          </span>
        ) : null}
        {typeLabel ? <span className="vocab-row__type">{typeLabel[lang]}</span> : null}
        {entry.pronunciation ? (
          <span className="vocab-row__pron">[{say(entry.pronunciation)}]</span>
        ) : null}
        <AudioButton text={entry.display} compact />
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {body ? <p className="empty__body">{body}</p> : null}
      {action}
    </div>
  );
}

export function formatDuration(seconds: number, lang: 'en' | 'bg'): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return lang === 'bg' ? `${minutes} мин` : `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return lang === 'bg' ? `${hours} ч ${rest} мин` : `${hours} h ${rest} min`;
}

export function formatRelativeDate(iso: string, lang: 'en' | 'bg'): string {
  const target = new Date(iso).getTime();
  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const abs = Math.abs(diffMinutes);

  if (abs < 1) return lang === 'bg' ? 'сега' : 'now';
  if (abs < 60) {
    const unit = lang === 'bg' ? 'мин' : 'min';
    return diffMinutes > 0
      ? lang === 'bg'
        ? `след ${abs} ${unit}`
        : `in ${abs} ${unit}`
      : lang === 'bg'
        ? `преди ${abs} ${unit}`
        : `${abs} ${unit} ago`;
  }
  const hours = Math.round(abs / 60);
  if (hours < 24) {
    const unit = lang === 'bg' ? 'ч' : 'h';
    return diffMinutes > 0
      ? lang === 'bg'
        ? `след ${hours} ${unit}`
        : `in ${hours} ${unit}`
      : lang === 'bg'
        ? `преди ${hours} ${unit}`
        : `${hours} ${unit} ago`;
  }
  const days = Math.round(hours / 24);
  const unit = lang === 'bg' ? 'дни' : 'days';
  return diffMinutes > 0
    ? lang === 'bg'
      ? `след ${days} ${unit}`
      : `in ${days} ${unit}`
    : lang === 'bg'
      ? `преди ${days} ${unit}`
      : `${days} ${unit} ago`;
}
