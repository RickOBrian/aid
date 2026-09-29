import type { AssembleRequest, ScanResult, ScanScope } from "./assemble/types";
import type { ProbeKind, ProbeResult } from "./probes/types";

export interface PageInfo {
  id: string;
  name: string;
}

/** UI → главный поток. */
export type UiToCode =
  | { type: "scan"; scope: ScanScope }
  | { type: "pair-selected" }
  | { type: "assemble"; request: AssembleRequest }
  | { type: "disassemble" }
  | { type: "focus"; nodeId: string }
  | { type: "run-probes"; kind: ProbeKind }
  | { type: "close" };

/** Главный поток → UI. */
export type CodeToUi =
  | { type: "init"; fileName: string; selectionCount: number; pages: PageInfo[] }
  | { type: "selection"; selectionCount: number }
  | { type: "scan-result"; result: ScanResult }
  | { type: "thumb"; id: string; png: string }
  | { type: "pair-result"; lightId: string; darkId: string }
  | { type: "assemble-conflict"; sections: string[]; request: AssembleRequest }
  | { type: "assemble-progress"; done: number; total: number }
  | { type: "assemble-done"; sections: number; rows: number; ms: number }
  | { type: "disassemble-done"; removed: number }
  | { type: "probe-progress"; title: string }
  | { type: "probe-results"; kind: ProbeKind; results: ProbeResult[] }
  | { type: "notice"; message: string }
  | { type: "error"; message: string };
