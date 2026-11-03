import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../../state/AppState.tsx';

/** Why the last try was turned down, and which try that was. */
interface Refusal {
  reason: 'short' | 'mismatch';
  /** Which refused try in a row: a new number mounts a new alert, so each is said afresh. */
  n: number;
}

/**
 * First run on a hosted copy: choose the password.
 *
 * Shown instead of the app when the deployment is hosted and no password has
 * been set yet. Nothing else is served until this is done, so the app is never
 * briefly readable by whoever finds the URL first.
 *
 * This exists so that hosting SatzWerk needs no terminal. The password is
 * typed here, hashed on the server, and only the hash is stored.
 */
export function SetupPage() {
  const { choosePassword, t, lang } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const first = useRef<HTMLInputElement>(null);
  const second = useRef<HTMLInputElement>(null);

  /*
   * The rule is on screen from the start, under the field it is about, and
   * the button always works. It used to be disabled until both fields were
   * right, so Tab skipped it, focus fell off the form and Enter did nothing,
   * and the rule appeared only once typing began, in a line no field pointed
   * to and nothing announced. Now a refused try says what is wrong, marks the
   * field and puts the cursor back in it.
   *
   * What is wrong is decided by the try, not by the typing after it. Worked
   * out from the fields as they changed, a refusal turned into a running
   * commentary: passing ten characters in the first field raised a fresh
   * alert that the copies did not match, before the second had been touched.
   * So the refusal stands until the learner edits a field it is about, and
   * then the form goes back to its quiet hints.
   */
  const tooShort = password.length < 10;
  const differs = confirm !== password;
  const problem = refusal?.reason ?? null;
  const showMismatch = problem === 'mismatch' || (confirm.length > 0 && differs);

  // After the refusal has rendered, so the field is already marked invalid
  // when focus arrives and a screen reader does not call it fine first.
  useEffect(() => {
    if (refusal) (refusal.reason === 'short' ? first : second).current?.focus();
  }, [refusal]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (tooShort || differs) {
      const reason = tooShort ? 'short' : 'mismatch';
      setRefusal((last) => ({ reason, n: (last?.n ?? 0) + 1 }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await choosePassword(password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPassword('');
      setConfirm('');
      // The server's refusal is the news now, not the emptied fields.
      setRefusal(null);
      first.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="boot boot--login">
      <form className="login" onSubmit={(event) => void submit(event)}>
        <p className="login__logo" aria-hidden="true">
          SW
        </p>
        <h1 className="login__title">{t('setupTitle')}</h1>
        <p className="login__intro">{t('setupIntro')}</p>

        <label className="login__label" htmlFor="new-password">
          {t('setupPassword')}
        </label>
        <input
          id="new-password"
          ref={first}
          className="login__field"
          type="password"
          value={password}
          autoFocus
          autoComplete="new-password"
          lang={lang === 'bg' ? 'bg' : 'en'}
          onChange={(event) => {
            setPassword(event.target.value);
            // Both refusals are about this field: its length, or the pair.
            setRefusal(null);
          }}
          aria-describedby="new-password-rule"
          aria-invalid={problem === 'short' || undefined}
        />
        {/* Remounted as an alert on each refused try: an alert is announced
            when it arrives, not while it stays. */}
        <p
          key={problem === 'short' ? `refused-${refusal?.n}` : 'rule'}
          id="new-password-rule"
          className={`login__hint${problem === 'short' ? ' login__hint--wrong' : ''}`}
          role={problem === 'short' ? 'alert' : undefined}
        >
          {t('setupTooShort')}
        </p>

        <label className="login__label" htmlFor="confirm-password">
          {t('setupConfirm')}
        </label>
        <input
          id="confirm-password"
          ref={second}
          className="login__field"
          type="password"
          value={confirm}
          autoComplete="new-password"
          onChange={(event) => {
            setConfirm(event.target.value);
            if (problem === 'mismatch') setRefusal(null);
          }}
          aria-describedby={showMismatch ? 'confirm-password-hint' : undefined}
          aria-invalid={problem === 'mismatch' || undefined}
        />
        {showMismatch ? (
          <p
            key={problem === 'mismatch' ? `refused-${refusal?.n}` : 'typing'}
            id="confirm-password-hint"
            className={`login__hint${problem === 'mismatch' ? ' login__hint--wrong' : ''}`}
            role={problem === 'mismatch' ? 'alert' : undefined}
          >
            {t('setupMismatch')}
          </p>
        ) : null}
        {error ? (
          <p className="login__error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary login__submit" disabled={busy}>
          {busy ? t('loginWorking') : t('setupSubmit')}
        </button>

        <p className="login__note">{t('setupNote')}</p>
      </form>
    </div>
  );
}
