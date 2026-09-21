import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from './Switch';

/**
 * Definition of Done, п.7: значения по умолчанию, поведение в disabled и
 * loading, вызов колбэков. П.8: состояние и обработчики связаны реально.
 */

describe('Switch', () => {
  it('объявляет себя переключателем и сообщает текущее значение', () => {
    render(<Switch checked aria-label="Уведомления" />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'true');
    expect(el).toHaveAccessibleName('Уведомления');
  });

  it('по умолчанию не заблокирован и не занят', () => {
    render(<Switch checked={false} aria-label="s" />);
    const el = screen.getByRole('switch');
    expect(el).toBeEnabled();
    expect(el).not.toHaveAttribute('aria-busy');
  });

  it('передаёт в onChange противоположное значение, а не текущее', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} aria-label="s" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('реагирует на Enter и Space — путь с клавиатуры не прерван', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} aria-label="s" />);
    const el = screen.getByRole('switch');
    fireEvent.keyDown(el, { key: 'Enter' });
    fireEvent.keyDown(el, { key: ' ' });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('в disabled не вызывает onChange', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} isDisabled aria-label="s" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('в loading блокирует переключение, но остаётся в потоке фокуса', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} isLoading aria-label="s" />);
    const el = screen.getByRole('switch');
    fireEvent.click(el);
    expect(onChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    // Загрузка — временное состояние: элемент должен оставаться достижимым
    // с клавиатуры, в отличие от disabled.
    expect(el).toBeEnabled();
  });

  it('без onChange не падает при нажатии', () => {
    render(<Switch checked={false} aria-label="s" />);
    expect(() => fireEvent.click(screen.getByRole('switch'))).not.toThrow();
  });
});
