import { defineConfig } from 'tsup';
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';

export default defineConfig({
  entry: {
    cli: 'src/cli/index.ts',
    mcp: 'src/mcp/index.ts',
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
  noExternal: [],
  publicDir: false,
});
