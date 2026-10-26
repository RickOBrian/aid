import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AnatomyProperty,
  AnatomySchema,
  AnatomyZone,
  ProductColorMode,
  ResolvedAnatomyProperty,
} from './anatomyTypes';
import { anatomyKindLabel } from './anatomyResolveSwitch';

/** Default preview scale — 100% (real component size); use zoom controls to enlarge. */
const DEFAULT_ANATOMY_ZOOM = 1;
const MIN_ANATOMY_ZOOM = 1;
const MAX_ANATOMY_ZOOM = 8;
const ANATOMY_ZOOM_STEP = 0.5;
const BADGE_SIZE = 26;
const ANCHOR_DOT_RADIUS = 3;

const ANATOMY_INSPECTOR_STYLE = `
.dsw-anatomy {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
}
.dsw-anatomy-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-spacing-12);
}
.dsw-anatomy-toolbar-label {
  margin: 0;
  font: var(--pf-font-body-s);
  color: var(--pf-text-secondary);
}
.dsw-anatomy-zoom {
  display: inline-flex;
  align-items: center;
  gap: var(--pf-spacing-4);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-main);
  padding: var(--pf-spacing-2);
}
.dsw-anatomy-zoom button {
  margin: 0;
  min-width: 32px;
  height: 28px;
  padding: 0 var(--pf-spacing-8);
  border: none;
  border-radius: var(--pf-radius-s);
  background: transparent;
  font-family: var(--pf-type-family-sans-1);
  font-size: 14px; /* pf-gap: label-m 14/20·500 (кнопка зума) */
  font-weight: var(--pf-type-weight-500);
  line-height: 1;
  color: var(--pf-text-primary);
  cursor: pointer;
  transition: background-color 150ms ease;
}
.dsw-anatomy-zoom button:hover {
  background: #f0f4ff; /* pf-gap: bg-accent-states-hover */
}
.dsw-anatomy-zoom button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsw-anatomy-zoom-value {
  min-width: 52px;
  padding: 0 var(--pf-spacing-6);
  font: var(--pf-font-label-s);
  line-height: 28px; /* высота кнопок зума 28 — размер контрола, не токен (спека §7.1, п. 9а) */
  text-align: center;
  color: var(--pf-text-secondary);
  font-variant-numeric: tabular-nums;
}
.dsw-anatomy-layout {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(260px, 320px);
  gap: var(--pf-spacing-24);
  align-items: start;
}
@media (max-width: 767px) {
  .dsw-anatomy-layout {
    grid-template-columns: 1fr;
  }
}
.dsw-anatomy-stage-wrap {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-64) var(--pf-spacing-48);
  background: var(--pf-bg-surface-zebra);
  min-height: 320px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dsw-anatomy-stage-wrap[data-theme="night"] {
  background: var(--pf-bg-inverse-main);
  border-color: var(--pf-bg-inverse-main);
}
.dsw-anatomy-canvas {
  position: relative;
  display: inline-block;
  overflow: visible;
  padding: var(--pf-spacing-64);
}
.dsw-anatomy-scale-host {
  transform-origin: center center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dsw-anatomy-stage[data-sim-state="hover"] .ds-switch-root:not(:disabled):not([aria-disabled="true"]) .ds-switch__track,
.dsw-anatomy-stage[data-sim-state="focus"] .ds-switch-root:not(:disabled):not([aria-disabled="true"]) .ds-switch__track {
  box-shadow: 0 0 0 2px var(--ds-switch-stroke);
}
.dsw-anatomy-overlay {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 2;
}
.dsw-anatomy-leaders {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}
.dsw-anatomy-leader-line {
  stroke: var(--pf-icon-accent-vivid);
  stroke-width: 1.5;
}
.dsw-anatomy-leader-line.is-active {
  stroke-width: 2;
}
.dsw-anatomy-anchor-dot {
  position: absolute;
  width: ${ANCHOR_DOT_RADIUS * 2}px;
  height: ${ANCHOR_DOT_RADIUS * 2}px;
  border-radius: 50%;
  background: var(--pf-icon-accent-vivid);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.dsw-anatomy-halo {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid var(--pf-icon-accent-vivid);
  background: transparent;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease, box-shadow 150ms ease;
}
.dsw-anatomy-halo.is-visible {
  opacity: 1;
  box-shadow: var(--pf-shadow-1);
}
.dsw-anatomy-badge {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${BADGE_SIZE}px;
  height: ${BADGE_SIZE}px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--pf-bg-accent-vivid-main);
  color: var(--pf-text-inverse);
  font: var(--pf-font-label-s);
  text-align: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 3;
  transform: translate(-50%, -50%);
  -webkit-tap-highlight-color: transparent;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.dsw-anatomy-badge:hover {
  box-shadow: var(--pf-shadow-1);
}
.dsw-anatomy-badge:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsw-anatomy-badge[aria-pressed="true"] {
  transform: translate(-50%, -50%) scale(1.12);
  box-shadow: var(--pf-shadow-1);
}
.dsw-anatomy-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
}
.dsw-anatomy-zone-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-4);
}
.dsw-anatomy-zone-list button {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--pf-spacing-10);
  padding: var(--pf-spacing-8) var(--pf-spacing-10);
  border: 1px solid transparent;
  border-radius: var(--pf-radius-m);
  background: transparent;
  text-align: left;
  font: var(--pf-font-body-s);
  color: var(--pf-text-primary);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.dsw-anatomy-zone-list button:hover {
  background: #f5f5f5; /* pf-gap: bg-accent-states-hover */
}
.dsw-anatomy-zone-list button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsw-anatomy-zone-list button[aria-pressed="true"] {
  background: var(--pf-bg-surface-muted); /* pf-gap: bg-accent-states-active (выбранная зона) */
  border-color: var(--pf-line-hover);
}
.dsw-anatomy-zone-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--pf-bg-accent-vivid-main);
  color: var(--pf-text-inverse);
  font: var(--pf-font-label-s);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dsw-anatomy-detail {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-16);
  background: var(--pf-bg-surface-main);
}
.dsw-anatomy-detail h3 {
  margin: 0 0 var(--pf-spacing-4);
  font: var(--pf-font-heading-s);
  color: var(--pf-text-primary);
}
.dsw-anatomy-detail-summary {
  margin: 0 0 var(--pf-spacing-16);
  font: var(--pf-font-body-s);
  color: var(--pf-text-secondary);
}
.dsw-anatomy-props {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-12);
}
.dsw-anatomy-prop {
  border-top: 1px solid var(--pf-line-default);
  padding-top: var(--pf-spacing-12);
}
.dsw-anatomy-prop:first-child {
  border-top: none;
  padding-top: 0;
}
.dsw-anatomy-prop-name {
  font: var(--pf-font-label-s);
  color: var(--pf-text-secondary);
  margin: 0 0 var(--pf-spacing-4);
}
/* Вид значения — Badge Success / Info / Warning / Error (как .ds-vkind) */
.dsw-anatomy-prop-kind {
  display: inline-block;
  font: var(--pf-font-label-s);
  padding: var(--pf-spacing-4) var(--pf-spacing-8);
  border-radius: var(--pf-radius-pill);
  margin-bottom: var(--pf-spacing-6);
  white-space: nowrap;
}
.dsw-anatomy-prop-kind--semantic-token {
  background: var(--pf-bg-accent-status-success-main);
  color: var(--pf-text-success);
}
.dsw-anatomy-prop-kind--platform-convention {
  background: var(--pf-bg-accent-status-info-main);
  color: var(--pf-text-info);
}
.dsw-anatomy-prop-kind--raw-value {
  background: var(--pf-bg-accent-status-warning-main);
  color: var(--pf-text-warning);
}
.dsw-anatomy-prop-kind--hardcode {
  background: var(--pf-bg-accent-status-error-main);
  color: var(--pf-text-error);
}
.dsw-anatomy-prop-value {
  font: var(--pf-font-code-m);
  color: var(--pf-text-primary);
  margin: 0 0 var(--pf-spacing-4);
  word-break: break-word;
}
.dsw-anatomy-prop-token {
  font-size: 12px; /* pf-gap: body-xs 12/16·400 */
  color: var(--pf-text-primary);
  margin: 0 0 var(--pf-spacing-4);
}
.dsw-anatomy-prop-source {
  font-size: 11px; /* pf-gap: body-xs 12/16·400 */
  color: var(--pf-text-secondary);
  margin: 0;
}
.dsw-anatomy-prop-note {
  font-size: 11px; /* pf-gap: body-xs 12/16·400 */
  color: var(--pf-text-secondary);
  margin: var(--pf-spacing-4) 0 0;
  font-style: italic;
}
.dsw-anatomy-empty {
  font: var(--pf-font-body-s);
  color: var(--pf-text-secondary);
  margin: 0;
}
`;

interface ZoneRect {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: string;
}

interface BadgePlacement {
  anchorX: number;
  anchorY: number;
  badgeX: number;
  badgeY: number;
}

type PropertyResolver = (
  property: AnatomyProperty,
  mode: ProductColorMode,
  computed: CSSStyleDeclaration | null,
) => ResolvedAnatomyProperty;

export interface AnatomyInspectorProps {
  schema: AnatomySchema;
  mode: ProductColorMode;
  simState: 'default' | 'hover' | 'focus';
  /** Changes when preview layout may shift (checked/state/mode) — avoids remount loops from `children`. */
  remeasureKey: string;
  resolveProperty: PropertyResolver;
  children: ReactNode;
}

function rectsEqual(previous: Map<string, ZoneRect>, next: Map<string, ZoneRect>): boolean {
  if (previous.size !== next.size) {
    return false;
  }
  for (const [id, rect] of next) {
    const candidate = previous.get(id);
    if (
      !candidate ||
      candidate.left !== rect.left ||
      candidate.top !== rect.top ||
      candidate.width !== rect.width ||
      candidate.height !== rect.height ||
      candidate.borderRadius !== rect.borderRadius
    ) {
      return false;
    }
  }
  return true;
}

function kindClassName(kind: AnatomyProperty['kind']): string {
  return `dsw-anatomy-prop-kind dsw-anatomy-prop-kind--${kind}`;
}

function placementForRect(rect: ZoneRect, index: number, total: number): BadgePlacement {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const halfW = Math.max(rect.width / 2, 1);
  const halfH = Math.max(rect.height / 2, 1);
  const anchorX = centerX + halfW * cos;
  const anchorY = centerY + halfH * sin;
  const offset = Math.max(40, Math.min(halfW, halfH) * 0.55 + 32);
  return {
    anchorX,
    anchorY,
    badgeX: anchorX + offset * cos,
    badgeY: anchorY + offset * sin,
  };
}

function computeBadgePlacements(
  zones: AnatomyZone[],
  rects: Map<string, ZoneRect>,
): Map<string, BadgePlacement> {
  const bySelector = new Map<string, AnatomyZone[]>();

  for (const zone of zones) {
    const group = bySelector.get(zone.targetSelector) ?? [];
    group.push(zone);
    bySelector.set(zone.targetSelector, group);
  }

  const placements = new Map<string, BadgePlacement>();

  for (const group of bySelector.values()) {
    const sorted = [...group].sort((left, right) => left.order - right.order);
    sorted.forEach((zone, index) => {
      const rect = rects.get(zone.id);
      if (!rect) {
        return;
      }
      placements.set(zone.id, placementForRect(rect, index, sorted.length));
    });
  }

  return placements;
}

function useZoneRects(
  stageRef: React.RefObject<HTMLDivElement | null>,
  zones: AnatomyZone[],
  remeasureKey: string,
  zoom: number,
): Map<string, ZoneRect> {
  const [rects, setRects] = useState<Map<string, ZoneRect>>(new Map());

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const stageRect = stage.getBoundingClientRect();
    const next = new Map<string, ZoneRect>();

    for (const zone of zones) {
      const target = stage.querySelector(zone.targetSelector);
      if (!target || !(target instanceof HTMLElement)) {
        continue;
      }
      const targetRect = target.getBoundingClientRect();
      const computed = window.getComputedStyle(target);
      next.set(zone.id, {
        left: targetRect.left - stageRect.left,
        top: targetRect.top - stageRect.top,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: computed.borderRadius,
      });
    }

    setRects((previous) => (rectsEqual(previous, next) ? previous : next));
  }, [stageRef, zones]);

  useLayoutEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(stage);

    const targets = zones
      .map((zone) => stage.querySelector(zone.targetSelector))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);
    for (const target of targets) {
      ro.observe(target);
    }

    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, stageRef, zones, remeasureKey, zoom]);

  return rects;
}

function PropertyRow({
  property,
  mode,
  stageRef,
  zone,
  resolveProperty,
}: {
  property: AnatomyProperty;
  mode: ProductColorMode;
  stageRef: React.RefObject<HTMLDivElement | null>;
  zone: AnatomyZone;
  resolveProperty: PropertyResolver;
}) {
  const [resolved, setResolved] = useState<ResolvedAnatomyProperty>(() =>
    resolveProperty(property, mode, null),
  );

  useEffect(() => {
    const stage = stageRef.current;
    const target = stage?.querySelector(zone.targetSelector);
    const computed = target instanceof HTMLElement ? window.getComputedStyle(target) : null;
    setResolved(resolveProperty(property, mode, computed));
  }, [property, mode, stageRef, zone.targetSelector, resolveProperty]);

  return (
    <div className="dsw-anatomy-prop">
      <p className="dsw-anatomy-prop-name">{resolved.property}</p>
      <span className={kindClassName(resolved.kind)}>{anatomyKindLabel(resolved.kind)}</span>
      {resolved.tokenRef && (
        <p className="dsw-anatomy-prop-token">Token: {resolved.tokenRef}</p>
      )}
      <p className="dsw-anatomy-prop-value">{resolved.resolvedValue}</p>
      {resolved.source && <p className="dsw-anatomy-prop-source">Source: {resolved.source}</p>}
      {resolved.note && <p className="dsw-anatomy-prop-note">{resolved.note}</p>}
    </div>
  );
}

function AnatomyZoomControls({
  zoom,
  onZoomChange,
  onReset,
}: {
  zoom: number;
  onZoomChange: (next: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="dsw-anatomy-zoom" role="group" aria-label="Масштаб превью">
      <button
        type="button"
        aria-label="Уменьшить"
        disabled={zoom <= MIN_ANATOMY_ZOOM}
        onClick={() => onZoomChange(Math.max(MIN_ANATOMY_ZOOM, zoom - ANATOMY_ZOOM_STEP))}
      >
        −
      </button>
      <span className="dsw-anatomy-zoom-value" aria-live="polite">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        aria-label="Увеличить"
        disabled={zoom >= MAX_ANATOMY_ZOOM}
        onClick={() => onZoomChange(Math.min(MAX_ANATOMY_ZOOM, zoom + ANATOMY_ZOOM_STEP))}
      >
        +
      </button>
      <button type="button" aria-label="Сбросить масштаб" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

export function AnatomyInspector({
  schema,
  mode,
  simState,
  remeasureKey,
  resolveProperty,
  children,
}: AnatomyInspectorProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const detailId = useId();
  const [zoom, setZoom] = useState(DEFAULT_ANATOMY_ZOOM);
  const sortedZones = useMemo(
    () => [...schema.zones].sort((left, right) => left.order - right.order),
    [schema.zones],
  );
  const zoneRects = useZoneRects(stageRef, sortedZones, remeasureKey, zoom);
  const badgePlacements = useMemo(
    () => computeBadgePlacements(sortedZones, zoneRects),
    [sortedZones, zoneRects],
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  const activeZoneId = hoveredZoneId ?? selectedZoneId;
  const activeZone = sortedZones.find((zone) => zone.id === activeZoneId) ?? null;

  const selectZone = (zoneId: string) => {
    setSelectedZoneId((current) => (current === zoneId ? null : zoneId));
  };

  return (
    <>
      <style>{ANATOMY_INSPECTOR_STYLE}</style>
      <div className="dsw-anatomy">
        <div className="dsw-anatomy-toolbar">
          <p className="dsw-anatomy-toolbar-label">
            Масштаб превью только для Anatomy. На других вкладках компонент остаётся в реальном размере.
          </p>
          <AnatomyZoomControls
            zoom={zoom}
            onZoomChange={setZoom}
            onReset={() => setZoom(DEFAULT_ANATOMY_ZOOM)}
          />
        </div>

        <div className="dsw-anatomy-layout">
          <div className="dsw-anatomy-stage-wrap" data-theme={mode}>
            <div
              className="dsw-anatomy-canvas"
              ref={stageRef}
              data-theme={mode}
              data-sim-state={simState === 'default' ? undefined : simState}
            >
              <div
                className="dsw-anatomy-scale-host"
                style={{ transform: `scale(${zoom})` }}
              >
                {children}
              </div>

              <div className="dsw-anatomy-overlay" aria-hidden="true">
                <svg className="dsw-anatomy-leaders" width="100%" height="100%">
                  {sortedZones.map((zone) => {
                    const placement = badgePlacements.get(zone.id);
                    if (!placement) {
                      return null;
                    }
                    const isActive = activeZoneId === zone.id;
                    return (
                      <line
                        key={`leader-${zone.id}`}
                        className={`dsw-anatomy-leader-line${isActive ? ' is-active' : ''}`}
                        x1={placement.anchorX}
                        y1={placement.anchorY}
                        x2={placement.badgeX}
                        y2={placement.badgeY}
                      />
                    );
                  })}
                </svg>

                {sortedZones.map((zone) => {
                  const rect = zoneRects.get(zone.id);
                  const placement = badgePlacements.get(zone.id);
                  if (!rect || !placement) {
                    return null;
                  }
                  const isActive = activeZoneId === zone.id;

                  return (
                    <div key={zone.id}>
                      <div
                        className={`dsw-anatomy-halo${isActive ? ' is-visible' : ''}`}
                        style={{
                          left: rect.left,
                          top: rect.top,
                          width: rect.width,
                          height: rect.height,
                          borderRadius: rect.borderRadius,
                        }}
                      />
                      <span
                        className="dsw-anatomy-anchor-dot"
                        style={{ left: placement.anchorX, top: placement.anchorY }}
                      />
                      <button
                        type="button"
                        className="dsw-anatomy-badge"
                        style={{ left: placement.badgeX, top: placement.badgeY }}
                        aria-label={`${zone.order}. ${zone.label}`}
                        aria-pressed={selectedZoneId === zone.id}
                        aria-controls={detailId}
                        onClick={() => selectZone(zone.id)}
                        onMouseEnter={() => setHoveredZoneId(zone.id)}
                        onMouseLeave={() => setHoveredZoneId(null)}
                        onFocus={() => setHoveredZoneId(zone.id)}
                        onBlur={() => setHoveredZoneId(null)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            selectZone(zone.id);
                          }
                        }}
                      >
                        {zone.order}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="dsw-anatomy-sidebar">
            <ul className="dsw-anatomy-zone-list" aria-label="Anatomy zones">
              {sortedZones.map((zone) => (
                <li key={zone.id}>
                  <button
                    type="button"
                    aria-pressed={selectedZoneId === zone.id}
                    aria-controls={detailId}
                    onClick={() => selectZone(zone.id)}
                    onMouseEnter={() => setHoveredZoneId(zone.id)}
                    onMouseLeave={() => setHoveredZoneId(null)}
                    onFocus={() => setHoveredZoneId(zone.id)}
                    onBlur={() => setHoveredZoneId(null)}
                  >
                    <span className="dsw-anatomy-zone-num">{zone.order}</span>
                    <span>{zone.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="dsw-anatomy-detail" id={detailId} aria-live="polite">
              {activeZone ? (
                <>
                  <h3>
                    {activeZone.order}. {activeZone.label}
                  </h3>
                  {activeZone.summary && (
                    <p className="dsw-anatomy-detail-summary">{activeZone.summary}</p>
                  )}
                  <div className="dsw-anatomy-props">
                    {activeZone.properties.map((property) => (
                      <PropertyRow
                        key={`${activeZone.id}-${property.property}`}
                        property={property}
                        mode={mode}
                        stageRef={stageRef}
                        zone={activeZone}
                        resolveProperty={resolveProperty}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="dsw-anatomy-empty">
                  Выберите зону в списке или на схеме (Tab → Enter/Space). Switch остаётся в
                  отдельном tab-order и проверяется независимо.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
