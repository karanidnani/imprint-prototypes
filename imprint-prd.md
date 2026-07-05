# PRD: Two prototypes for Imprint

**Author:** Karan Idnani · **Date:** July 5, 2026 · **Status:** Exploratory prototype, built independently

**What this document is:** A one-page summary of two functional prototypes built as a personal
exploration project alongside a job application — not a proposal submitted on Imprint's behalf,
and not a claim about Imprint's actual internal systems, which I have no visibility into.

---

## 1. Smart Fallback Repayment Architecture (User Servicing)

### Problem
Imprint's app currently supports a single linked bank account for autopay. If that account is
short on funds when a statement payment triggers, the ACH pull fails — costing Imprint revenue,
generating an ACH return/compliance flag, and triggering a late fee for the customer.

**Evidence:** this is sourced directly from Google Play Store reviews describing exactly this
failure mode. This is the one part of this document backed by direct customer evidence rather
than inference.

### Goals
- Let a customer link more than one payment method.
- Let a customer set a fallback priority order across linked accounts.
- Automatically route a failed autopay attempt to the next account in priority order, if enabled.
- Make every routing decision visible and traceable (for both the customer and internal ops/compliance).

### Non-goals
- This prototype does not model the actual authorization/disclosure mechanics required to debit a
  backup account (see open questions below) — it models the UX and business logic only.
- Not a proposal to replace any existing ACH/ledger vendor or process.

### What was built
A working React prototype: linked-account management (add/remove/reorder), a "Smart Fallback
Routing" toggle, and a transaction simulator that walks through three scenarios (primary success,
single fallback, three-account waterfall) with a visible backend ledger log.

---

## 2. Partner Policy Engine (Partner Operations)

### Problem (hypothesis, not confirmed)
Configuring or changing a partner's promotional terms (APR, duration, minimum purchase) may be a
manual, ad hoc process — this is a hypothesis based on industry-wide patterns (legacy issuers take
12–18 months to launch programs vs. ~3 months for modern platforms; even modern infrastructure
providers like Marqeta still describe program configuration as consultative and multi-stakeholder),
**not a confirmed gap at Imprint specifically.**

### Goals
- Provide a fast, auditable path from partner request to a reviewable policy change.
- Keep every compliance-relevant check deterministic and provable — not inferred by a model.
- Use AI only where it adds real value: turning messy, unstructured partner communication into
  structured data for a human to review.

### Non-goals
- Not a claim that Imprint's actual process looks like this today.
- Not a proposal for an autonomous approval system — no policy change reaches deployment without
  an explicit human "Approve & deploy" action.

### What was built
- **Deterministic validation pipeline:** three rule-based stages (guardrail check, ledger conflict
  check, schema builder) — plain code, zero model calls, fully traceable.
- **AI-assisted document intake:** paste an unstructured partner email or term sheet; a real call
  to the Claude API extracts structured fields; a human must explicitly confirm the extracted
  values before they can be submitted for validation.
- **Approval manifest:** a current-state vs. proposed-state diff, requiring explicit human approval
  before a mocked "deploy to sandbox" action.

### Why deterministic and AI are deliberately separated
Credit-term validation (is the APR legal, does this conflict with an existing deal) needs to be
provably correct — a rule engine and an audit log answer "how do you know" far better than a
model's reasoning trace does. AI is reserved for the one task that's genuinely a language problem:
interpreting unstructured human writing into structured fields, always subject to human review.

---

## Open questions I'd want to validate with the team

1. Is changing an *existing* partner's promotional terms self-serve today, or still largely manual?
2. Does the existing rewards/underwriting configuration tooling already cover this use case?
3. What does account-authorization/disclosure actually require for a multi-account fallback debit,
   from a compliance standpoint?
4. Where does the team already draw the line on AI autonomy vs. human sign-off in workflows that
   touch credit terms or account debits?

## Out of scope for both prototypes
- Real ACH/bank integration, real underwriting data, real partner data — everything is simulated.
- Any production security, auth, or data-handling review — this is a demo, not a shippable feature.
