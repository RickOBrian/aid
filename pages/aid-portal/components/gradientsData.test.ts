import { describe, expect, it } from 'vitest';
import { gradientCss, gradientStyles, splitGradientColor } from '../gradientsData';

/**
 * Градиенты Driver — из Figma: стили Gradients/* на переменных коллекции
 * `gradients` (day, night).
 */

describe('gradientStyles', () => {
  it('точки идут по возрастанию позиции, от 0 до 100', () => {
    for (const style of gradientStyles) {
      const positions = style.stops.map((stop) => stop.position);
      expect(positions[0]).toBe(0);
      expect(positions[positions.length - 1]).toBe(100);
      expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    }
  });

  it('ночью отличается только Bottom — так в Figma 1.1.0', () => {
    const differ = gradientStyles.filter((style) => style.stops.some((stop) => stop.day !== stop.night));
    expect(differ.map((style) => style.id)).toEqual(['bottom']);
  });

  it('переменная каждой точки — из группы своего стиля', () => {
    for (const style of gradientStyles) {
      const group = style.name.replace('Gradients/', '');
      for (const stop of style.stops) {
        expect(stop.variable.startsWith(`${group}/Step `)).toBe(true);
      }
    }
  });
});

describe('gradientCss', () => {
  it('собирает linear-gradient для режима', () => {
    const bottom = gradientStyles.find((style) => style.id === 'bottom')!;
    expect(gradientCss(bottom, 'night')).toBe('linear-gradient(180deg, #1F1F2300 0%, #1F1F23 100%)');
  });
});

describe('splitGradientColor', () => {
  it('отделяет прозрачность', () => {
    expect(splitGradientColor('#1F1F2300')).toEqual({ hex: '#1F1F23', opacity: 0 });
    expect(splitGradientColor('#FFFFFF')).toEqual({ hex: '#FFFFFF', opacity: 100 });
  });
});
