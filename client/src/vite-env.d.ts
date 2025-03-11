/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TITLE: string
    readonly VITE_MEALMANAGER_BASE_URL: string
    readonly VITE_CLERK_PUBLISHABLE_KEY: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
