import { useRef, useState, type FormEvent } from 'react';
import { useApp } from '../../state/AppState.tsx';

/**
 * The password prompt for a hosted SatzWerk.
 *
 * Never shown when running locally: with no password configured the app is
 * open, and this screen does not appear at all. Hosted, it is the only thing
 * served until the password is right.
 *
 * Deliberately plain. It is not a marketing page, and it should not suggest
 * that signing up is a thing you can do here — this is one person's app.
 */
export function LoginPage() {
  const { signIn, t, lang } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || password.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPassword('');
      input.current?.focus();
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
        <h1 className="login__title">{t('appName')}</h1>
        <p className="login__intro">{t('loginIntro')}</p>

        <label className="login__label" htmlFor="password">
          {t('loginPassword')}
        </label>
        <input
          id="password"
          ref={input}
          className="login__field"
          type="password"
          value={password}
          autoFocus
          autoComplete="current-password"
          lang={lang === 'bg' ? 'bg' : 'en'}
          onChange={(event) => setPassword(event.target.value)}
          aria-describedby={error ? 'login-error' : undefined}
        />

        {error ? (
          <p className="login__error" id="login-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary login__submit" disabled={busy || !password}>
          {busy ? t('loginWorking') : t('loginSubmit')}
        </button>
      </form>
    </div>
  );
}
