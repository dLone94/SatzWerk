import type { CSSProperties, ReactNode } from 'react';
import type { Block, ContentStatus, VocabEntry } from '../../content/types.ts';
import { NORMAL_RATE, SLOW_RATE } from '../../services/tts/index.ts';
import { speakable } from '../../services/tts/speakable.ts';
import { useApp } from '../../state/AppState.tsx';
import { WORD_TYPE_LABELS, tr } from '../../i18n.ts';
import { Icon, type IconName } from './icons.tsx';

/** Small shared building blocks: buttons, badges, meters, block rendering. */

/**
 * The two pieces of markup the authored content actually uses.
 *
 * Lesson text is plain strings, not Markdown, and that is the right call — a
 * full Markdown pipeline for teaching prose would be a lot of machinery for a
 * handful of asterisks. But the content had been written with two conventions
 * in it from the start, and neither of them worked:
 *
 * 1. `**like this**`, for the ending or the one word a rule turns on. It was
 *    reaching the learner with the asterisks still in it.
 * 2. A blank line between paragraphs. HTML collapses newlines, so a callout
 *    carefully written as three short paragraphs arrived as one long one — and
 *    these are exactly the callouts that carry the hardest explanations.
 *
 * So rather than editing the intent out of the content, the renderer now
 * honours it. Anything else is still plain text and is displayed as written.
 */
function emphasise(text: string, keyPrefix: string): ReactNode[] {
  // Split on the pairs, keeping them: odd indices are what was inside.
  return text.split(/\*\*(.+?)\*\*/g).map((piece, index) =>
    index % 2 === 1 ? <strong key={`${keyPrefix}-b${index}`}>{piece}</strong> : piece,
  );
}

/**
 * A single newline is a line break, not a space.
 *
 * The callouts use it for short lists of parallel examples — one comparison
 * per line, German against the learner's own language. Collapsing those into
 * a run-on line is what HTML does by default and it makes the comparison
 * almost unreadable, which is the opposite of what a list of comparisons is
 * for.
 */
function withLineBreaks(text: string, keyPrefix: string): ReactNode[] {
  const lines = text.split('\n');
  return lines.flatMap((line, index) =>
    index === 0
      ? emphasise(line, `${keyPrefix}-l0`)
      : [<br key={`${keyPrefix}-br${index}`} />, ...emphasise(line, `${keyPrefix}-l${index}`)],
  );
}

// Shared with the list of phrases sent for recording, so every play button in
// a table has a recording behind it.
export { speakable };

/**
 * The first learner is stored as "me", a placeholder rather than a name, and
 * it was shown as the English word on the Bulgarian path too.
 */
export function learnerName(name: string, t: (key: 'learnerMe') => string): string {
  return name === 'me' ? t('learnerMe') : name;
}

export function RichText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0);
  if (paragraphs.length <= 1) return <>{withLineBreaks(text, 'rt')}</>;
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <span key={index} className="rich__para">
          {withLineBreaks(paragraph, `rt${index}`)}
        </span>
      ))}
    </>
  );
}

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
  decorative = false,
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: 'accent' | 'muted' | 'good';
  /**
   * A bar drawn beside a number that is already printed, comparing it with
   * its neighbours. Not a progress bar: announced as one, it had no name and
   * read "100%" for the biggest of a few counts.
   */
  decorative?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  if (decorative) {
    return (
      <div className={`meter meter--${tone}`} aria-hidden="true">
        <span className="meter__fill" style={{ width: `${pct}%` }} />
      </div>
    );
  }
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

/**
 * The score at the end of a round, drawn as a ring that fills to the number.
 *
 * A finished round used to be a line of text, which is a strange way to end
 * the one thing the learner actually did. The ring is the only place in the
 * app where motion is the point rather than the confirmation: it takes half a
 * second to arrive at the score, and that half second is what makes finishing
 * feel like finishing.
 *
 * The number is on screen from the first frame, so nothing has to be waited
 * for, and the ring is aria-hidden because the text beside it already says it.
 */
export function ScoreRing({
  value,
  passed,
  caption,
}: {
  value: number;
  passed: boolean;
  caption?: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)));
  // r = 42 in a 100-box, so the stroke has room at both ends.
  const circumference = 2 * Math.PI * 42;
  const style = {
    '--ring-c': circumference,
    '--ring-target': circumference * (1 - pct / 100),
  } as CSSProperties;

  return (
    <div className={`score-ring${passed ? ' score-ring--passed' : ''}`}>
      <div className="score-ring__dial" style={style} aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <circle className="score-ring__track" cx="50" cy="50" r="42" />
          <circle className="score-ring__value" cx="50" cy="50" r="42" />
        </svg>
        <span className="score-ring__num">{pct}%</span>
      </div>
      {caption ? <p className="score-ring__caption">{caption}</p> : null}
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
  disabled = false,
  concealText = false,
  onPlay,
}: {
  text: string;
  slow?: boolean;
  compact?: boolean;
  /** Dictation spends a replay budget; a spent button stays visible but dead. */
  disabled?: boolean;
  /**
   * Leave the text out of the button's name. For listening tasks, where the
   * text is the answer and a screen reader would read it out.
   */
  concealText?: boolean;
  onPlay?: () => void;
}) {
  const { tts, t, lang } = useApp();
  if (!tts.available) return null;
  const label = slow ? t('exercisePlaySlow') : t('exercisePlayAudio');
  /*
   * The name is written out rather than given as an aria-label, because an
   * aria-label has one language: the button's. Inside a German table cell or
   * review label that made VoiceOver read "Пусни" in German, and elsewhere it
   * read the German text with an English or Bulgarian voice. Written out, the
   * button's word is marked as the teaching language and the text as German.
   */
  return (
    <button
      type="button"
      className={`audio-btn${compact ? ' audio-btn--compact' : ''}`}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        if (disabled) return;
        tts.speak(text, { rate: slow ? SLOW_RATE : NORMAL_RATE });
        onPlay?.();
      }}
      lang={lang}
      title={label}
    >
      <Icon name={slow ? 'slow' : 'speaker'} size={compact ? 18 : 20} />
      <span className={compact ? 'visually-hidden' : undefined}>{label}</span>
      {!concealText && (
        <span className="visually-hidden">
          : <span lang="de">{text}</span>
        </span>
      )}
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
                <RichText text={say(block.text)} />
              </p>
            );
          case 'list':
            return (
              <ul key={key} className="blocks__list">
                {block.items.map((item, i) => (
                  <li key={i}>
                    <RichText text={say(item)} />
                  </li>
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
                        {/* A plain string in a table is German; a bilingual
                            cell is the explanation. The German gets the German
                            face whichever column it sits in. */}
                        {row.map((cell, c) =>
                          typeof cell === 'string' ? (
                            <td key={c} lang="de" className="data-table__de">
                              <RichText text={cell} />
                              {speakable(cell) ? <AudioButton compact text={speakable(cell)!} /> : null}
                            </td>
                          ) : (
                            <td key={c}>
                              <RichText text={say(cell)} />
                            </td>
                          ),
                        )}
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
                {block.title && say(block.title) ? <h3>{say(block.title)}</h3> : null}
                <p>
                  <RichText text={say(block.text)} />
                </p>
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

export function EmptyState({
  title,
  body,
  action,
  icon = 'book',
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name={icon} size={26} />
      </span>
      <p className="empty__title">{title}</p>
      {body ? <p className="empty__body">{body}</p> : null}
      {action}
    </div>
  );
}

export function formatDuration(seconds: number, lang: 'en' | 'bg'): string {
  /*
   * Under a minute, say seconds.
   *
   * Rounding to minutes turned a round that genuinely took forty seconds into
   * "It took 0 min", which reads as a broken counter rather than as a fast
   * round — and the first day of study did the same to the time-studied stat.
   */
  const whole = Math.max(0, Math.round(seconds));
  if (whole < 60) return lang === 'bg' ? `${whole} сек` : `${whole} s`;
  const minutes = Math.round(whole / 60);
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
  // Days need a singular — the second learning step is exactly one day, so
  // "in 1 days" / "след 1 дни" was on nearly every new word. Minutes and hours
  // are abbreviations and read right for any number.
  const days = Math.round(hours / 24);
  return tr(diffMinutes > 0 ? 'relInDays' : 'relDaysAgo', lang, { n: days });
}
