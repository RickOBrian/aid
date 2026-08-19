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
  DriverColorMode,
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
  gap: 16px;
}
.dsw-anatomy-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dsw-anatomy-toolbar-label {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.54);
}
.dsw-anatomy-zoom {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #fff;
  padding: 2px;
}
.dsw-anatomy-zoom button {
  margin: 0;
  min-width: 32px;
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: #2d2c2e;
  cursor: pointer;
}
.dsw-anatomy-zoom button:hover,
.dsw-anatomy-zoom button:focus-visible {
  background: #f0f4ff;
  outline: none;
}
.dsw-anatomy-zoom-value {
  min-width: 52px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 28px;
  text-align: center;
  color: rgba(0, 0, 0, 0.54);
  font-variant-numeric: tabular-nums;
}
.dsw-anatomy-layout {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(260px, 320px);
  gap: 24px;
  align-items: start;
}
@media (max-width: 720px) {
  .dsw-anatomy-layout {
    grid-template-columns: 1fr;
  }
}
.dsw-anatomy-stage-wrap {
  border: 1px solid #ebedf0;
  border-radius: 12px;
  padding: 72px 48px;
  background: #fafafa;
  min-height: 320px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dsw-anatomy-stage-wrap[data-theme="night"] {
  background: #2d2c2e;
  border-color: #3a393b;
}
.dsw-anatomy-canvas {
  position: relative;
  display: inline-block;
  overflow: visible;
  padding: 64px;
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
  stroke: #0057ff;
  stroke-width: 1.5;
  opacity: 0.55;
}
.dsw-anatomy-leader-line.is-active {
  stroke-width: 2;
  opacity: 1;
}
.dsw-anatomy-anchor-dot {
  position: absolute;
  width: ${ANCHOR_DOT_RADIUS * 2}px;
  height: ${ANCHOR_DOT_RADIUS * 2}px;
  border-radius: 50%;
  background: #0057ff;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0.85;
}
.dsw-anatomy-halo {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid #0057ff;
  background: transparent;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.12s ease, box-shadow 0.12s ease, border-width 0.12s ease;
}
.dsw-anatomy-halo.is-visible {
  opacity: 1;
  border-width: 3px;
  box-shadow: 0 0 0 4px rgba(0, 87, 255, 0.18);
}
.dsw-anatomy-badge {
  position: absolute;
  width: ${BADGE_SIZE}px;
  height: ${BADGE_SIZE}px;
  margin: 0;
  padding: 0;
  border: 2px solid #0057ff;
  border-radius: 50%;
  background: #ffffff;
  color: #0057ff;
  font-size: 12px;
  font-weight: 600;
  line-height: ${BADGE_SIZE - 4}px;
  text-align: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 3;
  transform: translate(-50%, -50%);
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease, color 0.12s ease;
}
.dsw-anatomy-badge:hover,
.dsw-anatomy-badge:focus-visible {
  background: #0057ff;
  color: #ffffff;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 87, 255, 0.35);
}
.dsw-anatomy-badge[aria-pressed="true"] {
  background: #0057ff;
  color: #ffffff;
  transform: translate(-50%, -50%) scale(1.12);
  box-shadow: 0 4px 14px rgba(0, 87, 255, 0.4);
}
.dsw-anatomy-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dsw-anatomy-zone-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dsw-anatomy-zone-list button {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  color: inherit;
  cursor: pointer;
}
.dsw-anatomy-zone-list button:hover,
.dsw-anatomy-zone-list button:focus-visible {
  background: #f0f4ff;
  border-color: #c5d8ff;
  outline: none;
}
.dsw-anatomy-zone-list button[aria-pressed="true"] {
  background: #e8efff;
  border-color: #0057ff;
}
.dsw-anatomy-zone-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0057ff;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dsw-anatomy-detail {
  border: 1px solid #ebedf0;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}
.dsw-anatomy-detail h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
}
.dsw-anatomy-detail-summary {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.54);
}
.dsw-anatomy-props {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dsw-anatomy-prop {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}
.dsw-anatomy-prop:first-child {
  border-top: none;
  padding-top: 0;
}
.dsw-anatomy-prop-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.54);
  margin: 0 0 4px;
}
.dsw-anatomy-prop-kind {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 6px;
}
.dsw-anatomy-prop-kind--semantic-token {
  background: #e8f5e9;
  color: #2e7d32;
}
.dsw-anatomy-prop-kind--platform-convention {
  background: #e3f2fd;
  color: #1565c0;
}
.dsw-anatomy-prop-kind--raw-value {
  background: #fff3e0;
  color: #e65100;
}
.dsw-anatomy-prop-kind--hardcode {
  background: #ffebee;
  color: #c62828;
}
.dsw-anatomy-prop-value {
  font-size: 13px;
  line-height: 18px;
  margin: 0 0 4px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  word-break: break-word;
}
.dsw-anatomy-prop-token {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  margin: 0 0 4px;
}
.dsw-anatomy-prop-source {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  margin: 0;
}
.dsw-anatomy-prop-note {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.54);
  margin: 4px 0 0;
  font-style: italic;
}
.dsw-anatomy-empty {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.54);
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
  mode: DriverColorMode,
  computed: CSSStyleDeclaration | null,
) => ResolvedAnatomyProperty;

export interface AnatomyInspectorProps {
  schema: AnatomySchema;
  mode: DriverColorMode;
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
  mode: DriverColorMode;
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
