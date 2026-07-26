import type { Meta, StoryObj } from '@storybook/react';
import { TokensOverview } from '../../../src/components/TokensOverview';
import { loadTokens } from '../../../src/tokens';

const UI_KIT = 'ui-kit-a';

const meta = {
  title: 'UI Kit A/Tokens/Overview',
  component: TokensOverview,
  tags: ['ui-kit-a'],
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
