import { describe, expect, it } from 'vitest';
import { canonicalAppPath, productHubPath, productPath, resolveProductRoute } from '../productRegistry';

/**
 * Короткие адреса: хаб продукта — `aidteam.pro/<продукт>`, по умолчанию driver,
 * старые адреса переписываются на канонические при загрузке.
 */

describe('canonicalAppPath', () => {
  it('корень и бывший хаб — на хаб driver', () => {
    expect(canonicalAppPath('/')).toBe('/driver');
    expect(canonicalAppPath('/design-system')).toBe('/driver');
    expect(canonicalAppPath('/driver/design-system')).toBe('/driver');
    expect(canonicalAppPath('/rider/design-system')).toBe('/rider');
  });

  it('адрес без продукта — в driver', () => {
    expect(canonicalAppPath('/tokens/colors')).toBe('/driver/tokens/colors');
    expect(canonicalAppPath('/components/switch')).toBe('/driver/components/switch');
  });

  it('канонический адрес не трогает, хвостовой слеш убирает', () => {
    expect(canonicalAppPath('/driver')).toBeNull();
    expect(canonicalAppPath('/rider/tokens/colors')).toBeNull();
    expect(canonicalAppPath('/driver/')).toBe('/driver');
  });

  it('/login живёт вне продуктов', () => {
    expect(canonicalAppPath('/login')).toBeNull();
  });
});

describe('productPath', () => {
  it('маршрут приложения — внутри текущего продукта', () => {
    expect(productPath('rider', '/tokens/colors')).toBe('/rider/tokens/colors');
    expect(productPath('rider', '/design-system')).toBe('/rider');
    expect(productPath('rider', '/')).toBe('/rider');
  });

  it('уже с продуктом — как есть, бывший хаб — коротко', () => {
    expect(productPath('rider', '/driver/tokens/colors')).toBe('/driver/tokens/colors');
    expect(productPath('rider', '/driver/design-system')).toBe('/driver');
  });
});

describe('хаб продукта', () => {
  it('короткий адрес открывает хаб', () => {
    expect(productHubPath('driver')).toBe('/driver');
    expect(resolveProductRoute('/driver')).toEqual({ productId: 'driver', remainder: '' });
  });
});
