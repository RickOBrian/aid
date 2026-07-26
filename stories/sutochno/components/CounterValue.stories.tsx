import type { Meta, StoryObj } from '@storybook/react';
import { CounterValue, COUNTER_VALUE_SIZES } from '../../../src/components/sutochno/CounterValue';

const UI_KIT = 'sutochno';

function Swatch({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      {children}
    </div>
  );
}

const meta = {
  title: 'Sutochno/Components/CounterValue',
  component: CounterValue,
  tags: ['sutochno'],
  parameters: { uiKit: UI_KIT },
  argTypes: {
    size: { control: 'select', options: COUNTER_VALUE_SIZES },
    value: { control: 'text' },
    max: { control: 'number' },
  },
  args: {
    value: 1,
    size: 'medium',
  },
} satisfies Meta<typeof CounterValue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, padding: 24 }}>
      {COUNTER_VALUE_SIZES.map((size) => (
        <Swatch key={size} label={size}>
          <CounterValue size={size} value={1} />
        </Swatch>
      ))}
    </div>
  ),
};

/** Демонстрация многозначных чисел и переполнения через `max`. */
export const DigitCount: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      {COUNTER_VALUE_SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 80, fontSize: 12, color: '#666', flexShrink: 0 }}>{size}</div>
          <CounterValue size={size} value={1} />
          <CounterValue size={size} value={12} />
          <CounterValue size={size} value={100} max={99} />
        </div>
      ))}
    </div>
  ),
};
