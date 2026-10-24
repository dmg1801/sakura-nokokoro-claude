import { defineConfig } from 'vite';
// GitHub Pages: base must be '/<repo-name>/'. Set env VITE_BASE (the workflow does it automatically)
// or edit the fallback. './' (relative) works from any folder, including a plain ZIP upload.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  build: { chunkSizeWarningLimit: 1500 }
});
