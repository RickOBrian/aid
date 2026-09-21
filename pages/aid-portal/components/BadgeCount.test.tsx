import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeCount, formatBadgeCountValue } from './BadgeCount';

/**
 * Definition of Done, п.5: устойчивость к контенту — переполнение разряда.
 */

describe('formatBadgeCountValue', () => {
  it('показывает значение как есть, пока оно не превышает предел', () => {
    expect(formatBadgeCountValue(0)).toBe('0');
    expect(formatBadgeCountValue(99)).toBe('99');
  });

  it('сворачивает превышение в «предел+»', () => {
    expect(formatBadgeCountValue(100)).toBe('99+');
    expect(formatBadgeCountValue(1000)).toBe('99+');
  });

  it('уважает свой предел', () => {
    expect(formatBadgeCountValue(10, 9)).toBe('9+');
  });

  it('Infinity отключает ограничение', () => {
    expect(formatBadgeCountValue(1000, Infinity)).toBe('1000');
  });
});

describe('BadgeCount', () => {
  it('рисует свёрнутое значение, а не исходное', () => {
    render(<BadgeCount value={250} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('принимает полный контекст для скринридера', () => {
    const { container } = render(<BadgeCount value={3} aria-label="3 непрочитанных сообщения" />);
    expect(container.querySelector('[aria-label]')).toHaveAttribute(
      'aria-label',
      '3 непрочитанных сообщения',
    );
  });
});
