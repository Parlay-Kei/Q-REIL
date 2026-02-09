#!/usr/bin/env node
/**
 * Store refresh token in Vercel Production and GitHub Actions secret.
 * Reads from scripts/oauth-proof/.tokens.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_FILE = path.join(__dirname, '.tokens.json');
const PROJECT_ID = 'prj_VAiSllyEk27tnHDXagBt88h0h64j';
const TEAM_ID = 'team_DLPOODpWbIp8OubK6ngvbM1v';

if (!fs.existsSync(TOKENS_FILE)) {
  console.error('Error: .tokens.json not found. Run one-time-auth.mjs first.');
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
const refreshToken = tokens.refresh_token;

if (!refreshToken) {
  console.error('Error: No refresh_token in .tokens.json');
  process.exit(1);
}

console.log('Refresh token found (length:', refreshToken.length, ')');
console.log('Storing refresh token...');

// Store in GitHub Actions secret
try {
  execSync(`gh secret set GMAIL_REFRESH_TOKEN --body "${refreshToken}"`, { stdio: 'inherit' });
  console.log('✅ Stored in GitHub Actions secret: GMAIL_REFRESH_TOKEN');
} catch (e) {
  console.error('❌ Failed to store in GitHub Actions secret:', e.message);
  process.exit(1);
}

// Store in Vercel Production env var
const vercelToken = process.env.VERCEL_TOKEN;
if (!vercelToken) {
  console.warn('⚠️  VERCEL_TOKEN not set. Skipping Vercel storage.');
  console.warn('   Set VERCEL_TOKEN env var to store in Vercel Production.');
} else {
  try {
    // Check if key exists
    const checkResp = execSync(
      `curl -sS -H "Authorization: Bearer ${vercelToken}" "https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}"`,
      { encoding: 'utf8' }
    );
    const checkData = JSON.parse(checkResp);
    const existing = checkData.envs?.find(e => e.key === 'GMAIL_REFRESH_TOKEN');
    
    if (existing) {
      // Update existing
      const updateResp = execSync(
        `curl -sS -w "%{http_code}" -X PATCH -H "Authorization: Bearer ${vercelToken}" -H "Content-Type: application/json" -d "{\\"key\\":\\"GMAIL_REFRESH_TOKEN\\",\\"value\\":\\"${refreshToken}\\",\\"target\\":[\\"production\\"],\\"type\\":\\"encrypted\\"}" "https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${existing.id}?teamId=${TEAM_ID}"`,
        { encoding: 'utf8' }
      );
      const httpCode = updateResp.slice(-3);
      if (httpCode === '200') {
        console.log('✅ Updated Vercel Production env var: GMAIL_REFRESH_TOKEN');
      } else {
        console.error('❌ Failed to update Vercel env var. HTTP:', httpCode);
        process.exit(1);
      }
    } else {
      // Create new
      const createResp = execSync(
        `curl -sS -w "%{http_code}" -X POST -H "Authorization: Bearer ${vercelToken}" -H "Content-Type: application/json" -d "{\\"key\\":\\"GMAIL_REFRESH_TOKEN\\",\\"value\\":\\"${refreshToken}\\",\\"target\\":[\\"production\\"],\\"type\\":\\"encrypted\\"}" "https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}"`,
        { encoding: 'utf8' }
      );
      const httpCode = createResp.slice(-3);
      if (httpCode === '200' || httpCode === '201') {
        console.log('✅ Created Vercel Production env var: GMAIL_REFRESH_TOKEN');
      } else {
        console.error('❌ Failed to create Vercel env var. HTTP:', httpCode);
        process.exit(1);
      }
    }
  } catch (e) {
    console.error('❌ Failed to store in Vercel:', e.message);
    process.exit(1);
  }
}

console.log('\n✅ Refresh token stored successfully!');
