import type { Meta, StoryObj } from '@storybook/react';
import { TokensOverview } from '../../../src/components/TokensOverview';
import { loadTokens } from '../../../src/tokens';

const UI_KIT = 'sutochno';

const meta = {
  title: 'Sutochno/Tokens/Colors',
  component: TokensOverview,
  tags: ['sutochno'],
  parameters: {
    uiKit: UI_KIT,
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TokensOverview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllTokens: Story = {
  args: {
    uiKitId: UI_KIT,
    tokens: loadTokens(UI_KIT).tokens,
  },
};
