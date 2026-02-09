#!/usr/bin/env node
/**
 * Detect Claude Code Extension Execution
 * OCS-MISSION: PLATOPS-CLAUDECODE-AGENT-ROUTING-PATCH-0023
 * 
 * This script detects direct execution attempts that bypass the Mission Router wrapper.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const ANSI_RED = '\x1b[31m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_RESET = '\x1b[0m';

function detectDirectExecution() {
    // Check if we're being called directly without the wrapper
    const parentProcess = process.env.PARENT_PROCESS || '';
    const missionId = process.env.MISSION_ID || '';
    const agent = process.env.AGENT_OWNER || '';
    const receipts = process.env.RECEIPT_PATHS || '';
    
    // If mission routing metadata is missing, this is direct execution
    if (!missionId || !agent || !receipts) {
        console.error('');
        console.error(`${ANSI_RED}╔════════════════════════════════════════════════════════════╗${ANSI_RESET}`);
        console.error(`${ANSI_RED}║  DIRECT EXECUTION DETECTED - BLOCKED                      ║${ANSI_RESET}`);
        console.error(`${ANSI_RED}╚════════════════════════════════════════════════════════════╝${ANSI_RESET}`);
        console.error('');
        console.error(`${ANSI_RED}ERROR: Direct execution bypass detected.${ANSI_RESET}`);
        console.error('');
        console.error('All code execution must route through the Mission Router wrapper.');
        console.error('');
        console.error('Usage:');
        console.error('  .\\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT> -Receipts <PATHS> -- <COMMAND>');
        console.error('');
        console.error('Example:');
        console.error('  .\\anx.ps1 -MissionId PLATOPS-ANX-TEST-0022 -Agent github-admin -Receipts proofs/anx/TEST.md -- node script.mjs');
        console.error('');
        process.exit(1);
    }
    
    // Display compliance banner
    console.log('');
    console.log(`\x1b[32m╔════════════════════════════════════════════════════════════╗\x1b[0m`);
    console.log(`\x1b[32m║  MISSION ROUTER COMPLIANCE                               ║\x1b[0m`);
    console.log(`\x1b[32m╚════════════════════════════════════════════════════════════╝\x1b[0m`);
    console.log(`\x1b[34mMission ID:\x1b[0m ${missionId}`);
    console.log(`\x1b[34mAgent Owner:\x1b[0m ${agent}`);
    console.log(`\x1b[34mReceipt Targets:\x1b[0m`);
    receipts.split(',').forEach(path => {
        console.log(`  - ${path.trim()}`);
    });
    console.log('');
}

// Run detection
detectDirectExecution();
