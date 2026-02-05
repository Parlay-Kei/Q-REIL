/**
 * Load env from .env.local. Canonical order (vault = repo root first):
 * 1. Repo root .env.local
 * 2. scripts/oauth-proof/.env.local
 * 3. connectors/gmail/.env.local
 * 4. q-reil/.env.local
 * 5. process.cwd()/.env.local
 * First existing file wins; vars not already in process.env are applied.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const CANDIDATES = [
  path.join(ROOT, '.env.local'),
  path.join(ROOT, 'scripts/oauth-proof/.env.local'),
  path.join(ROOT, 'connectors/gmail/.env.local'),
  path.join(ROOT, 'q-reil/.env.local'),
  path.join(process.cwd(), '.env.local'),
];

export function loadEnv() {
  for (const envPath of CANDIDATES) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
      for (const line of content.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$/);
        if (m && !process.env[m[1]]) {
          const val = m[2].trim().replace(/^["']|["']\s*$/g, '');
          process.env[m[1]] = val;
        }
      }
      process.env.LOAD_ENV_SELECTED_FILE = envPath;
      return envPath;
    }
  }
  process.env.LOAD_ENV_SELECTED_FILE = '';
  return null;
}
