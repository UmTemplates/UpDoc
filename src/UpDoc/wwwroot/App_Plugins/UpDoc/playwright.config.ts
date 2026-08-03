import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Two host sites can be tested: the test site (default) and the Tailored Travel
// mirror. They are separate Umbraco installs with their own Playwright users, so
// switching target means switching credentials too, not just the URL.
//
//   npx playwright test ...                 → test site
//   TARGET=mirror npx playwright test ...   → mirror
//
// The testhelpers read these from the environment rather than from Playwright's
// config, so the chosen target is written back over them here, before any helper
// reads them. Note the helpers navigate using URL, not UMBRACO_URL — setting only
// the latter changes Playwright's baseURL while goToBackOffice still goes to the
// old site.
if (process.env.TARGET === 'mirror') {
  const missing = ['MIRROR_URL', 'MIRROR_USER_LOGIN', 'MIRROR_USER_PASSWORD'].filter(
    (key) => !process.env[key],
  );
  if (missing.length) {
    throw new Error(`TARGET=mirror needs ${missing.join(', ')} in .env — see .env.example.`);
  }

  process.env.URL = process.env.MIRROR_URL;
  process.env.UMBRACO_URL = process.env.MIRROR_URL;
  process.env.UMBRACO_USER_LOGIN = process.env.MIRROR_USER_LOGIN;
  process.env.UMBRACO_USER_PASSWORD = process.env.MIRROR_USER_PASSWORD;
}

// Each target stores its auth separately, so switching between them cannot reuse
// the other site's session and fail in a confusing way.
export const STORAGE_STATE = join(
  __dirname,
  process.env.TARGET === 'mirror' ? 'tests/e2e/.auth/mirror.json' : 'tests/e2e/.auth/user.json',
);

// CRITICAL: Testhelpers read auth tokens from this file
process.env.STORAGE_STAGE_PATH = STORAGE_STATE;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : [['html', { open: 'always' }]],
  use: {
    baseURL: process.env.UMBRACO_URL || 'https://localhost:44390',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    // CRITICAL: Umbraco uses 'data-mark' not 'data-testid'
    testIdAttribute: 'data-mark',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'e2e',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors: true,
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'docs-screenshots',
      testMatch: '**/*.screenshots.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        ignoreHTTPSErrors: true,
        storageState: STORAGE_STATE,
      },
    },
  ],
});
