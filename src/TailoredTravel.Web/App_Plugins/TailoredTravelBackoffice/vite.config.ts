import { createHash } from 'crypto';
import { readFileSync, renameSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const ENTRY_BASE = 'tailored-travel-backoffice';
const DIST = 'dist';
const PKG_JSON = 'umbraco-package.json';

function hashEntryPlugin() {
  return {
    name: 'hash-entry',
    closeBundle() {
      const entryPath = resolve(__dirname, DIST, `${ENTRY_BASE}.js`);
      const content = readFileSync(entryPath);
      const hash = createHash('sha256').update(content).digest('hex').slice(0, 8);
      const hashedName = `${ENTRY_BASE}-${hash}.js`;
      renameSync(entryPath, resolve(__dirname, DIST, hashedName));
      renameSync(`${entryPath}.map`, resolve(__dirname, DIST, `${hashedName}.map`));

      const pkgPath = resolve(__dirname, PKG_JSON);
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      pkg.extensions[0].js = `/App_Plugins/TailoredTravelBackoffice/dist/${hashedName}`;
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    },
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'tailored-travel-backoffice',
    },
    outDir: DIST,
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2022',
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  plugins: [hashEntryPlugin()],
});
