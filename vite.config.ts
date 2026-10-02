import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Write down what the build emitted, so the service worker can cache it.
 *
 * The worker is a static file and the built assets are content-hashed, so it
 * cannot know their names — and without them the app is only openable offline
 * by the grace of the browser's HTTP cache, which is evicted whenever the
 * phone feels like it. This hands the worker the list, so precaching the app
 * is deterministic rather than lucky.
 *
 * It is generated rather than written by hand for the usual reason: a list
 * somebody has to remember to update is a list that is wrong the first time
 * they forget.
 */
function assetManifest(): Plugin {
  return {
    name: 'satzwerk:asset-manifest',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        // Source maps are for debugging, not for a phone in a tunnel, and they
        // are several times the size of the app itself.
        .filter((name) => !name.endsWith('.map'))
        .map((name) => `/${name}`)
        .sort();
      // Only the startup graph is downloaded automatically. Other chunks are
      // cached when visited or explicitly saved from the course map.
      const closure = (names: string[]) => {
        const found = new Set<string>();
        const add = (name: string) => {
          if (found.has(name) || !bundle[name]) return;
          found.add(name);
          const item = bundle[name];
          if (item.type === 'chunk') item.imports.forEach(add);
        };
        names.forEach(add);
        return [...found].map(name => `/${name}`).sort();
      };
      const chunks = Object.values(bundle).filter(item => item.type === 'chunk');
      const entry = chunks.filter(item => item.isEntry).map(item => item.fileName);
      const stylesAndFonts = Object.keys(bundle).filter(name => /\.(css|woff2)$/.test(name)).map(name => `/${name}`);
      const precache = [...new Set([...closure(entry), ...stylesAndFonts])].sort();
      const size = (paths: string[]) => paths.reduce((total, path) => {
        const item = bundle[path.slice(1)]!;
        return total + Buffer.byteLength(item.type === 'chunk' ? item.code : item.source);
      }, 0);
      const startupBytes = size(precache);
      const budgetBytes = 2 * 1024 * 1024;
      if (startupBytes > budgetBytes) this.error(`Offline startup is ${startupBytes} bytes; budget is ${budgetBytes}.`);
      const learning = chunks.filter(item => /\/(grammar|vocabulary)\.ts$|\/(LessonPage|CheckpointPage)\.tsx$/.test(item.facadeModuleId ?? ''));
      const groups = Object.fromEntries(['pre-a1', 'a1', 'a2', 'b1', 'b2'].map(id => {
        const level = chunks.find(item => item.facadeModuleId?.endsWith(`/content/levels/${id}.ts`));
        const paths = closure([...learning.map(item => item.fileName), ...(level ? [level.fileName] : [])]);
        return [id, { files: paths, bytes: size(paths) }];
      }));
      this.emitFile({
        type: 'asset',
        fileName: 'asset-manifest.json',
        source: JSON.stringify({ files, precache, startupBytes, budgetBytes, groups }, null, 2),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), assetManifest()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // 127.0.0.1 rather than localhost: the API listens on IPv4 loopback only,
    // and localhost can resolve to ::1 first.
    proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true } },
  },
  build: { outDir: 'dist', sourcemap: true },
  test: {
    // Individual UI test files opt into jsdom with a
    // `// @vitest-environment jsdom` docblock.
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['./tests/setup.ts'],
  },
});
