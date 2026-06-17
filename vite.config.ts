import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Production builds are served from https://zyttal.github.io/Photobooth/,
// so assets need the /Photobooth/ prefix. Dev keeps the root '/' so
// `npm run dev` still works at http://localhost:5173/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Photobooth/' : '/',
}))
