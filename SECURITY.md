# Security policy

## Supported version

Only the latest version on the repository's default branch is supported during pre-release development.

## Reporting a vulnerability

Do not publish sensitive security details in a public issue. When the repository is hosted on GitHub, use GitHub's private vulnerability reporting feature if it is enabled; otherwise contact the repository owner privately.

Include the affected route or feature, reproduction steps, expected impact, and any suggested mitigation. Do not include real personal planner data in a report.

## Current security boundaries

Fleurie is a client-side personal project with no application backend or authentication. Data and uploaded image data URLs are stored in the browser's `localStorage`.

- Fleurie does not encrypt local data.
- Anyone with access to the same browser profile may be able to inspect that data.
- Clearing browser site data can permanently remove planner records.
- The application does not currently provide cloud sync or an export/restore workflow.

These limitations should be considered before entering confidential, financial, health, or identifying information.
