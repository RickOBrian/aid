import type { Meta, StoryObj } from '@storybook/react';
import {
  ButtonText,
  BUTTON_TEXT_SIZES,
  BUTTON_TEXT_VARIANTS,
  type ButtonTextSize,
  type ButtonTextVariant,
} from '../../../src/components/sutochno/ButtonText';

const UI_KIT = 'sutochno';

const VARIANT_LABEL: Record<ButtonTextVariant, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  outline: 'Outline',
  tertiary: 'Tertiary',
  primaryInverse: 'Primary Inverse',
  primaryInverseStatic: 'Primary Inverse Static',
  transparent: 'Transparent',
};

const SampleIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

function Swatch({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      {children}
    </div>
  );
}

const meta = {
  title: 'Sutochno/Components/ButtonText',
  component: ButtonText,
  tags: ['sutochno'],
  parameters: { uiKit: UI_KIT },
  argTypes: {
    variant: { control: 'select', options: BUTTON_TEXT_VARIANTS },
    size: { control: 'select', options: BUTTON_TEXT_SIZES },
    children: { control: 'text' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    forceState: { control: 'select', options: [undefined, 'pressed'] },
    icon: { control: false },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'large',
  },
} satisfies Meta<typeof ButtonText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    icon: <SampleIcon />,
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 24, background: '#fff' }}>
      {BUTTON_TEXT_VARIANTS.map((variant) => (
        <Swatch key={variant} label={VARIANT_LABEL[variant]}>
          <ButtonText variant={variant} icon={<SampleIcon />}>
            Button
          </ButtonText>
        </Swatch>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, padding: 24 }}>
      {BUTTON_TEXT_SIZES.map((size) => (
        <Swatch key={size} label={size}>
          <ButtonText size={size} icon={size !== 'tiny' ? <SampleIcon /> : undefined}>
            Button
          </ButtonText>
        </Swatch>
      ))}
    </div>
  ),
};

export const AllVariantsAllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, background: '#fff' }}>
      {BUTTON_TEXT_VARIANTS.map((variant) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 160, fontSize: 12, color: '#666', flexShrink: 0 }}>{VARIANT_LABEL[variant]}</div>
          {BUTTON_TEXT_SIZES.map((size: ButtonTextSize) => (
            <ButtonText key={size} variant={variant} size={size} icon={size !== 'tiny' ? <SampleIcon /> : undefined}>
              Button
            </ButtonText>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Соответствует документационной раскладке Figma «ButtonText / [Variant] / States»:
 * Default / Pressed (forceState, демо-only) / Disabled / Loading.
 */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, padding: 24 }}>
      {(['primary', 'secondary', 'transparent', 'primaryInverse'] as ButtonTextVariant[]).map((variant) => (
        <div
          key={variant}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            background: variant === 'primaryInverse' ? '#1c1c1c' : '#f6f6f9',
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 12, color: variant === 'primaryInverse' ? '#fff' : '#666' }}>
            {VARIANT_LABEL[variant]}
          </div>
          <Swatch label="Default">
            <ButtonText variant={variant}>Default</ButtonText>
          </Swatch>
          <Swatch label="Pressed">
            <ButtonText variant={variant} forceState="pressed">Pressed</ButtonText>
          </Swatch>
          <Swatch label="Disabled">
            <ButtonText variant={variant} disabled>Disabled</ButtonText>
          </Swatch>
          <Swatch label="Loading">
            <ButtonText variant={variant} loading>Loading</ButtonText>
          </Swatch>
        </div>
      ))}
    </div>
  ),
};

/** Tiny — единственный размер с обязательным trailing chevron и без iconLeft. */
export const TinySize: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24 }}>
      {BUTTON_TEXT_VARIANTS.map((variant) => (
        <ButtonText key={variant} variant={variant} size="tiny">
          {VARIANT_LABEL[variant]}
        </ButtonText>
      ))}
    </div>
  ),
};
