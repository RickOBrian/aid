import type { Meta, StoryObj } from '@storybook/react';

const UI_KIT = 'sutochno';

const meta = {
  title: 'Sutochno/Components/Welcome',
  tags: ['sutochno'],
  parameters: { uiKit: UI_KIT },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  render: () => (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: 'var(--text-primary, #111)' }}>
      Компоненты появятся здесь
    </div>
  ),
};
