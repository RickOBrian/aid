import type { ProbeKind, ProbeResult } from "./probes/types";

/** UI → главный поток. */
export type UiToCode =
  | { type: "run-probes"; kind: ProbeKind }
  | { type: "close" };

/** Главный поток → UI. */
export type CodeToUi =
  | { type: "init"; fileName: string; selectionCount: number }
  | { type: "selection"; selectionCount: number }
  | { type: "probe-progress"; title: string }
  | { type: "probe-results"; kind: ProbeKind; results: ProbeResult[] }
  | { type: "error"; message: string };
