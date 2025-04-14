import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// Import package.json to read the version
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read package.json
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Define environment variables
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  }
})
