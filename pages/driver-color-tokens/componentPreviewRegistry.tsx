import type { ReactNode } from 'react';
import { Switch } from './components/Switch';
import { BadgeCount } from './components/BadgeCount';
import { BadgeDot } from './components/BadgeDot';

type ComponentPreviewRenderer = () => ReactNode;

/**
 * Live component previews for the Components vitrina.
 * Add an entry here when a new component gets a review sandbox.
 */
const COMPONENT_PREVIEWS: Record<string, ComponentPreviewRenderer> = {
  switch: () => <Switch checked aria-label="Switch preview" />,
  'badge-count': () => <BadgeCount value={10} />,
  'badge-dot': () => <BadgeDot aria-label="Preview" />,
};

export function hasComponentPreview(componentId: string): boolean {
  return componentId in COMPONENT_PREVIEWS;
}

export function ComponentPreview({ componentId }: { componentId: string }) {
  const render = COMPONENT_PREVIEWS[componentId];

  if (!render) {
    return <span className="dsch-preview-fallback">Preview недоступен</span>;
  }

  return render();
}
