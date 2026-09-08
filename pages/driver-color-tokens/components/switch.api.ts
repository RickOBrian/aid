import type { ComponentApiSpec } from '../ComponentApiSummary';
import type { CodeSnippetPlatform } from '../ComponentCodeSnippet';
import type { DriverColorMode } from './anatomyTypes';

/**
 * Switch API contract + code snippet generation for the review page.
 * Props mirror `SwitchProps` in `components/Switch.tsx`.
 */

export type SwitchPreviewState = 'default' | 'hover' | 'focus' | 'disabled' | 'loading';

export interface SwitchSelection {
  mode: DriverColorMode;
  checked: boolean;
  state: SwitchPreviewState;
}

export const switchApiSpec: ComponentApiSpec = {
  interfaceName: 'SwitchProps',
  props: [
    { name: 'checked', type: 'boolean' },
    { name: 'onChange', type: '(checked: boolean) => void', optional: true },
    { name: 'isDisabled', type: 'boolean', optional: true, defaultValue: 'false' },
    { name: 'isLoading', type: 'boolean', optional: true, defaultValue: 'false' },
    { name: 'id', type: 'string', optional: true },
    { name: 'name', type: 'string', optional: true },
    { name: 'className', type: 'string', optional: true },
    { name: 'aria-label', type: 'string', optional: true },
    { name: 'aria-labelledby', type: 'string', optional: true },
  ],
  states: [
    { name: 'default', supported: true },
    { name: 'hovered', supported: true, note: 'CSS-only, @media (hover: hover)' },
    { name: 'focused', supported: true, note: 'CSS-only, :focus-visible' },
    { name: 'selected', supported: true, note: 'checked prop' },
    { name: 'disabled', supported: true, note: 'isDisabled prop' },
    { name: 'loading', supported: true, note: 'isLoading prop' },
    { name: 'pressed', supported: false },
    { name: 'error', supported: false },
    { name: 'indeterminate', supported: false },
  ],
  modes: [
    { name: 'Day', maps: 'light · row.day' },
    { name: 'Night', maps: 'dark · row.night' },
  ],
  slots: [],
  tokens: [
    { name: 'Controls · Checked', reference: '--ds-switch-checked', kind: 'semantic-token' },
    { name: 'Controls · Unchecked', reference: '--ds-switch-unchecked', kind: 'semantic-token' },
    { name: 'Controls · Key', reference: '--ds-switch-key', kind: 'semantic-token' },
    { name: 'Strokes · Primary', reference: '--ds-switch-stroke', kind: 'semantic-token' },
    { name: 'track / thumb geometry', reference: '32×20px / 16×16px', kind: 'raw-value' },
    { name: 'touch target', reference: '44×44px', kind: 'platform-convention' },
    { name: 'disabled opacity', reference: '40%', kind: 'platform-convention' },
  ],
};

export function formatSwitchSelection(selection: SwitchSelection): string {
  return `mode: ${selection.mode} · checked: ${selection.checked} · state: ${selection.state}`;
}

function buildReactSnippet(selection: SwitchSelection): string {
  const props = [`checked={${selection.checked}}`, 'onChange={setChecked}'];

  if (selection.state === 'disabled') {
    props.push('isDisabled');
  }
  if (selection.state === 'loading') {
    props.push('isLoading');
  }
  props.push('aria-label="Notifications"');

  const isNight = selection.mode === 'night';
  const indent = isNight ? '    ' : '  ';
  const elementIndent = isNight ? '  ' : '';

  const element = [
    `${elementIndent}<Switch`,
    ...props.map((prop) => `${indent}${prop}`),
    `${elementIndent}/>`,
  ].join('\n');

  const header = [
    "import { Switch } from './components/Switch';",
    '',
    '// Colors resolve from semantic tokens via CSS vars on .ds-switch-root:',
    '// --ds-switch-checked / --ds-switch-unchecked / --ds-switch-key / --ds-switch-stroke',
  ];

  if (selection.state === 'hover' || selection.state === 'focus') {
    header.push(`// ${selection.state}: CSS-only state, no prop — box-shadow 0 0 0 2px var(--ds-switch-stroke)`);
  }

  const body = isNight
    ? ['// Night mode: ambient [data-theme="night"] ancestor overrides the vars', '<div data-theme="night">', element, '</div>']
    : [element];

  return [...header, '', ...body].join('\n');
}

function buildSwiftUISnippet(selection: SwitchSelection): string {
  const isNight = selection.mode === 'night';
  const stateComments: string[] = [];
  if (selection.state === 'hover') {
    stateComments.push('// hover has no SwiftUI equivalent (no pointer) — omitted');
  }
  if (selection.state === 'focus') {
    stateComments.push('// focus ring: platform default focus indicator, no custom prop');
  }

  const propsLines = [
    `    isOn: ${selection.checked ? 'true' : 'false'},`,
    selection.state === 'disabled' ? '    isDisabled: true,' : null,
    selection.state === 'loading' ? '    isLoading: true,' : null,
    '    action: { newValue in /* parent: update @State or forward onChange */ },',
  ].filter((line): line is string => line !== null);

  const nightNote = isNight
    ? ['// Night: apply .preferredColorScheme(.dark) on ancestor — not a SwitchView prop']
    : [];

  return [
    '// Reference implementation per skills/_shared/platforms.md (iOS section).',
    '// No SwitchView.swift exists in this repository — sample only.',
    ...stateComments,
    ...nightNote,
    '',
    'struct SwitchView: View {',
    '    var isOn: Bool',
    '    var isDisabled: Bool = false',
    '    var isLoading: Bool = false',
    '    var action: ((Bool) -> Void)? = nil',
    '',
    '    var body: some View {',
    '        Toggle(isOn: Binding(',
    '            get: { isOn },',
    '            set: { newValue in action?(newValue) }',
    '        )) {',
    '            EmptyView()',
    '        }',
    '        .labelsHidden()',
    '        .disabled(isDisabled || isLoading)',
    '        .tint(DSTokens.Switch.trackBackgroundChecked)',
    '        .accessibilityLabel("Switch")',
    '        .accessibilityValue(isOn ? "On" : "Off")',
    '    }',
    '}',
    '',
    '// DSTokens extension (Controls · Checked/Unchecked/Key, Strokes · Primary)',
    'extension DSTokens {',
    '    struct Switch {',
    '        static let trackBackgroundChecked = Color("controls.checked")',
    '        static let trackBackgroundUnchecked = Color("controls.unchecked")',
    '        static let key = Color("controls.key")',
    '        static let strokePrimary = Color("strokes.primary")',
    '    }',
    '}',
    '',
    '// Usage:',
    'SwitchView(',
    ...propsLines,
    ')',
  ].join('\n');
}

function buildComposeSnippet(selection: SwitchSelection): string {
  const isNight = selection.mode === 'night';
  const stateComments: string[] = [];
  if (selection.state === 'hover') {
    stateComments.push('// hover has no Compose touch equivalent — omitted');
  }
  if (selection.state === 'focus') {
    stateComments.push('// focus ring: Modifier.focusable() default indicator, no custom prop');
  }

  const callLines = [
    `    checked = ${selection.checked ? 'true' : 'false'},`,
    'onCheckedChange = { checked = it },',
    selection.state === 'disabled' ? '    enabled = false,' : null,
    selection.state === 'loading' ? '    isLoading = true,' : null,
    `    isNightMode = ${isNight ? 'true' : 'false'}`,
  ].filter((line): line is string => line !== null);

  return [
    '// Reference implementation per skills/_shared/platforms.md (Android section).',
    '// No Switch.kt exists in this repository — sample only.',
    ...stateComments,
    '',
    '@Composable',
    'fun Switch(',
    '    checked: Boolean,',
    '    onCheckedChange: ((Boolean) -> Unit)?,',
    '    enabled: Boolean = true,',
    '    isLoading: Boolean = false,',
    '    modifier: Modifier = Modifier',
    ') {',
    '    val tokens = DSTheme.tokens',
    '    androidx.compose.material3.Switch(',
    '        checked = checked,',
    '        onCheckedChange = onCheckedChange,',
    '        enabled = enabled && !isLoading,',
    '        modifier = modifier,',
    '        colors = SwitchDefaults.colors(',
    '            checkedTrackColor = tokens.switch.trackBackgroundChecked,',
    '            uncheckedTrackColor = tokens.switch.trackBackgroundUnchecked,',
    '            checkedThumbColor = tokens.switch.key,',
    '            uncheckedThumbColor = tokens.switch.key',
    '        )',
    '    )',
    '}',
    '',
    '// Usage:',
    'Switch(',
    ...callLines,
    ')',
  ].join('\n');
}

export function buildSwitchSnippets(selection: SwitchSelection): CodeSnippetPlatform[] {
  return [
    {
      id: 'react',
      label: 'React / TSX',
      code: buildReactSnippet(selection),
      sourcePath: 'pages/driver-color-tokens/components/Switch.tsx',
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
