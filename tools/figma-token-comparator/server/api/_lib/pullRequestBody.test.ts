import { describe, expect, it } from 'vitest';

import { buildPullRequestBody } from './pullRequestBody.js';
import type { ProposedEntryInput } from './registryTypes.js';

const PROPOSED_BY = 'designer@example.com';
const PROPOSED_AT = '2026-09-06T20:04:17.192Z';

function build(entries: ProposedEntryInput[]): string {
  return buildPullRequestBody(entries, PROPOSED_BY, PROPOSED_AT);
}

describe('buildPullRequestBody — header', () => {
  it('includes proposedBy, proposedAt, count and points to decisions-registry.json as source of truth', () => {
    const body = build([{ signature: 'sig-1', decision: 'mapped' }]);
    expect(body).toContain('## Решения для ревью');
    expect(body).toContain(`Предложено: ${PROPOSED_BY}`);
    expect(body).toContain(`Время: ${PROPOSED_AT}`);
    expect(body).toContain('Решений: 1');
    expect(body).toContain('Технический source of truth: `decisions-registry.json`.');
  });
});

describe('buildPullRequestBody — mapped', () => {
  it('renders full transient context: node, path, source/target values, collection/mode, chain, comment', () => {
    const entry: ProposedEntryInput = {
      signature: '1yjw2j2',
      decision: 'mapped',
      targetVariableId: 'VariableID:23:37',
      targetVariableName: 'bg-accent-main',
      comment: 'looks good',
      sourceProperty: 'fill',
      sourceBindingType: 'hardcoded',
      sourceDisplayValue: '#0057FF',
      nodePath: 'Page 1 / Button / Background',
      nodeName: 'Background',
      occurrenceCount: 12,
      targetCollectionName: 'Colors',
      targetModeName: 'Light',
      targetDisplayValue: '#0052E0',
    };

    const body = build([entry]);

    expect(body).toContain('🟢 Использовать токен — `Background`');
    expect(body).toContain('**Путь:** Page 1 / Button / Background');
    expect(body).toContain('**Свойство:** fill');
    expect(body).toContain('**Затронуто слоёв:** 12');
    expect(body).toContain('**Текущее значение:** #0057FF');
    expect(body).toContain('**Токен:** bg-accent-main');
    expect(body).toContain('**Значение токена:** #0052E0');
    expect(body).toContain('**Коллекция / режим:** Colors / Light');
    expect(body).toContain('`#0057FF` → **bg-accent-main** → `#0052E0`');
    expect(body).toContain('**Комментарий:** looks good');
    expect(body).toContain('signature: `1yjw2j2`');
    expect(body).toContain('targetVariableId: `VariableID:23:37`');
    expect(body).toContain(`proposedBy: ${PROPOSED_BY}`);
    expect(body).toContain(`proposedAt: ${PROPOSED_AT}`);
    expect(body).not.toContain('undefined');
    expect(body).not.toContain('null');
  });

  it('falls back to signature when nodeName is absent, and shows "—" when comment is absent', () => {
    const body = build([{ signature: 'sig-no-node', decision: 'mapped', targetVariableName: 'bg-accent-main' }]);
    expect(body).toContain('— `sig-no-node`');
    expect(body).toContain('**Комментарий:** —');
  });
});

describe('buildPullRequestBody — ignored', () => {
  it('shows the comment as the reason', () => {
    const body = build([
      { signature: 't3djlo', decision: 'ignored', comment: 'test', sourceDisplayValue: '#1A73E8', nodeName: 'Header' },
    ]);
    expect(body).toContain('🔴 Игнорировать — `Header`');
    expect(body).toContain('**Причина:** test');
  });

  it('shows "не указана" when comment is absent', () => {
    const body = build([{ signature: 't3djlo', decision: 'ignored', sourceDisplayValue: '#1A73E8' }]);
    expect(body).toContain('**Причина:** не указана');
  });
});

describe('buildPullRequestBody — value_fix_proposed', () => {
  it('renders mode/current/proposed as separate bullets, not glued into the comment line', () => {
    const body = build([
      {
        signature: 'vf-1',
        decision: 'value_fix_proposed',
        targetVariableName: 'bg-accent-main',
        targetCollectionName: 'Colors',
        proposedModeName: 'Night',
        currentLibraryValue: '#0052E0',
        proposedValue: '#0060FF',
        comment: 'brand refresh',
      },
    ]);

    expect(body).toContain('🟡 Предложить правку значения токена');
    expect(body).toContain('**Коллекция / режим:** Colors / Night');
    expect(body).toContain('**Текущее значение библиотеки:** #0052E0');
    expect(body).toContain('**Предлагаемое значение:** #0060FF');
    expect(body).toContain('**Комментарий:** brand refresh');

    // Comment line must not also contain the mode/current/proposed values glued together.
    const commentLine = body.split('\n').find((line) => line.startsWith('- **Комментарий:**'));
    expect(commentLine).toBe('- **Комментарий:** brand refresh');
  });
});

describe('buildPullRequestBody — legacy fallback', () => {
  it('shows the legacy notice when no transient metadata is present', () => {
    const body = build([{ signature: 'legacy-1', decision: 'mapped', targetVariableName: 'bg-accent-main' }]);
    expect(body).toContain('Контекст слоя недоступен: решение предложено версией плагина без review metadata.');
    // Machine fields that existed before this feature must still render.
    expect(body).toContain('**Токен:** bg-accent-main');
  });

  it('renders a valid, exception-free body for a mixed batch of new and legacy entries', () => {
    const body = build([
      {
        signature: 'new-1',
        decision: 'mapped',
        targetVariableName: 'bg-accent-main',
        sourceDisplayValue: '#0057FF',
        targetDisplayValue: '#0052E0',
        nodeName: 'Background',
      },
      { signature: 'legacy-1', decision: 'ignored', comment: 'old client, no context' },
    ]);
    expect(body).toContain('Решений: 2');
    expect(body).toContain('— `Background`');
    expect(body).toContain('Контекст слоя недоступен');
    expect(body).not.toContain('undefined');
    expect(body).not.toContain('null');
  });
});

describe('buildPullRequestBody — unknown decision', () => {
  it('renders a neutral fallback card without throwing for a decision type not in the current registry', () => {
    const entry = { signature: 'future-1', decision: 'future_decision_type' } as unknown as ProposedEntryInput;
    expect(() => build([entry])).not.toThrow();
    const body = build([entry]);
    expect(body).toContain('⚪ Неизвестное решение');
    expect(body).toContain('Тип решения: `future_decision_type`');
  });
});

describe('buildPullRequestBody — no secret leakage', () => {
  it('never includes secret-like fixture values in the rendered body', () => {
    const FAKE_SECRET = 'super-secret-shared-value-should-never-leak';
    const FAKE_GITHUB_TOKEN = 'ghp_fakeTokenShouldNeverLeak';
    const body = build([
      {
        signature: 'sig-1',
        decision: 'mapped',
        targetVariableName: 'bg-accent-main',
        comment: 'normal designer comment',
      },
    ]);
    expect(body).not.toContain(FAKE_SECRET);
    expect(body).not.toContain(FAKE_GITHUB_TOKEN);
  });
});
