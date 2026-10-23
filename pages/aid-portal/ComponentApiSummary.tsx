import { CopyButton } from './CopyButton';
import { ValueKindChip, type ComponentValueKind } from './componentValueKind';

/**
 * Machine-readable API contract for a component review page: props as a
 * TypeScript interface, plus states / values / modes / slots / tokens as flat
 * lists. States and values are separate sections on purpose — see
 * `component-standards.md` §7.3 «Состояние против значения» (ADR-021).
 *
 * Shared primitive — pass a different `ComponentApiSpec` for a new component.
 */

export interface ComponentPropDef {
  name: string;
  type: string;
  optional?: boolean;
  defaultValue?: string;
  note?: string;
}

export interface ComponentStateDef {
  name: string;
  supported: boolean;
  note?: string;
}

/**
 * A value is what the component holds, not how it is being interacted with:
 * it does not arise from interaction, survives `disabled`, and stays out of
 * the variant × state matrix (`component-standards.md` §7.3).
 */
export interface ComponentValueDef {
  name: string;
  type: string;
  note?: string;
}

export interface ComponentModeDef {
  name: string;
  maps: string;
}

export interface ComponentSlotDef {
  name: string;
  note?: string;
}

export interface ComponentTokenDef {
  name: string;
  reference: string;
  kind: ComponentValueKind;
}

export interface ComponentApiSpec {
  interfaceName: string;
  props: ComponentPropDef[];
  states: ComponentStateDef[];
  /** Omitted when the component holds no value of its own. */
  values?: ComponentValueDef[];
  modes: ComponentModeDef[];
  slots: ComponentSlotDef[];
  tokens: ComponentTokenDef[];
}

export const COMPONENT_API_SUMMARY_STYLE = `
.ds-capi {
  margin-bottom: var(--pf-spacing-32);
}
.ds-capi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-spacing-12);
  margin-bottom: var(--pf-spacing-10);
}
.ds-capi-head h2 {
  margin: 0;
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.ds-capi-code {
  margin: 0;
  padding: var(--pf-spacing-16);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-zebra);
  overflow-x: auto;
  font: var(--pf-font-code-m);
  color: var(--pf-text-primary);
  tab-size: 2;
}
.ds-capi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--pf-spacing-16);
  margin-top: var(--pf-spacing-16);
}
.ds-capi-card {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-12) var(--pf-spacing-16);
}
.ds-capi-card h3 {
  margin: 0 0 var(--pf-spacing-8);
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.ds-capi-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-6);
  font-family: var(--pf-type-family-sans-1);
  font-size: 12px; /* pf-gap: body-xs 12/16·400 */
  line-height: 18px; /* pf-gap: body-xs */
}
.ds-capi-list li {
  display: flex;
  align-items: baseline;
  gap: var(--pf-spacing-8);
  flex-wrap: wrap;
}
.ds-capi-list code {
  font: var(--pf-font-code-s);
  color: var(--pf-text-primary);
}
/* Флаг supported — Badge Success / Neutral (.pf-badge в разметке) */
.ds-capi-flag {
  align-self: center;
}
.ds-capi-note {
  color: var(--pf-text-secondary);
  font-size: 11px; /* pf-gap: body-xs 12/16·400 */
}
.ds-capi-list code.ds-capi-note {
  font: var(--pf-font-code-s);
  color: var(--pf-text-secondary);
}
.ds-capi-empty {
  margin: 0;
  font-size: 12px; /* pf-gap: body-xs 12/16·400 */
  line-height: 18px; /* pf-gap: body-xs */
  color: var(--pf-text-secondary);
}
`;

export function buildPropsInterface(spec: ComponentApiSpec): string {
  const lines = spec.props.map((prop) => {
    const key = /^[A-Za-z_$][\w$]*$/.test(prop.name) ? prop.name : `'${prop.name}'`;
    const trailing = [
      prop.defaultValue ? `default: ${prop.defaultValue}` : null,
      prop.note ?? null,
    ]
      .filter(Boolean)
      .join(' · ');
    return `  ${key}${prop.optional ? '?' : ''}: ${prop.type};${trailing ? ` // ${trailing}` : ''}`;
  });

  return `interface ${spec.interfaceName} {\n${lines.join('\n')}\n}`;
}

export function ComponentApiSummary({ spec }: { spec: ComponentApiSpec }) {
  const propsInterface = buildPropsInterface(spec);

  return (
    <section className="ds-capi" aria-labelledby="ds-capi-heading">
      <div className="ds-capi-head">
        <h2 id="ds-capi-heading">API</h2>
        <CopyButton value={propsInterface} label="Copy interface" />
      </div>

      <pre className="ds-capi-code">
        <code>{propsInterface}</code>
      </pre>

      <div className="ds-capi-grid">
        <div className="ds-capi-card">
          <h3>States</h3>
          <ul className="ds-capi-list">
            {spec.states.map((state) => (
              <li key={state.name}>
                <code>{state.name}</code>
                <span
                  className={`ds-capi-flag pf-badge${state.supported ? ' pf-badge--success' : ''}`}
                  data-supported={state.supported}
                >
                  {state.supported ? 'yes' : 'no'}
                </span>
                {state.note && <span className="ds-capi-note">{state.note}</span>}
              </li>
            ))}
          </ul>
        </div>

        {spec.values && spec.values.length > 0 && (
          <div className="ds-capi-card">
            <h3>Values</h3>
            <ul className="ds-capi-list">
              {spec.values.map((value) => (
                <li key={value.name}>
                  <code>{value.name}</code>
                  <code className="ds-capi-note">{value.type}</code>
                  {value.note && <span className="ds-capi-note">{value.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="ds-capi-card">
          <h3>Modes</h3>
          <ul className="ds-capi-list">
            {spec.modes.map((mode) => (
              <li key={mode.name}>
                <code>{mode.name}</code>
                <span className="ds-capi-note">{mode.maps}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ds-capi-card">
          <h3>Slots</h3>
          {spec.slots.length > 0 ? (
            <ul className="ds-capi-list">
              {spec.slots.map((slot) => (
                <li key={slot.name}>
                  <code>{slot.name}</code>
                  {slot.note && <span className="ds-capi-note">{slot.note}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ds-capi-empty">none</p>
          )}
        </div>

        <div className="ds-capi-card">
          <h3>Tokens</h3>
          <ul className="ds-capi-list">
            {spec.tokens.map((token) => (
              <li key={token.reference}>
                <code>{token.name}</code>
                <ValueKindChip kind={token.kind} />
                <code className="ds-capi-note">{token.reference}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
