export const REGISTRY_DECISIONS = [
  'mapped',
  'ignored',
  'hardcoded',
  'candidate',
  'value_fix_proposed',
] as const;

export type RegistryDecision = (typeof REGISTRY_DECISIONS)[number];

export interface ProposedEntryInput {
  signature: string;
  decision: RegistryDecision;
  targetVariableId?: string;
  targetVariableName?: string;
  comment?: string;
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
