# DNA Grid Stock Dashboard

A responsive React dashboard for freelancers who invest variable monthly income into a curated Indian equity basket. It includes tier-based allocation, a device-local contribution ledger, a five-year projection, illustrative Shariah screening, and a dividend purification tracker.

## Features

- Variable-capital allocator with Lean, Average and Bumper month routing
- Daily NSE closing-price refresh during scheduled GitHub Pages deployments
- Three-ratio Shariah screening guardrail
- Device-local five-year contribution ledger
- 12% / 15% CAGR projection view
- 3% purification-loop ledger
- Responsive dark-mode interface

## Run locally

```bash
npm install
npm run dev
```

## Deploy

The included GitHub Actions workflow refreshes prices, builds the site, enables GitHub Pages, and deploys automatically after the code is pushed. If GitHub blocks first-time automatic enablement, open **Settings → Pages**, select **GitHub Actions** as the source, then rerun **Refresh prices and deploy**.

## Important notice

This is a decision-support prototype, not investment advice or a Shariah ruling. The compliance ratios bundled in the UI are illustrative sample data. Verify current prices, company financials, methodology, and compliance with qualified sources before making a decision.
