export const REGISTRY_DECISIONS = [
  'mapped',
  'ignored',
  'hardcoded',
  'candidate',
  'value_fix_proposed',
] as const;

export type RegistryDecision = (typeof REGISTRY_DECISIONS)[number];

/**
 * Входная запись от плагина. Помимо machine-полей (см. RegistryFileEntry)
 * содержит transient review-projection metadata — используется ТОЛЬКО для
 * рендера человекочитаемого GitHub PR body (см. pullRequestBody.ts).
 *
 * ВАЖНО: transient-поля НЕ должны попадать в RegistryFileEntry /
 * decisions-registry.json. Единственная точка, где это гарантируется —
 * buildProposedEntries в proposeDecision.ts, которая явно whitelist'ит
 * только machine-поля при записи в реестр.
 */
export interface ProposedEntryInput {
  signature: string;
  decision: RegistryDecision;
  targetVariableId?: string;
  targetVariableName?: string;
  comment?: string;

  // --- Transient review-projection metadata (PR body only) ---
  sourceProperty?: string;
  sourceBindingType?: string;
  sourceName?: string;
  sourceDisplayValue?: string;
  nodePath?: string;
  nodeName?: string;
  occurrenceCount?: number;
  targetCollectionName?: string;
  targetModeName?: string;
  targetDisplayValue?: string;
  proposedModeName?: string;
  currentLibraryValue?: string;
  proposedValue?: string;
}

export interface ProposeDecisionRequestBody {
  sharedSecret: string;
  proposedBy: string;
  entries: ProposedEntryInput[];
}

export interface RegistryFileEntry {
  signature: string;
  decision: RegistryDecision;
  targetVariableId?: string;
  targetVariableName?: string;
  comment?: string;
  proposedBy?: string;
  proposedAt?: string;
  status?: 'approved' | 'stale';
  approvedBy?: string;
  approvedAt?: string;
}

export interface RegistryFileContent {
  schemaVersion: string;
  registryVersion: number;
  updatedAt: string;
  entries: RegistryFileEntry[];
}

export interface RegistryFileOnGitHub extends RegistryFileContent {
  sha: string;
}

export interface RegistryConfig {
  owner: string;
  repo: string;
  path: string;
  reviewer: string;
}
