const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/renderer/index.tsx'],
  bundle: true,
  outfile: 'dist/renderer.js',
  platform: 'browser',
  sourcemap: true,
  target: ['chrome114','edge114'],
  loader: { '.svg': 'file' }
}).catch(() => process.exit(1));
