import type { Meta, StoryObj } from '@storybook/react';
import { FigmaStylesPage } from '../../src/pages/FigmaStyles/FigmaStylesPage';

const meta = {
  title: 'Figma Styles/Driver v1',
  component: FigmaStylesPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FigmaStylesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Page: Story = {};
