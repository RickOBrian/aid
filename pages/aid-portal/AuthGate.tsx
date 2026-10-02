import { useEffect, useState, type ReactNode } from 'react';
import { LoginPage } from './LoginPage';

/**
 * Клиентский вход (ADR-038, вариант 1а): интерфейс показывается только после
 * того, как `/api/session` подтвердил сессию. Без сессии — форма входа.
 *
 * На Vercel до переключения домена страницы по-прежнему закрывает
 * `middleware.ts`; здесь проверка повторяется и ничего не меняет. Локальный
 * `npm run dev` функций не выполняет — там вход пропускается.
 */

type GateState = 'checking' | 'open' | 'login';

export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>(import.meta.env.DEV ? 'open' : 'checking');

  useEffect(() => {
    if (state !== 'checking') {
      return;
    }
    const controller = new AbortController();
    fetch('/api/session', { credentials: 'include', signal: controller.signal })
      .then((response) => setState(response.ok ? 'open' : 'login'))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState('login');
        }
      });
    return () => controller.abort();
  }, [state]);

  if (state === 'checking') {
    return null;
  }
  return state === 'open' ? <>{children}</> : <LoginPage />;
}
