import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
} from 'react';
import { insertAt } from '../../core/validation/text.ts';
import { useApp } from '../../state/AppState.tsx';

/**
 * The typing field.
 *
 * Everything about it serves the same goal: the learner should be able to finish
 * a lesson without touching the mouse.
 *
 *  - autofocus, and refocus whenever the step changes
 *  - Enter submits
 *  - the German special letters are one click (or one Alt+key) away and are
 *    inserted at the caret, not appended
 *  - the field is large and readable on a phone, and never triggers a page reload
 */

const SPECIAL_CHARACTERS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

export interface AnswerInputHandle {
  focus: () => void;
  insert: (text: string) => void;
}

export interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  label: string;
  /** Text shown before the input, for a scaffolded sentence. */
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  /** A multiline field for free writing; Enter then needs a modifier. */
  multiline?: boolean;
  /** A narrow field for single words. */
  compact?: boolean;
  /** Visual state driven by the last verdict. */
  tone?: 'neutral' | 'success' | 'warning' | 'error';
  /** Re-focus whenever this value changes. */
  focusKey?: string;
  describedBy?: string;
}

export const AnswerInput = forwardRef<AnswerInputHandle, AnswerInputProps>(function AnswerInput(
  {
    value,
    onChange,
    onSubmit,
    label,
    prefix,
    suffix,
    placeholder,
    disabled = false,
    multiline = false,
    compact = false,
    tone = 'neutral',
    focusKey,
    describedBy,
  },
  ref,
) {
  const { t } = useApp();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const focus = useCallback(() => {
    const element = inputRef.current;
    if (!element || disabled) return;
    element.focus();
    // Put the caret at the end so continuing to type just works.
    const end = element.value.length;
    try {
      element.setSelectionRange(end, end);
    } catch {
      // Some mobile keyboards refuse selection changes; focus alone is enough.
    }
  }, [disabled]);

  const insert = useCallback(
    (text: string) => {
      const element = inputRef.current;
      if (!element) {
        onChange(value + text);
        return;
      }
      const start = element.selectionStart ?? value.length;
      const end = element.selectionEnd ?? start;
      const next = insertAt(value, start, end, text);
      onChange(next.value);
      // Restore the caret after React has re-rendered with the new value.
      requestAnimationFrame(() => {
        element.focus();
        try {
          element.setSelectionRange(next.caret, next.caret);
        } catch {
          /* ignore */
        }
      });
    },
    [onChange, value],
  );

  useImperativeHandle(ref, () => ({ focus, insert }), [focus, insert]);

  // Focus on mount and whenever the caller says the task changed.
  useEffect(() => {
    focus();
  }, [focus, focusKey]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Alt + a/o/u/s inserts the special letters for keyboard-only users.
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      const map: Record<string, string> = {
        a: 'ä',
        o: 'ö',
        u: 'ü',
        s: 'ß',
      };
      const character = map[event.key.toLowerCase()];
      if (character) {
        event.preventDefault();
        insert(event.shiftKey ? character.toUpperCase() : character);
        return;
      }
    }

    if (event.key !== 'Enter') return;
    if (multiline && !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    onSubmit();
  };

  const commonProps = {
    ref: inputRef as never,
    value,
    disabled,
    placeholder: placeholder ?? '',
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
    onKeyDown: handleKeyDown,
    'aria-label': label,
    'aria-describedby': describedBy,
    // German text, so the browser should not autocorrect it as English.
    autoComplete: 'off',
    autoCapitalize: 'off',
    autoCorrect: 'off',
    spellCheck: false,
    lang: 'de',
    className: `answer-field answer-field--${tone}${compact ? ' answer-field--compact' : ''}`,
  };

  return (
    <div className="answer">
      <div className="answer__row">
        {prefix ? (
          <span className="answer__scaffold" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        {multiline ? (
          <textarea {...commonProps} rows={4} />
        ) : (
          <input {...commonProps} type="text" inputMode="text" />
        )}
        {suffix ? (
          <span className="answer__scaffold" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>

      <div className="answer__chars" role="group" aria-label={t('exerciseSpecialChars')}>
        {SPECIAL_CHARACTERS.map((character) => (
          <button
            key={character}
            type="button"
            className="char-btn"
            disabled={disabled}
            // Keep the caret where it is: never let the button steal focus.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insert(character)}
            aria-label={`${t('exerciseSpecialChars')}: ${character}`}
          >
            {character}
          </button>
        ))}
        <span className="answer__hintkeys" aria-hidden="true">
          Alt+a / o / u / s
        </span>
      </div>
    </div>
  );
});
