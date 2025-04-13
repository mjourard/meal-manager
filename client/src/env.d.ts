/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEALMANAGER_BASE_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_CLERK_SIGN_IN_URL: string;
  readonly VITE_CLERK_SIGN_UP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 