#!/usr/bin/env node
/**
 * QAG Agent Architecture Enforcement Gate
 * OCS-MISSION: QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025
 * 
 * Validates that all work products include mission routing metadata and receipt paths.
 * Rejects work products that bypass agent routing.
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';

const ANSI_RED = '\x1b[31m';
const ANSI_GREEN = '\x1b[32m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_BLUE = '\x1b[34m';
const ANSI_RESET = '\x1b[0m';

class QAGEnforcementGate {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validated = [];
    }

    validateMissionId(missionId) {
        if (!missionId || missionId.trim() === '') {
            this.errors.push('Mission ID is missing or empty');
            return false;
        }

        // Validate format: <DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>
        const missionIdPattern = /^[A-Z]+-[A-Z]+(-[A-Z]+)*-\d{4}$/;
        if (!missionIdPattern.test(missionId)) {
            this.errors.push(`Mission ID format invalid: ${missionId}. Expected: <DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>`);
            return false;
        }

        return true;
    }

    validateAgentOwner(agent) {
        if (!agent || agent.trim() === '') {
            this.errors.push('Agent owner is missing or empty');
            return false;
        }

        const validAgents = [
            'github-admin',
            'platops',
            'qag',
            'engdel',
            'relops',
            'proops',
            'ocs'
        ];

        if (!validAgents.includes(agent.toLowerCase())) {
            this.warnings.push(`Agent owner '${agent}' not in standard list. Valid agents: ${validAgents.join(', ')}`);
        }

        return true;
    }

    validateReceiptPaths(receiptPaths) {
        if (!receiptPaths || receiptPaths.length === 0) {
            this.errors.push('Receipt paths are missing or empty');
            return false;
        }

        let allValid = true;
        for (const receiptPath of receiptPaths) {
            if (!receiptPath || receiptPath.trim() === '') {
                this.errors.push('One or more receipt paths are empty');
                allValid = false;
                continue;
            }

            // Check if receipt file exists or directory exists
            const receiptDir = dirname(receiptPath);
            if (!existsSync(receiptDir)) {
                this.warnings.push(`Receipt directory does not exist: ${receiptDir}`);
            }

            // Check if receipt file exists
            if (!existsSync(receiptPath)) {
                this.warnings.push(`Receipt file does not exist: ${receiptPath}`);
            } else {
                // Validate receipt file contains mission metadata
                try {
                    const receiptContent = readFileSync(receiptPath, 'utf-8');
                    if (!receiptContent.includes('Mission:') && !receiptContent.includes('**Mission:**')) {
                        this.warnings.push(`Receipt file may not contain mission metadata: ${receiptPath}`);
                    }
                } catch (error) {
                    this.warnings.push(`Cannot read receipt file: ${receiptPath} - ${error.message}`);
                }
            }
        }

        return allValid;
    }

    detectDirectExecution(workProductPath) {
        if (!existsSync(workProductPath)) {
            this.errors.push(`Work product file not found: ${workProductPath}`);
            return true; // Consider missing file as direct execution
        }

        try {
            const content = readFileSync(workProductPath, 'utf-8');
            
            // Check for mission ID in content
            const missionIdPattern = /(?:Mission|MISSION)[:\s]+([A-Z]+-[A-Z]+(-[A-Z]+)*-\d{4})/i;
            const missionMatch = content.match(missionIdPattern);
            
            if (!missionMatch) {
                this.errors.push(`Work product does not contain mission ID: ${workProductPath}`);
                return true;
            }

            // Check for agent owner
            const agentPattern = /(?:Owner|Agent|AGENT)[:\s]+([a-z-]+)/i;
            const agentMatch = content.match(agentPattern);
            
            if (!agentMatch) {
                this.errors.push(`Work product does not contain agent owner: ${workProductPath}`);
                return true;
            }

            // Check for receipt references
            const receiptPattern = /(?:Receipt|receipt|RECEIPT)[:\s]+([^\s\n]+)/i;
            const receiptMatch = content.match(receiptPattern);
            
            if (!receiptMatch) {
                this.warnings.push(`Work product may not reference receipt paths: ${workProductPath}`);
            }

            return false;
        } catch (error) {
            this.errors.push(`Cannot read work product: ${workProductPath} - ${error.message}`);
            return true;
        }
    }

    validate(missionId, agent, receiptPaths, workProductPath = null) {
        this.errors = [];
        this.warnings = [];
        this.validated = [];

        // Gate Rule 1: Reject if no mission id
        if (!this.validateMissionId(missionId)) {
            return this.result(false, 'REJECTED: No mission ID');
        }

        // Gate Rule 2: Reject if no named agent owner
        if (!this.validateAgentOwner(agent)) {
            return this.result(false, 'REJECTED: No named agent owner');
        }

        // Gate Rule 3: Reject if no receipts
        if (!this.validateReceiptPaths(receiptPaths)) {
            return this.result(false, 'REJECTED: No receipt paths');
        }

        // Gate Rule 4: Reject if direct execution bypass detected
        if (workProductPath && this.detectDirectExecution(workProductPath)) {
            return this.result(false, 'REJECTED: Direct execution bypass detected');
        }

        // All validations passed
        this.validated.push({
            missionId,
            agent,
            receiptPaths,
            workProductPath
        });

        return this.result(true, 'PASS: All gate rules satisfied');
    }

    result(passed, message) {
        return {
            passed,
            message,
            errors: [...this.errors],
            warnings: [...this.warnings],
            validated: [...this.validated]
        };
    }

    printBanner() {
        console.log('');
        console.log(`${ANSI_BLUE}╔════════════════════════════════════════════════════════════╗${ANSI_RESET}`);
        console.log(`${ANSI_BLUE}║  QAG AGENT ARCHITECTURE ENFORCEMENT GATE                  ║${ANSI_RESET}`);
        console.log(`${ANSI_BLUE}╚════════════════════════════════════════════════════════════╝${ANSI_RESET}`);
        console.log('');
    }

    printResult(result) {
        if (result.passed) {
            console.log(`${ANSI_GREEN}✅ ${result.message}${ANSI_RESET}`);
        } else {
            console.log(`${ANSI_RED}❌ ${result.message}${ANSI_RESET}`);
        }

        if (result.errors.length > 0) {
            console.log('');
            console.log(`${ANSI_RED}Errors:${ANSI_RESET}`);
            result.errors.forEach(error => {
                console.log(`  ${ANSI_RED}✗${ANSI_RESET} ${error}`);
            });
        }

        if (result.warnings.length > 0) {
            console.log('');
            console.log(`${ANSI_YELLOW}Warnings:${ANSI_RESET}`);
            result.warnings.forEach(warning => {
                console.log(`  ${ANSI_YELLOW}⚠${ANSI_RESET} ${warning}`);
            });
        }

        if (result.validated.length > 0) {
            console.log('');
            console.log(`${ANSI_GREEN}Validated:${ANSI_RESET}`);
            result.validated.forEach(item => {
                console.log(`  ${ANSI_GREEN}✓${ANSI_RESET} Mission ID: ${item.missionId}`);
                console.log(`  ${ANSI_GREEN}✓${ANSI_RESET} Agent: ${item.agent}`);
                console.log(`  ${ANSI_GREEN}✓${ANSI_RESET} Receipts: ${item.receiptPaths.join(', ')}`);
                if (item.workProductPath) {
                    console.log(`  ${ANSI_GREEN}✓${ANSI_RESET} Work Product: ${item.workProductPath}`);
                }
            });
        }

        console.log('');
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const gate = new QAGEnforcementGate();
    gate.printBanner();

    const missionId = process.env.MISSION_ID || process.argv[2];
    const agent = process.env.AGENT_OWNER || process.argv[3];
    const receipts = (process.env.RECEIPT_PATHS || process.argv[4] || '').split(',').filter(p => p.trim());
    const workProduct = process.argv[5] || null;

    if (!missionId || !agent || receipts.length === 0) {
        console.error(`${ANSI_RED}Usage:${ANSI_RESET}`);
        console.error('  node qag-enforcement-gate.mjs <MISSION_ID> <AGENT> <RECEIPT_PATHS> [WORK_PRODUCT_PATH]');
        console.error('');
        console.error('  Or set environment variables:');
        console.error('    MISSION_ID=<id> AGENT_OWNER=<agent> RECEIPT_PATHS=<paths> node qag-enforcement-gate.mjs [WORK_PRODUCT_PATH]');
        console.error('');
        process.exit(1);
    }

    const result = gate.validate(missionId, agent, receipts, workProduct);
    gate.printResult(result);

    process.exit(result.passed ? 0 : 1);
}

export default QAGEnforcementGate;
