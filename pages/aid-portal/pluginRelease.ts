import { useEffect, useState } from 'react';
import type { PluginReleaseInfo, PluginReleaseSummary } from './api/_lib/pluginRelease';

/**
 * Последний релиз плагина для страницы Token Comparator — от
 * `api/plugin-version`, который спрашивает GitHub и кэширует ответ. Портал не
 * пересобирается при публикации плагина, а версия, дата и «что нового»
 * должны смениться сами.
 *
 * Нет ответа, нет релиза, локальный `npm run dev` без функций —
 * `null`: кнопка остаётся без номера, раздела «Что нового» нет.
 */

function isReleaseInfo(value: unknown): value is PluginReleaseInfo {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.version === 'string' &&
    typeof record.notes === 'string' &&
    typeof record.releasesUrl === 'string' &&
    (record.publishedAt === null || typeof record.publishedAt === 'string') &&
    (record.releaseUrl === null || typeof record.releaseUrl === 'string')
  );
}

function isReleaseSummary(value: unknown): value is PluginReleaseSummary {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return ['version', 'date', 'author', 'notes'].every((key) => typeof record[key] === 'string');
}

export interface PluginReleaseState {
  /** Последний релиз — для кнопки и «Что нового». */
  release: PluginReleaseInfo | null;
  /** Все релизы плагина — для changelog внизу страницы. */
  history: PluginReleaseSummary[];
}

export function usePluginRelease(): PluginReleaseState {
  const [state, setState] = useState<PluginReleaseState>({ release: null, history: [] });

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/plugin-version', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { release?: unknown; history?: unknown } | null) => {
        setState({
          release: isReleaseInfo(body?.release) ? body.release : null,
          history: Array.isArray(body?.history) ? body.history.filter(isReleaseSummary) : [],
        });
      })
      .catch(() => {
        // Сеть, не-JSON (dev-сервер отдал index.html), отмена — без релиза.
      });

    return () => controller.abort();
  }, []);

  return state;
}

/** «26 сентября 2026 г.» — как даты в таблицах changelog (`ChangelogTable.tsx`). */
export function formatReleaseDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
