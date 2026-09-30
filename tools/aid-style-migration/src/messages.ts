import type { AssembleRequest, ScanResult, ScanScope } from "./assemble/types";
import type { ProbeKind, ProbeResult } from "./probes/types";
import type { ApplyResult, Decisions } from "./map/apply";
import type { StyleMap } from "./map/types";
import type { ExemplarScope } from "./profile/usage";
import type { FileSurvey } from "./profile/indexFile";
import type { ProfileState } from "./profile/controller";
import type { LibraryLink, MaterialKind, ThemeRole } from "./profile/types";

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
  | { type: "profile-load" }
  | { type: "profile-create"; name: string }
  | { type: "profile-select"; id: string }
  | { type: "profile-delete"; id: string }
  | { type: "file-survey" }
  | { type: "file-index"; kinds: MaterialKind[]; exemplarScope: ExemplarScope }
  | { type: "material-remove"; id: string }
  | { type: "theme-set"; collectionKey: string | null; roles: Record<string, ThemeRole> }
  | { type: "profile-export" }
  | { type: "profile-import"; text: string }
  | { type: "links-index"; links: LibraryLink[] }
  | { type: "links-refresh" }
  | { type: "language-learn"; scope: ExemplarScope }
  | { type: "language-forget"; fileName: string }
  | { type: "language-export" }
  | { type: "language-answer"; questionId: string; optionId: string | null; note?: string }
  | { type: "language-board"; questionId: string | null }
  | { type: "style-map" }
  | { type: "style-apply"; decisions: Decisions }
  | { type: "style-remove" }
  | { type: "pat-set"; token: string }
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
  | { type: "profile-state"; state: ProfileState }
  | { type: "file-survey"; survey: FileSurvey }
  | { type: "profile-export"; fileName: string; text: string }
  | { type: "index-progress"; title: string }
  | { type: "style-map"; map: StyleMap }
  | { type: "style-map-progress"; title: string }
  | { type: "style-applied"; result: ApplyResult }
  | { type: "style-removed"; rows: number }
  | { type: "notice"; message: string }
  | { type: "error"; message: string };
