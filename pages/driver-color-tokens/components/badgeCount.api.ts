import type { ComponentApiSpec } from '../ComponentApiSummary';
import type { CodeSnippetPlatform } from '../ComponentCodeSnippet';
import type { DriverColorMode } from './anatomyTypes';

/**
 * BadgeCount API contract + code snippet generation for the review page.
 * Props mirror `BadgeCountProps` in `components/BadgeCount.tsx`.
 */

export interface BadgeCountSelection {
  mode: DriverColorMode;
  value: number;
}

/** Value-length variants — replaces the interactive state matrix for this
 * non-interactive component (per `component-page-baseline.mdc` diff protocol). */
export const BADGE_COUNT_VALUE_VARIANTS: { id: string; label: string; value: number }[] = [
  { id: 'single-digit', label: '1 digit', value: 3 },
  { id: 'double-digit', label: '2 digits', value: 42 },
  { id: 'overflow', label: 'Overflow (>99)', value: 128 },
];

export const badgeCountApiSpec: ComponentApiSpec = {
  interfaceName: 'BadgeCountProps',
  props: [
    { name: 'value', type: 'number' },
    { name: 'max', type: 'number', optional: true, defaultValue: '99' },
    { name: 'id', type: 'string', optional: true },
    { name: 'className', type: 'string', optional: true },
    { name: 'aria-label', type: 'string', optional: true },
  ],
  states: [
    { name: 'default (1–2 digits)', supported: true },
    { name: 'overflow (value > max)', supported: true, note: 'renders "{max}+"' },
    { name: 'hover / pressed / focused', supported: false, note: 'non-interactive — nothing to click' },
    { name: 'disabled / loading', supported: false, note: 'no product scenario, no Figma variant' },
  ],
  modes: [
    { name: 'Day', maps: 'light · row.day (theme-independent — same as Night)' },
    { name: 'Night', maps: 'dark · row.night (theme-independent — same as Day)' },
  ],
  slots: [],
  tokens: [
    { name: 'Fields · Warning', reference: '--ds-badge-count-bg', kind: 'semantic-token' },
    { name: 'Texts · Primary light ind', reference: '--ds-badge-count-text', kind: 'semantic-token' },
    { name: 'radius-12', reference: '12px', kind: 'semantic-token' },
    { name: 'space-2 / space-6', reference: '2px / 6px padding', kind: 'semantic-token' },
    { name: 'shadow-1', reference: 'elevation', kind: 'semantic-token' },
    { name: 'subtitle-2', reference: 'Roboto Medium 14/16, tracking 0.1', kind: 'semantic-token' },
  ],
};

export function formatBadgeCountSelection(selection: BadgeCountSelection): string {
  return `mode: ${selection.mode} · value: ${selection.value}`;
}

function buildReactSnippet(selection: BadgeCountSelection): string {
  const isNight = selection.mode === 'night';
  const elementIndent = isNight ? '  ' : '';
  const element = `${elementIndent}<BadgeCount value={${selection.value}} />`;

  const header = [
    "import { BadgeCount } from './components/BadgeCount';",
    '',
    '// Colors resolve from semantic tokens via CSS vars on .ds-badge-count-root:',
    '// --ds-badge-count-bg (Fields · Warning) / --ds-badge-count-text (Texts · Primary light ind)',
  ];

  const body = isNight
    ? ['// Night mode: ambient [data-theme="night"] ancestor overrides the vars', '<div data-theme="night">', element, '</div>']
    : [element];

  return [...header, '', ...body].join('\n');
}

function buildSwiftUISnippet(selection: BadgeCountSelection): string {
  const isNight = selection.mode === 'night';
  const nightNote = isNight
    ? ['// Night: apply .preferredColorScheme(.dark) on ancestor — background/text tokens are theme-independent here']
    : [];

  return [
    '// Reference implementation per skills/_shared/platforms.md (iOS section).',
    '// No BadgeCountView.swift exists in this repository — sample only.',
    ...nightNote,
    '',
    'struct BadgeCountView: View {',
    '    var value: Int',
    '    var max: Int = 99',
    '',
    '    private var label: String {',
    '        value > max ? "\\(max)+" : "\\(value)"',
    '    }',
    '',
    '    var body: some View {',
    '        Text(label)',
    '            .font(DSTypography.subtitle2)',
    '            .foregroundColor(DSTokens.BadgeCount.text)',
    '            .padding(.horizontal, DSSpacing.space6)',
    '            .padding(.vertical, DSSpacing.space2)',
    '            .background(DSTokens.BadgeCount.background)',
    '            .clipShape(RoundedRectangle(cornerRadius: DSRadius.radius12))',
    '            .shadow(DSShadow.shadow1)',
    '    }',
    '}',
    '',
    '// DSTokens extension (Fields · Warning, Texts · Primary light ind)',
    'extension DSTokens {',
    '    struct BadgeCount {',
    '        static let background = Color("fields.warning")',
    '        static let text = Color("texts.primary-light-ind")',
    '    }',
    '}',
    '',
    '// Usage:',
    `BadgeCountView(value: ${selection.value})`,
  ].join('\n');
}

function buildComposeSnippet(selection: BadgeCountSelection): string {
  const isNight = selection.mode === 'night';

  return [
    '// Reference implementation per skills/_shared/platforms.md (Android section).',
    '// No BadgeCount.kt exists in this repository — sample only.',
    '',
    '@Composable',
    'fun BadgeCount(',
    '    value: Int,',
    '    max: Int = 99,',
    '    modifier: Modifier = Modifier',
    ') {',
    '    val tokens = DSTheme.tokens',
    '    val label = if (value > max) "$max+" else "$value"',
    '    Text(',
    '        text = label,',
    '        style = DSTypography.subtitle2,',
    '        color = tokens.badgeCount.text,',
    '        modifier = modifier',
    '            .background(',
    '                color = tokens.badgeCount.background,',
    '                shape = RoundedCornerShape(DSRadius.radius12)',
    '            )',
    '            .padding(horizontal = DSSpacing.space6, vertical = DSSpacing.space2)',
    '    )',
    '}',
    '',
    `// isNightMode = ${isNight ? 'true' : 'false'} (theme-independent tokens — same output)`,
    '',
    '// Usage:',
    `BadgeCount(value = ${selection.value})`,
  ].join('\n');
}

export function buildBadgeCountSnippets(selection: BadgeCountSelection): CodeSnippetPlatform[] {
  return [
    {
      id: 'react',
      label: 'React / TSX',
      code: buildReactSnippet(selection),
      sourcePath: 'pages/driver-color-tokens/components/BadgeCount.tsx',
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
