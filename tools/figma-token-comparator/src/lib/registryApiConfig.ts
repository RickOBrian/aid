/**
 * Registry backend API — URLs and build-time plugin secret.
 * Secret is injected in dist/code.js only; not stored in clientStorage or UI.
 */

export const REGISTRY_GET_URL = "https://aid-registry-api.vercel.app/api/registry";

export const REGISTRY_PROPOSE_URL =
  "https://aid-registry-api.vercel.app/api/registry/propose-decision";

export const DEFAULT_REGISTRY_OWNER = "RickOBrian";
export const DEFAULT_REGISTRY_REPO = "aid";
export const DEFAULT_REGISTRY_PATH = "decisions-registry.json";

export function getPluginSharedSecret(): string {
  if (typeof __PLUGIN_SHARED_SECRET__ === "undefined") {
    return "";
  }
  return __PLUGIN_SHARED_SECRET__;
}
