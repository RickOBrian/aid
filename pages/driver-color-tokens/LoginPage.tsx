import { useState, type FormEvent } from 'react';

const LOGIN_PAGE_STYLE = `
.dslp,
.dslp *,
.dslp *::before,
.dslp *::after {
  box-sizing: border-box;
}
.dslp {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.dslp-card {
  width: 100%;
  max-width: 360px;
  border: 1px solid #ebedf0;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  padding: 32px;
}
.dslp-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 500;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.87);
}
.dslp-subtitle {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
}
.dslp-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dslp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dslp-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.54);
}
.dslp-input {
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #2d2c2e;
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 10px;
  padding: 10px 12px;
  width: 100%;
}
.dslp-input::placeholder {
  color: rgba(0, 0, 0, 0.38);
}
.dslp-input:focus {
  outline: none;
  border-color: rgba(45, 44, 46, 0.32);
}
.dslp-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.dslp-submit {
  margin-top: 8px;
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
  background: #2d2c2e;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.dslp-submit:hover:not(:disabled) {
  background: #1a1a1b;
}
.dslp-submit:focus-visible {
  outline: 2px solid rgba(45, 44, 46, 0.32);
  outline-offset: 2px;
}
.dslp-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.dslp-error {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: #c62828;
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
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Full reload (not client-side navigate) — middleware must see the
        // freshly set `session` cookie on the very next request to `/`.
        window.location.href = '/';
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
