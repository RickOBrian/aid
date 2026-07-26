import type { StorybookConfig } from '@storybook/react-vite';
import { join } from 'node:path';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    './addons/ui-kit-sidebar/register.ts',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tokens': join(__dirname, '../src/tokens'),
    };
    return config;
  },
};

export default config;
