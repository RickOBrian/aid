import { CopyButton } from './CopyButton';
import { ValueKindChip, type ComponentValueKind } from './componentValueKind';

/**
 * Machine-readable API contract for a component review page: props as a
 * TypeScript interface, plus states / modes / slots / tokens as flat lists.
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
  modes: ComponentModeDef[];
  slots: ComponentSlotDef[];
  tokens: ComponentTokenDef[];
}

export const COMPONENT_API_SUMMARY_STYLE = `
.ds-capi {
  margin-bottom: 32px;
}
.ds-capi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.ds-capi-head h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
}
.ds-capi-code {
  margin: 0;
  padding: 14px 18px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  background: #fafafa;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 20px;
  color: #2d2c2e;
  tab-size: 2;
}
.ds-capi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.ds-capi-card {
  border: 1px solid #ebedf0;
  border-radius: 12px;
  padding: 12px 16px;
}
.ds-capi-card h3 {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.38);
}
.ds-capi-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  line-height: 18px;
}
.ds-capi-list li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.ds-capi-list code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #2d2c2e;
}
.ds-capi-flag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.ds-capi-flag[data-supported="true"] {
  color: #1f7a3f;
}
.ds-capi-flag[data-supported="false"] {
  color: rgba(0, 0, 0, 0.32);
}
.ds-capi-note {
  color: rgba(0, 0, 0, 0.45);
  font-size: 11px;
}
.ds-capi-empty {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.38);
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
                <span className="ds-capi-flag" data-supported={state.supported}>
                  {state.supported ? 'yes' : 'no'}
                </span>
                {state.note && <span className="ds-capi-note">{state.note}</span>}
              </li>
            ))}
          </ul>
        </div>

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
