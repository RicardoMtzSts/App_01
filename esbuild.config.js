const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

esbuild.build({
  entryPoints: ['src/main/index.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist/main.js',
  plugins: [nodeExternalsPlugin()],
  sourcemap: true,
  target: ['node18'],
  external: ['electron']
}).catch(() => process.exit(1));
