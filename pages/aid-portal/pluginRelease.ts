import { useEffect, useState } from 'react';

/**
 * Версия плагина для кнопки «Скачать» — от `api/plugin-version`, который
 * спрашивает GitHub и кэширует ответ. Портал не пересобирается при публикации
 * плагина, а номер должен смениться сам.
 *
 * Нет ответа, нет версии, локальный `npm run dev` без функций Vercel — кнопка
 * остаётся с прежним текстом, без номера.
 */
export function usePluginVersion(): string | null {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/plugin-version', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { version?: unknown } | null) => {
        setVersion(typeof body?.version === 'string' ? body.version : null);
      })
      .catch(() => {
        // Сеть, не-JSON (dev-сервер отдал index.html), отмена — без версии.
      });

    return () => controller.abort();
  }, []);

  return version;
}
