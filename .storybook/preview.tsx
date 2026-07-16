import type { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import { applyTokenBundleToRoot, loadTokens } from '../src/tokens';

const UI_KIT_OPTIONS = ['ui-kit-a', 'ui-kit-b', 'sutochno'] as const;

const preview: Preview = {
  globalTypes: {
    uiKit: {
      description: 'Active UI Kit implementation',
      toolbar: {
        title: 'UI Kit',
        icon: 'component',
        items: UI_KIT_OPTIONS.map((value) => ({
          value,
          title: value,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    uiKit: 'ui-kit-a',
  },
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story, context) => {
      const uiKit = (context.globals.uiKit as string) ?? 'ui-kit-a';
      const storyUiKit = context.parameters.uiKit as string | undefined;

      if (storyUiKit && storyUiKit !== uiKit) {
        return (
          <div style={{ padding: 24, color: '#6E6E73', fontFamily: 'system-ui, sans-serif' }}>
            Story скрыта: относится к <strong>{storyUiKit}</strong>, выбран <strong>{uiKit}</strong>.
          </div>
        );
      }

      return <TokenDecorator uiKit={uiKit} Story={Story} />;
    },
  ],
};

function TokenDecorator({
  uiKit,
  Story,
}: {
  uiKit: string;
  Story: () => React.JSX.Element;
}) {
  useEffect(() => {
    const bundle = loadTokens(uiKit);
    applyTokenBundleToRoot(bundle);
    return () => {
      document.documentElement.removeAttribute('data-ui-kit');
    };
  }, [uiKit]);

  return <Story />;
}

export default preview;
