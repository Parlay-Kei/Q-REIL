/**
 * Q Suite brand constants — single source of truth for suite, module, and package names.
 * Used by: index.html title, manifest, AppShell, Sidebar, CommandBar, Apps page, route document.title.
 * See docs/q-suite/NAMING_CANON.md and docs/q-suite/BRAND_SOURCES.md.
 */

export const SUITE_NAME = 'Q Suite';
export const SUITE_BYLINE = 'by Strata Noble';
export const DEFAULT_DOCUMENT_TITLE = `${SUITE_NAME} ${SUITE_BYLINE}`;

/** Suite control plane */
export const CONTROL_CENTER_NAME = 'Q Control Center';

/** App package: Q REIL */
export const REIL_APP_NAME = 'Q REIL';
export const REIL_APP_DESCRIPTION = 'Commercial Real Estate package';

/** Route-aware document title fragments */
export const TITLE_HOME = SUITE_NAME;
export const TITLE_CONTROL_CENTER = `${CONTROL_CENTER_NAME} | ${SUITE_NAME}`;
export const TITLE_REIL_OVERVIEW = `Q REIL · Overview | ${SUITE_NAME}`;
export const TITLE_REIL_SUBVIEW = (subview: string) => `${subview} | Q REIL | ${SUITE_NAME}`;
export const TITLE_REIL_DEAL = (dealName: string) => `${dealName} | Q REIL | ${SUITE_NAME}`;
export const TITLE_REIL_THREAD = `Thread | Q REIL | ${SUITE_NAME}`;
