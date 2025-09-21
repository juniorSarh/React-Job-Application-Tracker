// src/assets/api.ts
export type ViteEnvMeta = ImportMeta & { env?: { VITE_API_URL?: string } };
export type GlobalWithCRA = typeof globalThis & {
  process?: { env?: { REACT_APP_API_URL?: string } };
};

function getApiBase(): string {
  const viteUrl: string | undefined = (import.meta as ViteEnvMeta).env
    ?.VITE_API_URL;
  if (viteUrl) return viteUrl;

  const craUrl: string | undefined = (globalThis as GlobalWithCRA).process?.env
    ?.REACT_APP_API_URL;
  if (craUrl) return craUrl;

  // Your current default from JobList
  return "https://json-server-vded.onrender.com";
}

export const API_BASE = getApiBase();
