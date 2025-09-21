/// <reference types="vite/client" />


interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // add other VITE_ vars here if you have them, e.g.:
  // readonly VITE_SOMETHING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

