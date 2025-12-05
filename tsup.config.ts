import { defineConfig } from 'tsup';
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import fs from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  onSuccess: async () => {
    await fs.promises.cp('src/hybrid-astro-ui', 'dist/hybrid-astro-ui', { recursive: true });
  },
  format: ['esm'],
  dts: true,
  sourcemap: false,
  minify: true,
  clean: true,
  outDir: 'dist',
  outExtension() {
    return {
      js: '.mjs',
    };
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
  esbuildPlugins: [TsconfigPathsPlugin({})],
});
