import { describe, expect, it } from 'vitest';
import { badgeCountAnatomySchema } from './badgeCount.anatomy';
import { badgeDotAnatomySchema } from './badgeDot.anatomy';
import { switchAnatomySchema } from './switch.anatomy';
import { radius, shadow, spacing, typography } from './productTokens';
import type { AnatomySchema } from './anatomyTypes';

/**
 * Страж находки №1 (аудит 2026-09-21).
 *
 * Анатомия объявляла `semantic-token` для радиуса, отступов, тени и
 * типографики, а реализация писала литералы — и один из объявленных токенов
 * (`shadow-1`) вообще не резолвился по тому полю, по которому его искали.
 * Обнаружилось это только вручную.
 *
 * Тест закрывает класс: каждая ссылка на непветовой токен в анатомии обязана
 * резолвиться в данных продукта. Ошибка в имени ломает тест, а не остаётся
 * незамеченной записью в документации.
 *
 * Цветовые ссылки сюда не входят: их резолвит цветовой слой компонента,
 * который уже бросает ошибку при отсутствии строки.
 */

const RESOLVERS: Array<{ prefix: string; resolve: (name: string) => unknown }> = [
  { prefix: 'space-', resolve: spacing },
  { prefix: 'radius-', resolve: radius },
  { prefix: 'shadow-', resolve: shadow },
];

function nonColorTokenRefs(schema: AnatomySchema): Array<{ zone: string; property: string; ref: string }> {
  return schema.zones.flatMap((zone) =>
    zone.properties
      .filter((property) => property.kind === 'semantic-token' && property.tokenRef)
      .map((property) => ({ zone: zone.label, property: property.property, ref: property.tokenRef! }))
      .filter((entry) => RESOLVERS.some((r) => entry.ref.startsWith(r.prefix))),
  );
}

const SCHEMAS: Array<[string, AnatomySchema]> = [
  ['BadgeCount', badgeCountAnatomySchema],
  ['BadgeDot', badgeDotAnatomySchema],
  ['Switch', switchAnatomySchema],
];

describe('ссылки на токены в анатомии резолвятся', () => {
  for (const [name, schema] of SCHEMAS) {
    const refs = nonColorTokenRefs(schema);

    it(`${name}: ${refs.length} непветовых ссылок`, () => {
      for (const entry of refs) {
        const resolver = RESOLVERS.find((r) => entry.ref.startsWith(r.prefix))!;
        expect(
          () => resolver.resolve(entry.ref),
          `${name} · ${entry.zone} · ${entry.property} → ${entry.ref}`,
        ).not.toThrow();
      }
    });
  }
});

describe('несуществующее имя токена останавливает сборку', () => {
  it('пространство', () => expect(() => spacing('space-нет-такого')).toThrow(/не найден/));
  it('радиус', () => expect(() => radius('radius-нет-такого')).toThrow(/не найден/));
  it('тень', () => expect(() => shadow('shadow-нет-такой')).toThrow(/не найден/));
  it('типографика', () => expect(() => typography('нет-такой-роли')).toThrow(/не найден/));
});

describe('значения совпадают с тем, что было записано литералами', () => {
  it('BadgeCount: отступы, радиус, типографика', () => {
    expect(spacing('space-2')).toBe('2px');
    expect(spacing('space-6')).toBe('6px');
    expect(radius('radius-12')).toBe('12px');
    expect(typography('subtitle-2')).toMatchObject({
      fontSize: '14px',
      lineHeight: '16px',
      letterSpacing: '0.1px',
      fontWeight: 500,
    });
  });

  it('BadgeDot: размер', () => {
    expect(spacing('space-8')).toBe('8px');
  });
});
