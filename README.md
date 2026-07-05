# Imprint prototypes — Platform Command Center

Two functional UI prototypes exploring ideas for Imprint, a co-branded card issuer, built as a
personal exploration project alongside a job application. **This is not a claim about Imprint's
actual internal systems** — it's a demonstration of approach and execution.

## What's in here

One file, two tabs:

- **User Servicing — Smart Fallback Repayment Architecture.** Lets a user link multiple bank
  accounts, set a fallback priority order, and simulate what happens when an autopay statement
  hits an account with insufficient funds. This one traces back to real customer complaints about
  single-point-of-failure autopay failures (sourced from Play Store reviews).

- **Partner Operations — Policy Engine.** A prototype for configuring a new partner promo policy
  (merchant, APR, duration, etc.), run through a three-stage validation pipeline, ending in an
  approval manifest and a mock "deploy to sandbox" action. This one is a **hypothesis about a
  pattern common across the co-brand card issuing industry** — not a diagnosis of a specific gap
  at Imprint, which I have no internal visibility into.

## What's real vs. simulated — read this before demoing it

- All account balances, ledger entries, and merchant data are fake, hardcoded for demonstration.
- The three-stage policy pipeline (guardrail check, ledger conflict check, schema builder) is
  **fully deterministic** — plain rule checks and array lookups, zero model calls. It's
  deliberately not "agentic," because credit-term validation should be provable, not inferred.
- The one genuinely AI-driven feature is document extraction in Partner Operations: paste an
  unstructured partner email/term sheet, and it calls the Claude API to extract structured fields.
  It **requires explicit human confirmation** before those values can be submitted — that
  human-in-the-loop gate is the point of the feature, not a formality.

## Running this locally

This was built as a Claude.ai React artifact, so it assumes an environment with React, Tailwind
CSS utility classes, and `lucide-react` already available — it isn't a runnable app on its own yet.

Fastest path to a standalone app, using Vite:

```bash
npm create vite@latest imprint-demo -- --template react
cd imprint-demo
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then:
1. Configure Tailwind's `content` paths in `tailwind.config.js` to include `./src/**/*.{js,jsx}`.
2. Add the Tailwind directives to `src/index.css`.
3. Replace the contents of `src/App.jsx` with `platform-command-center.jsx`.
4. `npm run dev`

If you're doing this inside Claude Code, you can just open this folder and ask it to scaffold the
Vite + Tailwind project and wire this component in — it can do all of the above for you.

### A note on the AI document-extraction feature specifically

Inside Claude.ai, the artifact runtime can call `https://api.anthropic.com/v1/messages` without
any API key handling on your end. Outside Claude.ai (e.g. once this is a standalone Vite app),
that call will need a real API key — and a browser app can never hold one safely. That feature
would need a small backend proxy (even a single serverless function) that holds the key and
forwards the request, rather than calling the Anthropic API directly from the client. Worth
knowing before a live demo, so it doesn't just quietly fail.

## Why two different design philosophies in one file

The Smart Fallback tab and the Policy Engine tab intentionally use different amounts of "AI":
Smart Fallback has none at all (it's pure state-machine UI), while Policy Engine deliberately
separates deterministic validation from the one place a model is actually useful (parsing messy
unstructured input). That contrast is intentional — it's meant to show judgment about *where*
AI adds value versus where it doesn't, not to maximize how much AI is visibly in the demo.

## Open questions I'd want to validate with the team

- Is partner policy configuration (specifically changing an *existing* partner's terms) mostly
  manual today, or already self-serve?
- How does the team think about where AI should vs. shouldn't have autonomy in workflows that
  touch credit terms?

These are listed in more detail in the accompanying one-page PRD.
