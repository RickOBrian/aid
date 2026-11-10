import { useState, type FormEvent } from 'react';
import { apiUrl, withBase } from './base';

const LOGIN_PAGE_STYLE = `
.dslp,
.dslp *,
.dslp *::before,
.dslp *::after {
  box-sizing: border-box;
}
.dslp {
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--pf-spacing-24);
}
.dslp-card {
  width: 100%;
  max-width: 360px;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-xl);
  box-shadow: var(--pf-shadow-2);
  padding: var(--pf-spacing-32);
}
.dslp-title {
  margin: 0 0 var(--pf-spacing-4);
  font: var(--pf-font-heading-m);
  color: var(--pf-text-primary);
}
.dslp-subtitle {
  margin: 0 0 var(--pf-spacing-24);
  font: var(--pf-font-body-m);
  color: var(--pf-text-secondary);
}
.dslp-form {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
}
.dslp-field {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-6);
}
.dslp-label {
  font: var(--pf-font-label-s);
  color: var(--pf-text-secondary);
}
.dslp-input {
  font: var(--pf-font-body-m);
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-10) var(--pf-spacing-12);
  width: 100%;
}
.dslp-input::placeholder {
  color: var(--pf-text-muted);
}
.dslp-input:focus {
  outline: none;
}
.dslp-input:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dslp-input:disabled {
  color: var(--pf-text-disabled);
  cursor: not-allowed;
}
.dslp-submit {
  margin-top: var(--pf-spacing-8);
  font-family: var(--pf-type-family-sans-1);
  font-size: 14px; /* pf-gap: label-m 14/20·500 */
  font-weight: var(--pf-type-weight-500);
  line-height: 20px; /* pf-gap: label-m */
  color: var(--pf-text-inverse);
  background: var(--pf-bg-accent-main);
  border: none;
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-12) var(--pf-spacing-16);
  cursor: pointer;
  transition: background-color 150ms ease;
}
.dslp-submit:hover:not(:disabled) {
  background: #1a1a1b; /* pf-gap: bg-accent-states-hover поверх bg-accent-main (пачка №0) */
}
.dslp-submit:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dslp-submit:disabled {
  opacity: 0.4; /* pf-gap: bg-accent-states-disable (пачка №0) */
  cursor: not-allowed;
}
.dslp-error {
  margin: 0;
  font: var(--pf-font-body-s);
  color: var(--pf-text-error);
}
`;

interface LoginResponseBody {
  error?: string;
}

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Full reload (not client-side navigate) — AuthGate asks /api/session
        // again on load and must see the freshly set `session` cookie.
        window.location.href = withBase('/');
        return;
      }

      const body = (await response.json().catch(() => null)) as LoginResponseBody | null;
      if (response.status === 401) {
        setError('Неверный логин или пароль');
      } else if (response.status >= 500) {
        setError('Ошибка сервера. Попробуйте позже.');
      } else {
        setError(body?.error ?? 'Не удалось войти');
      }
    } catch {
      setError('Не удалось связаться с сервером');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dslp">
      <style>{LOGIN_PAGE_STYLE}</style>
      <div className="dslp-card">
        <h1 className="dslp-title">Presentbook</h1>
        <p className="dslp-subtitle">Войдите, чтобы продолжить</p>
        <form className="dslp-form" onSubmit={handleSubmit}>
          <div className="dslp-field">
            <label className="dslp-label" htmlFor="dslp-username">
              Логин
            </label>
            <input
              id="dslp-username"
              className="dslp-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="dslp-field">
            <label className="dslp-label" htmlFor="dslp-password">
              Пароль
            </label>
            <input
              id="dslp-password"
              className="dslp-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          {error && <p className="dslp-error">{error}</p>}
          <button className="dslp-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
