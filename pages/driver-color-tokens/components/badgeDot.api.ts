import type { ComponentApiSpec } from '../ComponentApiSummary';
import type { CodeSnippetPlatform } from '../ComponentCodeSnippet';
import type { DriverColorMode } from './anatomyTypes';

export interface BadgeDotSelection {
  mode: DriverColorMode;
}

export const badgeDotApiSpec: ComponentApiSpec = {
  interfaceName: 'BadgeDotProps',
  props: [
    { name: 'id', type: 'string', optional: true },
    { name: 'className', type: 'string', optional: true },
    { name: 'aria-label', type: 'string', optional: true },
    { name: 'aria-hidden', type: 'boolean', optional: true },
  ],
  states: [
    { name: 'default', supported: true },
    { name: 'hover / pressed / focused', supported: false, note: 'non-interactive — nothing to click' },
    { name: 'disabled / loading', supported: false, note: 'no product scenario, no Figma variant' },
  ],
  modes: [
    { name: 'Day', maps: 'light · row.day (theme-independent — same as Night)' },
    { name: 'Night', maps: 'dark · row.night (theme-independent — same as Day)' },
  ],
  slots: [],
  tokens: [
    { name: 'Icons · Warning', reference: '--ds-badge-dot-bg', kind: 'semantic-token' },
    { name: 'space-8', reference: '8×8px', kind: 'semantic-token' },
  ],
};

export function formatBadgeDotSelection(selection: BadgeDotSelection): string {
  return `mode: ${selection.mode}`;
}

function buildReactSnippet(selection: BadgeDotSelection): string {
  const isNight = selection.mode === 'night';
  const elementIndent = isNight ? '  ' : '';
  const element = `${elementIndent}<BadgeDot aria-label="Есть непрочитанные уведомления" />`;

  const header = [
    "import { BadgeDot } from './components/BadgeDot';",
    '',
    '// Fill resolves from semantic token via CSS var on .ds-badge-dot-root:',
    '// --ds-badge-dot-bg (Icons · Warning)',
  ];

  const body = isNight
    ? [
        '// Night mode: ambient [data-theme="night"] ancestor overrides the var',
        '<div data-theme="night">',
        element,
        '</div>',
      ]
    : [element];

  return [...header, '', ...body].join('\n');
}

function buildSwiftUISnippet(selection: BadgeDotSelection): string {
  const isNight = selection.mode === 'night';
  const nightNote = isNight
    ? ['// Night: apply .preferredColorScheme(.dark) on ancestor — fill token is theme-independent here']
    : [];

  return [
    '// Reference implementation per skills/_shared/platforms.md (iOS section).',
    '// No BadgeDotView.swift exists in this repository — sample only.',
    ...nightNote,
    '',
    'struct BadgeDotView: View {',
    '    var accessibilityLabel: String?',
    '',
    '    var body: some View {',
    '        Circle()',
    '            .fill(DSTokens.BadgeDot.background)',
    '            .frame(width: DSSpacing.space8, height: DSSpacing.space8)',
    '            .accessibilityLabel(accessibilityLabel ?? "")',
    '    }',
    '}',
    '',
    'extension DSTokens {',
    '    struct BadgeDot {',
    '        static let background = Color("icons.warning")',
    '    }',
    '}',
    '',
    '// Usage:',
    'BadgeDotView(accessibilityLabel: "Есть непрочитанные уведомления")',
  ].join('\n');
}

function buildComposeSnippet(selection: BadgeDotSelection): string {
  const isNight = selection.mode === 'night';

  return [
    '// Reference implementation per skills/_shared/platforms.md (Android section).',
    '// No BadgeDot.kt exists in this repository — sample only.',
    '',
    '@Composable',
    'fun BadgeDot(',
    '    modifier: Modifier = Modifier,',
    '    contentDescription: String? = null',
    ') {',
    '    val tokens = DSTheme.tokens',
    '    Box(',
    '        modifier = modifier',
    '            .size(DSSpacing.space8)',
    '            .background(color = tokens.badgeDot.background, shape = CircleShape)',
    '    ) {',
    '        if (contentDescription != null) {',
    '            // Caller should merge into parent semantics when decorative',
    '        }',
    '    }',
    '}',
    '',
    `// isNightMode = ${isNight ? 'true' : 'false'} (theme-independent token — same output)`,
    '',
    '// Usage:',
    'BadgeDot(contentDescription = "Есть непрочитанные уведомления")',
  ].join('\n');
}

export function buildBadgeDotSnippets(selection: BadgeDotSelection): CodeSnippetPlatform[] {
  return [
    {
      id: 'react',
      label: 'React / TSX',
      code: buildReactSnippet(selection),
      sourcePath: 'pages/driver-color-tokens/components/BadgeDot.tsx',
    },
    {
      id: 'swiftui',
      label: 'SwiftUI',
      code: buildSwiftUISnippet(selection),
      isReferenceOnly: true,
    },
    {
      id: 'compose',
      label: 'Compose',
      code: buildComposeSnippet(selection),
      isReferenceOnly: true,
    },
  ];
}
