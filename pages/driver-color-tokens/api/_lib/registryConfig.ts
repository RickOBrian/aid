import type { RegistryConfig } from './registryTypes.js';

export function getRegistryConfig(): RegistryConfig {
  return {
    owner: process.env.REGISTRY_OWNER?.trim() || 'RickOBrian',
    repo: process.env.REGISTRY_REPO?.trim() || 'aid',
    path: process.env.REGISTRY_PATH?.trim() || 'decisions-registry.json',
    reviewer: process.env.REGISTRY_REVIEWER?.trim() || 'RickOBrian',
  };
}
