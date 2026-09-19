/**
 * Иконки в общем формате таблицы (v1.5.0, этап 4).
 *
 * Сканер и компаратор иконок работают со своими типами (IconRecord,
 * IconComparisonResult); таблица, решения, история и фильтр — с
 * LayoutRecord / ComparisonResult. Здесь — перевод, чтобы иконки прошли
 * тем же путём, что цвета и типографика, без отдельной копии этой механики.
 */

import type {
  ComparisonResult,
  IconResultDetails,
  LayoutRecord,
  LibraryIcon,
  LibraryIconSummary,
} from "../comparators/types";
import { formatLibraryIconName } from "./figmaComponentsRestApi";
import type { IconComparisonResult } from "./iconComparator";
import type { IconRecord } from "./iconScanner";

const MAX_NODE_IDS = 500;

const round = (value: number) => Math.round(value);

function componentName(record: IconRecord): string {
  const component = record.component;
  if (!component) return "";
  return component.setName ? `${component.setName} / ${component.name}` : component.name;
}

export function iconRecordToLayoutRecord(record: IconRecord): LayoutRecord {
  const nodeIds = [...new Set(record.occurrences.flat())];
  const isInstance = record.kind === "instance";
  return {
    id: record.id,
    category: "icons",
    property: "icon",
    bindingType: isInstance ? "component" : "hardcoded",
    displayValue: isInstance
      ? `${componentName(record)} · ${round(record.width)}×${round(record.height)}`
      : `Без компонента · ${round(record.width)}×${round(record.height)}`,
    comparisonValue: {
      fingerprint: record.fingerprint,
      width: record.width,
      height: record.height,
      layers: record.layers,
    },
    sourceName: componentName(record),
    count: record.count,
    representativeNodePath: record.representativePath,
    representativeNodeName: record.representativeName,
    nodeIds: nodeIds.slice(0, MAX_NODE_IDS),
    ...(record.occurrencesTruncated || nodeIds.length > MAX_NODE_IDS ? { nodeIdsTruncated: true } : {}),
  };
}

export function toLibraryIconSummary(icon: LibraryIcon): LibraryIconSummary {
  return {
    key: icon.key,
    name: icon.name,
    ...(icon.setName ? { setName: icon.setName } : {}),
    ...(icon.outline ? { outline: icon.outline } : {}),
    width: icon.width,
    height: icon.height,
  };
}

export function iconResultToComparisonResult(result: IconComparisonResult): ComparisonResult {
  const layout = iconRecordToLayoutRecord(result.record);
  const target = result.target;
  const details: IconResultDetails = {
    kind: result.record.kind,
    outline: result.record.outline,
    ...(target?.icon.outline ? { targetOutline: target.icon.outline } : {}),
    ...(target
      ? { similarity: target.similarity, targetWidth: target.icon.width, targetHeight: target.icon.height }
      : {}),
    alternatives: result.alternatives.map((alt) => ({
      key: alt.icon.key,
      name: formatLibraryIconName(alt.icon),
      similarity: alt.similarity,
      ...(alt.icon.outline ? { outline: alt.icon.outline } : {}),
    })),
    ...(result.flags.nonstandardSize ? { nonstandardSize: true } : {}),
    ...(result.flags.multiLayer ? { multiLayer: true } : {}),
    ...(result.flags.disputed ? { disputed: true } : {}),
    width: result.record.width,
    height: result.record.height,
    layers: result.record.layers,
  };
  const decision = result.decision;
  return {
    ...layout,
    status: result.status,
    icon: details,
    ...(target
      ? {
          target: {
            variableId: "",
            collectionName: "",
            modeId: "",
            modeName: "",
            name: formatLibraryIconName(target.icon),
            displayValue: `форма совпадает на ${Math.round(target.similarity * 100)}%`,
            componentKey: target.icon.key,
          },
        }
      : {}),
    ...(decision
      ? {
          decision: decision.decision,
          decisionComment: decision.comment,
          decisionTimestamp: decision.timestamp,
          decisionSource: decision.source,
          decisionTargetComponentKey: decision.targetComponentKey,
        }
      : {}),
  };
}
