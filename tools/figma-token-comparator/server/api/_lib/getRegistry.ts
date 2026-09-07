import { jsonResponse } from './cors.js';
import { getRegistryConfig } from './registryConfig.js';
import {
  fetchRegistryFileOnMain,
  RegistryGitHubError,
  type FetchLike,
} from './registryGithub.js';
import { secretsEqual } from './security.js';

export interface GetRegistryDeps {
  fetchImpl: FetchLike;
}

function readPluginSecretHeader(request: Request): string | null {
  const value = request.headers.get('X-Plugin-Secret') ?? request.headers.get('x-plugin-secret');
  if (!value?.trim()) {
    return null;
  }
  return value.trim();
}

export async function handleGetRegistry(
  request: Request,
  deps: GetRegistryDeps,
): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const configuredSecret = process.env.PLUGIN_SHARED_SECRET;
  if (!configuredSecret) {
    console.error('[get-registry] PLUGIN_SHARED_SECRET is not configured');
    return jsonResponse({ error: 'internal_error' }, 500);
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('[get-registry] GITHUB_TOKEN is not configured');
    return jsonResponse({ error: 'internal_error' }, 500);
  }

  const providedSecret = readPluginSecretHeader(request);
  if (!providedSecret || !secretsEqual(providedSecret, configuredSecret)) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const config = getRegistryConfig();

  try {
    const result = await fetchRegistryFileOnMain(deps.fetchImpl, githubToken, config);

    if (result.exists) {
      return jsonResponse(
        {
          exists: true,
          registry: {
            schemaVersion: result.file.schemaVersion,
            registryVersion: result.file.registryVersion,
            updatedAt: result.file.updatedAt,
            entries: result.file.entries,
          },
          sha: result.file.sha,
        },
        200,
      );
    }

    return jsonResponse(
      {
        exists: false,
        registry: result.file,
      },
      200,
    );
  } catch (error) {
    if (error instanceof RegistryGitHubError) {
      console.error('[get-registry] GitHub error', {
        status: error.status,
        message: error.message,
      });
      return jsonResponse({ error: 'registry_unavailable' }, 502);
    }

    console.error('[get-registry] Unexpected error', error);
    return jsonResponse({ error: 'registry_unavailable' }, 502);
  }
}
