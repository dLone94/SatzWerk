import { useRef, useState, type FormEvent } from 'react';
import { useApp } from '../../state/AppState.tsx';

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
  const first = useRef<HTMLInputElement>(null);

  const mismatch = confirm.length > 0 && confirm !== password;
  const tooShort = password.length > 0 && password.length < 10;
  const ready = password.length >= 10 && confirm === password;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    setError(null);
    try {
      await choosePassword(password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPassword('');
      setConfirm('');
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
          onChange={(event) => setPassword(event.target.value)}
        />

        <label className="login__label" htmlFor="confirm-password">
          {t('setupConfirm')}
        </label>
        <input
          id="confirm-password"
          className="login__field"
          type="password"
          value={confirm}
          autoComplete="new-password"
          onChange={(event) => setConfirm(event.target.value)}
        />

        {tooShort ? <p className="login__hint">{t('setupTooShort')}</p> : null}
        {mismatch ? <p className="login__hint">{t('setupMismatch')}</p> : null}
        {error ? (
          <p className="login__error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary login__submit" disabled={busy || !ready}>
          {busy ? t('loginWorking') : t('setupSubmit')}
        </button>

        <p className="login__note">{t('setupNote')}</p>
      </form>
    </div>
  );
}
