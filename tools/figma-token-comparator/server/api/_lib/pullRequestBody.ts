/**
 * Рендерер человекочитаемого GitHub PR description ("review projection")
 * для предложенных решений реестра.
 *
 * ВАЖНО: это ЕДИНСТВЕННОЕ место, где читаются transient review-поля
 * (sourceProperty, sourceDisplayValue, nodePath, targetDisplayValue и т.п.).
 * Эти поля существуют только в теле PR — они НИКОГДА не попадают в
 * RegistryFileEntry / decisions-registry.json (см. buildProposedEntries в
 * proposeDecision.ts — там transient-поля не читаются, только machine-поля).
 *
 * decisions-registry.json остаётся единственным machine/audit source of
 * truth; PR body — производная, чисто презентационная проекция поверх
 * входящего запроса. Approve-flow не должен парсить PR body как данные.
 */

import type { ProposedEntryInput, RegistryDecision } from './registryTypes.js';

interface DecisionMeta {
  icon: string;
  label: string;
}

/** Центральный маппинг decision -> иконка + русская метка действия. */
const DECISION_META: Record<RegistryDecision, DecisionMeta> = {
  mapped: { icon: '🟢', label: 'Использовать токен' },
  ignored: { icon: '🔴', label: 'Игнорировать' },
  hardcoded: { icon: '⚫', label: 'Оставить как hardcoded (без токена)' },
  candidate: { icon: '🔵', label: 'Кандидат на новый токен' },
  value_fix_proposed: { icon: '🟡', label: 'Предложить правку значения токена' },
};

const UNKNOWN_DECISION_META: DecisionMeta = { icon: '⚪', label: 'Неизвестное решение' };

function isKnownDecision(decision: string): decision is RegistryDecision {
  return Object.prototype.hasOwnProperty.call(DECISION_META, decision);
}

function resolveDecisionMeta(decision: string): DecisionMeta {
  return isKnownDecision(decision) ? DECISION_META[decision] : UNKNOWN_DECISION_META;
}

/** true, если у entry есть хотя бы одно transient review-поле (не legacy-запись). */
function hasReviewContext(entry: ProposedEntryInput): boolean {
  return Boolean(
    entry.sourceProperty ||
      entry.sourceBindingType ||
      entry.sourceName ||
      entry.sourceDisplayValue ||
      entry.nodePath ||
      entry.nodeName ||
      typeof entry.occurrenceCount === 'number' ||
      entry.targetCollectionName ||
      entry.targetModeName ||
      entry.targetDisplayValue ||
      entry.proposedModeName ||
      entry.currentLibraryValue ||
      entry.proposedValue,
  );
}

/** Бюллет "- **label:** value" — null, если value пусто/undefined (не рендерим пустые пункты). */
function bullet(label: string, value: string | number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return `- **${label}:** ${text}`;
}

function entryTitle(entry: ProposedEntryInput): string {
  return entry.nodeName?.trim() || entry.signature;
}

function renderCollectionMode(collectionName?: string, modeName?: string): string | null {
  const collection = collectionName?.trim();
  const mode = modeName?.trim();
  if (!collection && !mode) return null;
  if (collection && mode) return `- **Коллекция / режим:** ${collection} / ${mode}`;
  return `- **Коллекция / режим:** ${collection ?? mode}`;
}

/** Однострочное сопоставление source -> token -> target — только когда хватает данных для всех трёх. */
function renderSourceTargetChain(entry: ProposedEntryInput): string | null {
  const source = entry.sourceDisplayValue?.trim();
  const tokenName = entry.targetVariableName?.trim();
  const target = entry.targetDisplayValue?.trim();
  if (!source || !tokenName || !target) return null;
  return `- \`${source}\` → **${tokenName}** → \`${target}\``;
}

function renderLegacyNotice(): string {
  return '_Контекст слоя недоступен: решение предложено версией плагина без review metadata._';
}

function renderDetails(entry: ProposedEntryInput, proposedBy: string, proposedAt: string): string {
  const rows = [
    `- signature: \`${entry.signature}\``,
    entry.targetVariableId ? `- targetVariableId: \`${entry.targetVariableId}\`` : null,
    `- proposedBy: ${proposedBy}`,
    `- proposedAt: ${proposedAt}`,
  ].filter((row): row is string => row !== null);

  return ['<details>', '<summary>Технические детали</summary>', '', ...rows, '', '</details>'].join('\n');
}

function commentOrDash(comment: string | undefined): string {
  return comment && comment.trim() ? comment.trim() : '—';
}

function renderMappedCard(entry: ProposedEntryInput, proposedBy: string, proposedAt: string): string[] {
  const meta = DECISION_META.mapped;
  const lines: (string | null)[] = [`### ${meta.icon} ${meta.label} — \`${entryTitle(entry)}\``, ''];

  if (!hasReviewContext(entry)) {
    lines.push(renderLegacyNotice(), '');
  }

  lines.push(
    bullet('Путь', entry.nodePath),
    bullet('Свойство', entry.sourceProperty),
    bullet('Затронуто слоёв', entry.occurrenceCount),
    bullet('Текущее значение', entry.sourceDisplayValue),
    bullet('Токен', entry.targetVariableName),
    bullet('Значение токена', entry.targetDisplayValue),
    renderCollectionMode(entry.targetCollectionName, entry.targetModeName),
    renderSourceTargetChain(entry),
    bullet('Комментарий', commentOrDash(entry.comment)),
  );

  lines.push('', renderDetails(entry, proposedBy, proposedAt));
  return lines.filter((line): line is string => line !== null);
}

function renderIgnoredCard(entry: ProposedEntryInput, proposedBy: string, proposedAt: string): string[] {
  const meta = DECISION_META.ignored;
  const lines: (string | null)[] = [`### ${meta.icon} ${meta.label} — \`${entryTitle(entry)}\``, ''];

  if (!hasReviewContext(entry)) {
    lines.push(renderLegacyNotice(), '');
  }

  lines.push(
    bullet('Путь', entry.nodePath),
    bullet('Свойство', entry.sourceProperty),
    bullet('Тип источника', entry.sourceBindingType),
    bullet('Затронуто слоёв', entry.occurrenceCount),
    bullet('Значение', entry.sourceDisplayValue),
    bullet('Причина', entry.comment && entry.comment.trim() ? entry.comment.trim() : 'не указана'),
  );

  lines.push('', renderDetails(entry, proposedBy, proposedAt));
  return lines.filter((line): line is string => line !== null);
}

function renderValueFixCard(entry: ProposedEntryInput, proposedBy: string, proposedAt: string): string[] {
  const meta = DECISION_META.value_fix_proposed;
  const lines: (string | null)[] = [`### ${meta.icon} ${meta.label} — \`${entryTitle(entry)}\``, ''];

  if (!hasReviewContext(entry)) {
    lines.push(renderLegacyNotice(), '');
  }

  // current/proposed/mode — отдельные структурные поля, НЕ склеиваются с comment.
  lines.push(
    bullet('Путь', entry.nodePath),
    bullet('Токен', entry.targetVariableName),
    renderCollectionMode(entry.targetCollectionName, entry.proposedModeName),
    bullet('Текущее значение библиотеки', entry.currentLibraryValue),
    bullet('Предлагаемое значение', entry.proposedValue),
    bullet('Комментарий', commentOrDash(entry.comment)),
  );

  lines.push('', renderDetails(entry, proposedBy, proposedAt));
  return lines.filter((line): line is string => line !== null);
}

/** hardcoded / candidate / любой будущий или неизвестный decision. */
function renderGenericCard(entry: ProposedEntryInput, proposedBy: string, proposedAt: string): string[] {
  const meta = resolveDecisionMeta(entry.decision);
  const lines: (string | null)[] = [`### ${meta.icon} ${meta.label} — \`${entryTitle(entry)}\``, ''];

  if (!isKnownDecision(entry.decision)) {
    lines.push(`Тип решения: \`${entry.decision}\``, '');
  }

  if (!hasReviewContext(entry)) {
    lines.push(renderLegacyNotice(), '');
  }

  lines.push(
    bullet('Путь', entry.nodePath),
    bullet('Свойство', entry.sourceProperty),
    bullet('Значение', entry.sourceDisplayValue),
    bullet('Токен', entry.targetVariableName),
    bullet('Комментарий', commentOrDash(entry.comment)),
  );

  lines.push('', renderDetails(entry, proposedBy, proposedAt));
  return lines.filter((line): line is string => line !== null);
}

function renderEntryCard(entry: ProposedEntryInput, proposedBy: string, proposedAt: string): string {
  let lines: string[];
  switch (entry.decision) {
    case 'mapped':
      lines = renderMappedCard(entry, proposedBy, proposedAt);
      break;
    case 'ignored':
      lines = renderIgnoredCard(entry, proposedBy, proposedAt);
      break;
    case 'value_fix_proposed':
      lines = renderValueFixCard(entry, proposedBy, proposedAt);
      break;
    default:
      lines = renderGenericCard(entry, proposedBy, proposedAt);
      break;
  }
  return lines.join('\n');
}

/**
 * Строит человекочитаемый GitHub PR body из validated request entries.
 *
 * Компактные Markdown-карточки (не широкие таблицы, не HTML/CSS свотчи, не
 * изображения) — стабильно читаются в GitHub UI при любой ширине.
 */
export function buildPullRequestBody(
  entries: ProposedEntryInput[],
  proposedBy: string,
  proposedAt: string,
): string {
  const header = [
    '## Решения для ревью',
    '',
    `Предложено: ${proposedBy}  `,
    `Время: ${proposedAt}  `,
    `Решений: ${entries.length}`,
    '',
    'Технический source of truth: `decisions-registry.json`.',
  ].join('\n');

  const cards = entries.map((entry) => renderEntryCard(entry, proposedBy, proposedAt));

  return [header, '', '---', '', cards.join('\n\n---\n\n')].join('\n');
}
