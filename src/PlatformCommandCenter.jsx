import React, { useState, useRef, useCallback } from "react";
import {
  Landmark,
  Plus,
  Loader2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Zap,
  ArrowRight,
  CircleCheck,
  Terminal,
  Info,
  Users,
  Boxes,
  ClipboardCheck,
  ScanLine,
  FileCog,
  Building2,
  DollarSign,
  CalendarDays,
  Percent,
  Sparkles,
  Rocket,
  CheckCircle2,
  Database,
  Gauge,
  Code2,
  Eye,
  ListChecks,
} from "lucide-react";

// =============================================================================
// Shared primitives
// =============================================================================

function Badge({ tone = "gray", children, icon: Icon }) {
  const tones = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
        <div className="h-2.5 w-2.5 rounded-sm bg-red-600" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold tracking-tight text-gray-900">Imprint</span>
        <span className="text-[15px] font-normal text-gray-300">×</span>
        <span className="text-[15px] font-semibold tracking-tight text-gray-900">H-E-B</span>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-red-600" : "bg-gray-200"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function JsonBlock({ data }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// =============================================================================
// TAB 1 — User Servicing (Smart Fallback prototype)
// =============================================================================

const PRIMARY_ACCOUNT = { id: "chase", fullName: "Chase Checking", last4: "1234" };

const ALL_BACKUP_ACCOUNTS = [
  { id: "wells", fullName: "Wells Fargo", last4: "9999" },
  { id: "boa", fullName: "Bank of America", last4: "5678" },
];

const SCENARIOS = [
  { key: "A", title: "Primary success", requiredAccounts: 1, slotBalances: [500] },
  { key: "B", title: "Smart fallback triggered", requiredAccounts: 2, slotBalances: [40, 600] },
  { key: "C", title: "Multi-account priority run", requiredAccounts: 3, slotBalances: [10, 20, 400] },
];

const STATEMENT_AMOUNT = 250;

function scenarioSubtitle(scenario, accounts) {
  return scenario.slotBalances.map((bal, i) => `${accounts[i] ? accounts[i].fullName : "—"} $${bal}`).join(" · ");
}

function AccountRow({ account, index, total, isPrimary, onMove, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50">
        <Landmark className="h-4.5 w-4.5 text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{account.fullName} •••• {account.last4}</p>
        <p className="mt-0.5 text-xs text-gray-500">{isPrimary ? "Active Auto-Pay" : "Backup payment method"}</p>
      </div>
      {total >= 3 && (
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
            {index + 1}
          </span>
          <div className="flex flex-col">
            <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="Move up in priority" className="rounded p-0.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-20 disabled:hover:bg-transparent">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" disabled={index === total - 1} onClick={() => onMove(index, index + 1)} aria-label="Move down in priority" className="rounded p-0.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-20 disabled:hover:bg-transparent">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {!isPrimary && (
        <button type="button" onClick={() => onRemove(account.id)} aria-label={`Remove ${account.fullName}`} className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function LogLine({ step }) {
  const iconMap = {
    pending: <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-gray-400" />,
    success: <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />,
    fail: <X className="h-3.5 w-3.5 shrink-0 text-red-400" />,
    info: <ArrowRight className="h-3.5 w-3.5 shrink-0 text-yellow-400" />,
  };
  const textColor = { pending: "text-gray-300", success: "text-green-400", fail: "text-red-400", info: "text-yellow-300" };
  return (
    <div className="flex animate-[fadein_0.25s_ease-out] items-start gap-2 py-1">
      {iconMap[step.status]}
      <span className={`text-[13px] leading-relaxed ${textColor[step.status]}`}>{step.text}</span>
    </div>
  );
}

function SmartFallbackTab() {
  const [accounts, setAccounts] = useState([PRIMARY_ACCOUNT]);
  const [availablePool, setAvailablePool] = useState(ALL_BACKUP_ACCOUNTS);
  const [addingAccount, setAddingAccount] = useState(false);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  const [scenarioKey, setScenarioKey] = useState("A");
  const [simState, setSimState] = useState("idle");
  const [steps, setSteps] = useState([]);
  const [finalResult, setFinalResult] = useState(null);

  const stepIdRef = useRef(0);

  const nextBackup = availablePool[0] || null;
  const allLinked = availablePool.length === 0;

  const addStep = useCallback((partial) => {
    stepIdRef.current += 1;
    const step = { id: stepIdRef.current, ...partial };
    setSteps((prev) => [...prev, step]);
    return step.id;
  }, []);

  const updateStep = useCallback((id, patch) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  function resetSimulation() {
    setSimState("idle");
    setSteps([]);
    setFinalResult(null);
  }

  function handleAddAccount() {
    if (!nextBackup || addingAccount) return;
    setAddingAccount(true);
    const toAdd = nextBackup;
    setTimeout(() => {
      setAccounts((prev) => [...prev, toAdd]);
      setAvailablePool((prev) => prev.filter((a) => a.id !== toAdd.id));
      setAddingAccount(false);
      resetSimulation();
    }, 1400);
  }

  function handleRemoveAccount(id) {
    const removed = accounts.find((a) => a.id === id);
    if (!removed) return;
    const nextAccounts = accounts.filter((a) => a.id !== id);
    setAccounts(nextAccounts);
    setAvailablePool((prev) => {
      const merged = [...prev, removed];
      merged.sort((a, b) => ALL_BACKUP_ACCOUNTS.findIndex((x) => x.id === a.id) - ALL_BACKUP_ACCOUNTS.findIndex((x) => x.id === b.id));
      return merged;
    });
    if (nextAccounts.length < 2) setFallbackEnabled(true);
    const currentScenario = SCENARIOS.find((s) => s.key === scenarioKey);
    if (nextAccounts.length < currentScenario.requiredAccounts) setScenarioKey("A");
    resetSimulation();
  }

  function moveAccount(from, to) {
    setAccounts((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    resetSimulation();
  }

  async function runSimulation() {
    const scenario = SCENARIOS.find((s) => s.key === scenarioKey);
    if (!scenario || simState === "running") return;
    if (accounts.length < scenario.requiredAccounts) return;

    setSimState("running");
    setSteps([]);
    setFinalResult(null);
    stepIdRef.current = 0;

    const orderedTargets = accounts.slice(0, scenario.requiredAccounts).map((acc, i) => ({ ...acc, balance: scenario.slotBalances[i] }));

    addStep({ status: "info", text: `Statement auto-pay triggered — $${STATEMENT_AMOUNT} due today.` });
    await sleep(600);

    let paidVia = null;

    for (let i = 0; i < orderedTargets.length; i++) {
      const acc = orderedTargets[i];
      const priorityNum = i + 1;
      const pendingId = addStep({ status: "pending", text: `Attempting Priority ${priorityNum}: ${acc.fullName} •••• ${acc.last4}...` });
      await sleep(1000);

      if (acc.balance >= STATEMENT_AMOUNT) {
        updateStep(pendingId, { status: "success", text: `Attempting Priority ${priorityNum}: ${acc.fullName} •••• ${acc.last4}... Success! Payment applied.` });
        paidVia = { account: acc, index: i };
        break;
      } else {
        updateStep(pendingId, { status: "fail", text: `Attempting Priority ${priorityNum}: ${acc.fullName} •••• ${acc.last4}... Failed (NSF Error R01).` });
        const hasNext = i < orderedTargets.length - 1;
        if (!hasNext) break;
        if (!fallbackEnabled) {
          await sleep(500);
          addStep({ status: "fail", text: "Smart Fallback Routing is disabled — no backup account attempted." });
          break;
        }
        await sleep(500);
        addStep({ status: "info", text: `Evaluating Smart Fallback... routing to Priority ${priorityNum + 1} (${orderedTargets[i + 1].fullName}).` });
        await sleep(700);
      }
    }

    await sleep(300);

    if (paidVia && paidVia.index === 0) {
      setFinalResult({ tone: "green", title: "Statement paid successfully.", detail: `$${STATEMENT_AMOUNT} cleared cleanly from the primary account on the first attempt.` });
      addStep({ status: "success", text: "Ledger closed. No compliance flags raised." });
    } else if (paidVia) {
      setFinalResult({ tone: "yellow", title: "Statement paid via fallback account.", detail: `${orderedTargets[0].fullName} lacked funds — the waterfall routed to ${paidVia.account.fullName}. Late fees avoided.` });
      addStep({ status: "success", text: "Ledger closed via fallback. ACH return avoided, no late fee applied." });
    } else {
      setFinalResult({
        tone: "red",
        title: "Auto-pay failed.",
        detail: fallbackEnabled
          ? "Every linked account lacked sufficient funds. ACH return filed, late fee will apply."
          : "Primary account lacked funds and Smart Fallback Routing was off. ACH return filed, late fee will apply.",
      });
      addStep({ status: "fail", text: "ACH return flag (R01) filed. Late fee scheduled." });
    }

    setSimState("done");
  }

  const scenarioAvailable = (s) => accounts.length >= s.requiredAccounts;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Payment methods</h2>
          <Badge tone="gray">{accounts.length} of 3 linked</Badge>
        </div>
        <div className="space-y-2.5">
          {accounts.map((acc, i) => (
            <AccountRow key={acc.id} account={acc} index={i} total={accounts.length} isPrimary={i === 0} onMove={moveAccount} onRemove={handleRemoveAccount} />
          ))}
          {addingAccount && (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3.5">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Connecting to your bank via Plaid...</p>
            </div>
          )}
        </div>
        {!allLinked && (
          <button type="button" onClick={handleAddAccount} disabled={addingAccount} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50">
            <Plus className="h-4 w-4" />
            {accounts.length === 1 ? "Add backup payment method" : "Add another backup account"}
          </button>
        )}
        {allLinked && (
          <p className="mt-4 flex items-center justify-center gap-1.5 py-1 text-xs text-gray-400">
            <Check className="h-3.5 w-3.5" /> All backup accounts linked
          </p>
        )}
        {accounts.length >= 2 && (
          <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Smart Fallback Routing</p>
                <p className="mt-0.5 text-xs text-gray-500">Automatically route a failed auto-pay to the next account in priority order.</p>
              </div>
            </div>
            <ToggleSwitch checked={fallbackEnabled} onChange={() => setFallbackEnabled((v) => !v)} />
          </div>
        )}
        {accounts.length >= 3 && (
          <p className="mt-4 text-xs leading-relaxed text-gray-400">
            Three or more accounts linked — use the arrows above to reorder the fallback waterfall. Priority 1 is attempted first.
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Transaction simulator</h2>
          <Badge tone="gray">${STATEMENT_AMOUNT} statement due</Badge>
        </div>
        <div className="space-y-2.5">
          {SCENARIOS.map((s) => {
            const available = scenarioAvailable(s);
            const active = scenarioKey === s.key;
            return (
              <button
                key={s.key}
                type="button"
                disabled={!available || simState === "running"}
                onClick={() => { setScenarioKey(s.key); resetSimulation(); }}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${active ? "border-red-600 bg-red-50/40" : "border-gray-100 hover:border-gray-200"} ${!available ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Flow {s.key} — {s.title}</p>
                  <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${active ? "border-red-600 bg-red-600" : "border-gray-300"}`} />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  {available ? scenarioSubtitle(s, accounts) : `Link ${s.requiredAccounts} account${s.requiredAccounts > 1 ? "s" : ""} to unlock this scenario`}
                </p>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={runSimulation} disabled={simState === "running"} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
          {simState === "running" ? (<><Loader2 className="h-4 w-4 animate-spin" /> Running ledger logic...</>) : (<>Simulate statement auto-pay (${STATEMENT_AMOUNT} due)</>)}
        </button>
        <div className="mt-5 rounded-xl bg-gray-900 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            <Terminal className="h-3.5 w-3.5" /> Backend ledger logic
          </div>
          <div className="min-h-[132px]">
            {steps.length === 0 ? (
              <p className="flex items-center gap-1.5 py-1 text-[13px] text-gray-600">
                <Info className="h-3.5 w-3.5" /> Run a simulation to trace ledger routing decisions.
              </p>
            ) : (
              steps.map((s) => <LogLine key={s.id} step={s} />)
            )}
          </div>
        </div>
        {finalResult && (
          <div className={`mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3.5 ${finalResult.tone === "green" ? "bg-green-50" : finalResult.tone === "yellow" ? "bg-yellow-50" : "bg-red-50"}`}>
            {finalResult.tone === "green" && <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />}
            {finalResult.tone === "yellow" && <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />}
            {finalResult.tone === "red" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />}
            <div>
              <p className={`text-sm font-semibold ${finalResult.tone === "green" ? "text-green-700" : finalResult.tone === "yellow" ? "text-yellow-700" : "text-red-700"}`}>{finalResult.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{finalResult.detail}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// =============================================================================
// TAB 2 — Partner Operations (Policy Engine MAS + Enterprise AI Architecture)
// =============================================================================

const STANDARD_APR = 29.99;

const COMPLIANCE_RULES = [
  { id: "A", label: "Rule A", text: "No promo APR can be below 0%." },
  { id: "B", label: "Rule B", text: "No promo can exceed 36 months." },
  { id: "C", label: "Rule C", text: "Reversion APR must be \u2265 standard APR (29.99%)." },
];

const INITIAL_LEDGER = [
  { merchant: "Crate & Barrel", promoAPR: 0, monthsRemaining: 5 },
  { merchant: "Wayfair", promoAPR: 4.99, monthsRemaining: 2 },
  { merchant: "Nike", promoAPR: 0, monthsRemaining: 10 },
];

const QUICK_FILL_PRESETS = [
  {
    label: "Crate & Barrel Sofa Promo",
    hint: "Merchant already in memory — expect a conflict",
    tone: "amber",
    merchantName: "Crate & Barrel",
    minPurchase: "999",
    duration: "12",
    promoAPR: "0",
    reversionAPR: "29.99",
  },
  {
    label: "Shell Fuel Savings",
    hint: "Clean run — expect full approval",
    tone: "green",
    merchantName: "Shell",
    minPurchase: "50",
    duration: "6",
    promoAPR: "9.99",
    reversionAPR: "27.99",
  },
  {
    label: "Stress test: policy violation",
    hint: "48-month term — expect a guardrail rejection",
    tone: "red",
    merchantName: "RushCredit Test Co",
    minPurchase: "100",
    duration: "48",
    promoAPR: "5",
    reversionAPR: "29.99",
  },
];

// These are deterministic validation stages, not model calls — plain rule
// checks and lookups. Named as a "pipeline" rather than "agents" so the UI
// never implies AI judgment where there isn't any.
const AGENTS = [
  { key: "a1", name: "Guardrail validator", icon: ClipboardCheck, processingLabel: "Checking rules", doneLabel: "Verified", rejectedLabel: "Policy violation" },
  { key: "a2", name: "Ledger conflict check", icon: ScanLine, processingLabel: "Scanning ledger", doneLabel: "Clear", conflictLabel: "Logic conflict" },
  { key: "a3", name: "Policy schema builder", icon: FileCog, processingLabel: "Building schema", doneLabel: "Ready" },
];

function SystemHealthBar({ pipelineState, latency, tokens }) {
  const statusMeta = {
    running: { label: "Processing", tone: "blue" },
    rejected: { label: "Violation detected", tone: "red" },
    conflict: { label: "Conflict detected", tone: "yellow" },
  }[pipelineState] || { label: "Operational", tone: "green" };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Gauge className="h-3.5 w-3.5" /> System health
      </span>
      <span className="h-3 w-px bg-gray-200" />
      <Badge tone="gray">Latency: {latency}ms</Badge>
      <Badge tone="gray">Token usage: {tokens}</Badge>
      <Badge tone={statusMeta.tone}>Status: {statusMeta.label}</Badge>
    </div>
  );
}

function GuardrailsPanel({ results }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900">Compliance guardrails</h2>
        <Badge tone="gray" icon={ShieldAlert}>Hard constraints</Badge>
      </div>
      <div className="space-y-2.5">
        {COMPLIANCE_RULES.map((rule) => {
          const result = results ? results[rule.id] : null;
          const tone = !result ? "gray" : result.pass ? "green" : "red";
          const label = !result ? "Standing rule" : result.pass ? "Passed" : "Violated";
          return (
            <div
              key={rule.id}
              className={`rounded-xl border px-4 py-3 ${result && !result.pass ? "border-red-200 bg-red-50/60" : "border-gray-100"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{rule.label}</p>
                <Badge tone={tone}>{label}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{rule.text}</p>
              {result && <p className="mt-1 text-xs text-gray-400">{result.detail}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LedgerSidebar({ ledger, highlightMerchant }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900">System state</h2>
        <Badge tone="gray" icon={Database}>Memory</Badge>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-gray-500">
        Active partner promos currently in the ledger. The ledger conflict check queries this list
        directly (a lookup, not a model call) during every review.
      </p>
      <div className="space-y-2">
        {ledger.map((entry) => {
          const isHighlighted = highlightMerchant && entry.merchant.toLowerCase() === highlightMerchant.toLowerCase();
          return (
            <div
              key={entry.merchant}
              className={`rounded-xl border px-3.5 py-3 transition ${isHighlighted ? "border-yellow-300 bg-yellow-50" : "border-gray-100"}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{entry.merchant}</p>
                <Badge tone={isHighlighted ? "yellow" : "green"}>Active</Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {entry.promoAPR}% promo APR · expires in {entry.monthsRemaining}mo
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AgentCard({ agent, status, log, trace, expanded, onToggleTrace }) {
  const tone = status === "done" ? "green" : status === "processing" ? "blue" : status === "rejected" ? "red" : status === "conflict" ? "yellow" : "gray";
  const iconWrapTone = {
    gray: "bg-gray-50 text-gray-400",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-700",
  }[tone];

  const label =
    status === "done" ? agent.doneLabel :
    status === "processing" ? agent.processingLabel :
    status === "rejected" ? agent.rejectedLabel :
    status === "conflict" ? agent.conflictLabel :
    "Pending";

  const Icon = agent.icon;
  const canTrace = !!trace;

  return (
    <div className="animate-[fadein_0.35s_ease-out] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrapTone}`}>
          {status === "processing" ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : status === "done" ? (
            <CheckCircle2 className="h-4.5 w-4.5" />
          ) : status === "rejected" ? (
            <AlertOctagon className="h-4.5 w-4.5" />
          ) : status === "conflict" ? (
            <AlertTriangle className="h-4.5 w-4.5" />
          ) : (
            <Icon className="h-4.5 w-4.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{agent.name}</p>
          <Badge tone={tone}>{label}</Badge>
        </div>
        {canTrace && (
          <button
            type="button"
            onClick={onToggleTrace}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Eye className="h-3.5 w-3.5" /> Trace {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {log && (
        <p className="mt-3 animate-[fadein_0.35s_ease-out] rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
          {log}
        </p>
      )}

      {expanded && trace && (
        <div className="mt-3 animate-[fadein_0.3s_ease-out] space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Input context
            </p>
            <JsonBlock data={trace.input} />
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              <ListChecks className="h-3 w-3" /> Evaluation steps
            </p>
            <ul className="space-y-1">
              {trace.reasoning.map((step, i) => (
                <li key={i} className="text-xs leading-relaxed text-gray-600">
                  <span className="mr-1.5 text-gray-300">&bull;</span>{step}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              <Code2 className="h-3 w-3" /> Output artifact
            </p>
            <JsonBlock data={trace.output} />
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ label, icon: Icon, value, onChange, placeholder, suffix, prefix }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:border-gray-400">
        {prefix && <span className="text-sm text-gray-400">{prefix}</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-300"
        />
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>
    </label>
  );
}

function PartnerOperationsTab() {
  const [form, setForm] = useState({ merchantName: "", minPurchase: "", duration: "", promoAPR: "", reversionAPR: "" });

  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  const [guardrailResults, setGuardrailResults] = useState(null);

  const [pipelineState, setPipelineState] = useState("idle"); // idle | running | rejected | conflict | done
  const [agentStatus, setAgentStatus] = useState({ a1: "pending", a2: "pending", a3: "pending" });
  const [agentLogs, setAgentLogs] = useState({});
  const [agentTraces, setAgentTraces] = useState({});
  const [expandedTrace, setExpandedTrace] = useState({});
  const [manifestVisible, setManifestVisible] = useState(false);
  const [deployState, setDeployState] = useState("idle");
  const [pulse, setPulse] = useState(false);

  const [health, setHealth] = useState({ latency: 0, tokens: 0 });

  const [docText, setDocText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [needsReview, setNeedsReview] = useState(false);

  const runIdRef = useRef(0);

  // Latency shown here is real wall-clock time for the deterministic pipeline
  // run (see runPipeline). Token usage only increases when the AI document
  // extraction below actually calls the model — deterministic rule checks
  // and lookups consume zero tokens, and the UI reflects that honestly.

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyPreset(preset) {
    setForm({
      merchantName: preset.merchantName,
      minPurchase: preset.minPurchase,
      duration: preset.duration,
      promoAPR: preset.promoAPR,
      reversionAPR: preset.reversionAPR,
    });
    setNeedsReview(false);
  }

  const formComplete =
    form.merchantName.trim() && form.minPurchase.trim() && form.duration.trim() && form.promoAPR.trim() && form.reversionAPR.trim();

  function confirmExtraction() {
    setNeedsReview(false);
  }

  function toggleTrace(key) {
    setExpandedTrace((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function runPipeline() {
    if (!formComplete || pipelineState === "running") return;

    runIdRef.current += 1;
    const runId = runIdRef.current;
    const stillCurrent = () => runIdRef.current === runId;

    setPipelineState("running");
    setAgentStatus({ a1: "pending", a2: "pending", a3: "pending" });
    setAgentLogs({});
    setAgentTraces({});
    setExpandedTrace({});
    setManifestVisible(false);
    setDeployState("idle");
    setGuardrailResults(null);
    const runStart = performance.now();

    const promoAPR = parseFloat(form.promoAPR);
    const duration = parseFloat(form.duration);
    const reversionAPR = parseFloat(form.reversionAPR);

    const ruleResults = {
      A: { pass: !Number.isNaN(promoAPR) && promoAPR >= 0, detail: `Promo APR entered: ${form.promoAPR}%` },
      B: { pass: !Number.isNaN(duration) && duration <= 36, detail: `Duration entered: ${form.duration} months` },
      C: { pass: !Number.isNaN(reversionAPR) && reversionAPR >= STANDARD_APR, detail: `Reversion APR entered: ${form.reversionAPR}% (standard is ${STANDARD_APR}%)` },
    };
    const violatedRule = ["A", "B", "C"].find((k) => !ruleResults[k].pass);

    await sleep(400);
    if (!stillCurrent()) return;
    setAgentStatus((p) => ({ ...p, a1: "processing" }));
    await sleep(1100);
    if (!stillCurrent()) return;

    setGuardrailResults(ruleResults);

    const reasoningA1 = [
      `Step 1: Check Rule A (Promo APR \u2265 0%)... Result: ${ruleResults.A.pass ? "Pass" : "Fail"} — ${ruleResults.A.detail}`,
      `Step 2: Check Rule B (Duration \u2264 36 months)... Result: ${ruleResults.B.pass ? "Pass" : "Fail"} — ${ruleResults.B.detail}`,
      `Step 3: Check Rule C (Reversion APR \u2265 standard APR)... Result: ${ruleResults.C.pass ? "Pass" : "Fail"} — ${ruleResults.C.detail}`,
    ];

    if (violatedRule) {
      reasoningA1.push(`Step 4: Rule ${violatedRule} violated — halting pipeline before ledger scan.`);
      setAgentStatus((p) => ({ ...p, a1: "rejected" }));
      setAgentLogs((p) => ({ ...p, a1: `Guardrail check: Policy violation — Rule ${violatedRule} failed. Submission rejected before the ledger was scanned.` }));
      setAgentTraces((p) => ({
        ...p,
        a1: {
          input: { merchant: form.merchantName, promoAPR: form.promoAPR, duration: form.duration, reversionAPR: form.reversionAPR },
          reasoning: reasoningA1,
          output: { status: "REJECTED", violated_rule: `RULE_${violatedRule}`, message: ruleResults[violatedRule].detail },
        },
      }));
      setPipelineState("rejected");
      setHealth((h) => ({ ...h, latency: Math.round(performance.now() - runStart) }));
      return;
    }

    reasoningA1.push("Step 4: Merchant profile fields complete... Result: Pass");
    setAgentStatus((p) => ({ ...p, a1: "done" }));
    setAgentLogs((p) => ({ ...p, a1: `Guardrail check: Verified merchant profile for ${form.merchantName}. All guardrails passed.` }));
    setAgentTraces((p) => ({
      ...p,
      a1: {
        input: { merchant: form.merchantName, promoAPR: form.promoAPR, duration: form.duration, reversionAPR: form.reversionAPR },
        reasoning: reasoningA1,
        output: { status: "VERIFIED", merchant: form.merchantName, checks: { ruleA: "pass", ruleB: "pass", ruleC: "pass" } },
      },
    }));

    await sleep(350);
    if (!stillCurrent()) return;
    setAgentStatus((p) => ({ ...p, a2: "processing" }));
    await sleep(1200);
    if (!stillCurrent()) return;

    const conflict = ledger.find((e) => e.merchant.toLowerCase() === form.merchantName.trim().toLowerCase());

    if (conflict) {
      setAgentStatus((p) => ({ ...p, a2: "conflict" }));
      setAgentLogs((p) => ({ ...p, a2: `Ledger check: Logic conflict — ${conflict.merchant} already has an active promo (expires in ${conflict.monthsRemaining}mo).` }));
      setAgentTraces((p) => ({
        ...p,
        a2: {
          input: { merchant: form.merchantName, ledgerSize: ledger.length },
          reasoning: [
            `Step 1: Query long-term memory (Active Partner Promos ledger)... Found ${ledger.length} active entries.`,
            `Step 2: Search ledger for merchant match on "${form.merchantName}"... Result: Match found.`,
            `Step 3: Existing active promo detected (${conflict.promoAPR}% APR, expires in ${conflict.monthsRemaining}mo)... Flagging conflict.`,
          ],
          output: { status: "CONFLICT", conflicting_entry: conflict },
        },
      }));
      setPipelineState("conflict");
      setHealth((h) => ({ ...h, latency: Math.round(performance.now() - runStart) }));
      return;
    }

    setAgentStatus((p) => ({ ...p, a2: "done" }));
    setAgentLogs((p) => ({ ...p, a2: `Ledger check: Scanned ${ledger.length} active promos for ${form.merchantName}, no conflicts found.` }));
    setAgentTraces((p) => ({
      ...p,
      a2: {
        input: { merchant: form.merchantName, ledgerSize: ledger.length },
        reasoning: [
          `Step 1: Query long-term memory (Active Partner Promos ledger)... Found ${ledger.length} active entries.`,
          `Step 2: Search ledger for merchant match on "${form.merchantName}"... Result: No match.`,
          "Step 3: No overlapping promo found for this merchant... Clear to proceed.",
        ],
        output: { status: "CLEAR", scanned: ledger.length, conflicts: 0 },
      },
    }));

    await sleep(350);
    if (!stillCurrent()) return;
    setAgentStatus((p) => ({ ...p, a3: "processing" }));
    await sleep(1200);
    if (!stillCurrent()) return;

    setAgentStatus((p) => ({ ...p, a3: "done" }));
    setAgentLogs((p) => ({ ...p, a3: `Schema builder: Generated policy schema — promo_apr=${form.promoAPR}%, reversion_apr=${form.reversionAPR}%, duration=${form.duration}mo.` }));
    setAgentTraces((p) => ({
      ...p,
      a3: {
        input: { merchant: form.merchantName, minPurchase: form.minPurchase, duration: form.duration, promoAPR: form.promoAPR, reversionAPR: form.reversionAPR },
        reasoning: [
          "Step 1: Map intake fields to policy schema fields.",
          "Step 2: Generate promo_apr, reversion_apr, duration_months, min_purchase_cents.",
          "Step 3: Assign draft policy ID and status = DRAFT.",
        ],
        output: {
          policy_id: `pol_${Date.now().toString(36)}`,
          merchant: form.merchantName,
          promo_apr: Number(form.promoAPR),
          reversion_apr: Number(form.reversionAPR),
          duration_months: Number(form.duration),
          min_purchase_cents: Math.round(Number(form.minPurchase) * 100),
          status: "DRAFT",
        },
      },
    }));

    await sleep(500);
    if (!stillCurrent()) return;
    setPipelineState("done");
    setManifestVisible(true);
    setHealth((h) => ({ ...h, latency: Math.round(performance.now() - runStart) }));
  }

  // Genuine AI step: extract structured fields from an unstructured partner
  // document (an email, a term sheet, notes from a call). This is the one
  // place in the flow that actually calls a model — everything below still
  // requires a human to review the extracted values before anything runs
  // through the deterministic pipeline above.
  async function extractFromDocument() {
    if (!docText.trim() || extracting) return;
    setExtracting(true);
    setExtractionError(null);
    const start = performance.now();
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `Extract partner promo terms from the text below. Respond with ONLY a raw JSON object — no markdown fences, no other text — in exactly this shape:
{"merchantName": "", "minPurchase": "", "duration": "", "promoAPR": "", "reversionAPR": ""}
merchantName is a string. minPurchase, duration (months), promoAPR, and reversionAPR are numbers written as strings, with no % or $ signs. If a field isn't mentioned in the text, leave it as an empty string — do not guess.

Text:
"""
${docText}
"""`,
            },
          ],
        }),
      });
      const data = await response.json();
      const rawText = (data.content || []).map((c) => c.text || "").join("");
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setForm({
        merchantName: parsed.merchantName || "",
        minPurchase: parsed.minPurchase || "",
        duration: parsed.duration || "",
        promoAPR: parsed.promoAPR || "",
        reversionAPR: parsed.reversionAPR || "",
      });
      setNeedsReview(true);
      const usedTokens = data.usage ? data.usage.input_tokens + data.usage.output_tokens : 0;
      setHealth((h) => ({ latency: Math.round(performance.now() - start), tokens: h.tokens + usedTokens }));
    } catch (err) {
      setExtractionError("Couldn't extract fields from that text. Try rephrasing, or fill the form in manually below.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleDeploy() {
    if (deployState !== "idle") return;
    setDeployState("deploying");
    await sleep(900);
    setDeployState("deployed");
    setLedger((prev) => [...prev, { merchant: form.merchantName, promoAPR: Number(form.promoAPR), monthsRemaining: Number(form.duration) }]);
    setPulse(true);
    setTimeout(() => setPulse(false), 1200);
  }

  const diffRows = [
    { label: "Merchant", current: "—", proposed: form.merchantName || "—" },
    { label: "Minimum purchase", current: "—", proposed: form.minPurchase ? `$${form.minPurchase}` : "—" },
    { label: "Promotional duration", current: "—", proposed: form.duration ? `${form.duration} months` : "—" },
    { label: "Promo APR", current: `${STANDARD_APR}% (standard)`, proposed: form.promoAPR ? `${form.promoAPR}%` : "—" },
    { label: "Reversion APR", current: "N/A", proposed: form.reversionAPR ? `${form.reversionAPR}%` : "—" },
    { label: "Policy status", current: "No active promotion", proposed: "Pending deployment" },
  ];

  const presetToneClasses = {
    amber: "border-yellow-200 text-yellow-700 hover:bg-yellow-50",
    green: "border-green-200 text-green-700 hover:bg-green-50",
    red: "border-red-200 text-red-600 hover:bg-red-50",
  };

  return (
    <div className="space-y-6">
      <SystemHealthBar pipelineState={pipelineState} latency={health.latency} tokens={health.tokens} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr_0.85fr]">
        {/* Left column — Intake form + Guardrails */}
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-gray-900">Partner intake form</h2>
              <Badge tone="gray" icon={Building2}>New policy request</Badge>
            </div>

            <div className="mb-4 rounded-xl border border-gray-100 p-3.5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Sparkles className="h-3.5 w-3.5 text-red-600" /> Paste an unstructured partner email or term sheet (optional)
              </p>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder={'e.g. "Hi team — for the Q3 furniture push we\'d like 0% APR for 12 months on purchases over $999, reverting to standard after that."'}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none placeholder:text-gray-300 focus:border-gray-400"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-gray-400">This calls Claude to extract fields — you'll review them before anything is submitted.</p>
                <button
                  type="button"
                  onClick={extractFromDocument}
                  disabled={!docText.trim() || extracting}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {extracting ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Extracting...</>) : (<>Extract with AI</>)}
                </button>
              </div>
              {extractionError && <p className="mt-2 text-xs text-red-600">{extractionError}</p>}
            </div>

            {needsReview && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                <p className="text-xs leading-relaxed text-amber-800">
                  AI-extracted — check the fields below before submitting.
                </p>
                <button
                  type="button"
                  onClick={confirmExtraction}
                  className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                >
                  Looks correct
                </button>
              </div>
            )}

            <div className="mb-4 flex flex-col gap-2">
              {QUICK_FILL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${presetToneClasses[preset.tone]}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> {preset.label}
                  </span>
                  <span className="text-[11px] font-normal opacity-70">{preset.hint}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3.5">
              <FieldInput label="Merchant name" icon={Building2} value={form.merchantName} onChange={(v) => updateField("merchantName", v)} placeholder="e.g. Crate & Barrel" />
              <FieldInput label="Minimum purchase" icon={DollarSign} value={form.minPurchase} onChange={(v) => updateField("minPurchase", v)} placeholder="999" prefix="$" />
              <FieldInput label="Promotional duration" icon={CalendarDays} value={form.duration} onChange={(v) => updateField("duration", v)} placeholder="12" suffix="months" />
              <FieldInput label="Promo APR" icon={Percent} value={form.promoAPR} onChange={(v) => updateField("promoAPR", v)} placeholder="0" suffix="%" />
              <FieldInput label="Reversion APR" icon={Percent} value={form.reversionAPR} onChange={(v) => updateField("reversionAPR", v)} placeholder="29.99" suffix="%" />
            </div>

            <button
              type="button"
              onClick={runPipeline}
              disabled={!formComplete || needsReview || pipelineState === "running"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pipelineState === "running" ? (<><Loader2 className="h-4 w-4 animate-spin" /> Running policy validation...</>) : (<>Submit for policy validation</>)}
            </button>
            {!formComplete && !needsReview && <p className="mt-2 text-center text-xs text-gray-400">Fill every field, use a quick fill preset, or extract from a document, to enable submission.</p>}
            {needsReview && <p className="mt-2 text-center text-xs text-amber-700">Confirm the AI-extracted values above before submitting.</p>}
          </section>

          <GuardrailsPanel results={guardrailResults} />
        </div>

        {/* Middle column — deterministic policy validation pipeline */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">Policy validation pipeline</h2>
            <Badge tone="gray" icon={Boxes}>3 deterministic checks</Badge>
          </div>

          {pipelineState === "idle" ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <Users className="mb-3 h-6 w-6 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">No active review</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-400">
                Submit the intake form to run the guardrail check, ledger conflict check, and schema builder — plain rule evaluation, no model calls.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {AGENTS.map((agent) => (
                <AgentCard
                  key={agent.key}
                  agent={agent}
                  status={agentStatus[agent.key]}
                  log={agentLogs[agent.key]}
                  trace={agentTraces[agent.key]}
                  expanded={!!expandedTrace[agent.key]}
                  onToggleTrace={() => toggleTrace(agent.key)}
                />
              ))}

              {pipelineState === "rejected" && (
                <div className="animate-[fadein_0.3s_ease-out] rounded-xl bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700">
                  Pipeline halted at the guardrail check — compliance rule violated. The ledger was never scanned.
                </div>
              )}
              {pipelineState === "conflict" && (
                <div className="animate-[fadein_0.3s_ease-out] rounded-xl bg-yellow-50 px-4 py-3 text-xs leading-relaxed text-yellow-700">
                  Pipeline halted at the ledger conflict check — an existing active promo conflict was found in memory.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right column — Memory sidebar */}
        <LedgerSidebar ledger={ledger} highlightMerchant={pipelineState === "conflict" ? form.merchantName : null} />
      </div>

      {/* Post-agent action — Approval Manifest */}
      {manifestVisible && (
        <section className="animate-[fadein_0.4s_ease-out] rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">Approval manifest</h2>
            <Badge tone="green" icon={CheckCircle2}>All checks passed</Badge>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-2.5 font-medium">Field</th>
                  <th className="px-4 py-2.5 font-medium">Current state</th>
                  <th className="px-4 py-2.5 font-medium">Proposed state</th>
                </tr>
              </thead>
              <tbody>
                {diffRows.map((row, i) => (
                  <tr key={row.label} className={i !== diffRows.length - 1 ? "border-b border-gray-100" : ""}>
                    <td className="px-4 py-3 text-gray-600">{row.label}</td>
                    <td className="px-4 py-3 text-gray-400">{row.current}</td>
                    <td className="px-4 py-3 font-medium text-green-700">{row.proposed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="relative mt-5">
            {pulse && <span className="pointer-events-none absolute inset-0 -m-1 animate-ping rounded-xl bg-green-400 opacity-30" />}
            <button
              type="button"
              onClick={handleDeploy}
              disabled={deployState !== "idle"}
              className={`relative flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                deployState === "deployed" ? "bg-green-600" : "bg-red-600 hover:bg-red-700 disabled:opacity-60"
              }`}
            >
              {deployState === "idle" && (<><Rocket className="h-4 w-4" /> Approve & deploy to sandbox</>)}
              {deployState === "deploying" && (<><Loader2 className="h-4 w-4 animate-spin" /> Deploying to sandbox...</>)}
              {deployState === "deployed" && (<><CheckCircle2 className="h-4 w-4" /> Deployed to sandbox</>)}
            </button>
          </div>

          {deployState === "deployed" && (
            <p className="mt-3 animate-[fadein_0.35s_ease-out] rounded-lg bg-green-50 px-3 py-2.5 text-xs leading-relaxed text-green-700">
              Policy for {form.merchantName} is live in the sandbox environment and has been written back to memory for future conflict scans.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

// =============================================================================
// Root — Platform Command Center
// =============================================================================

export default function PlatformCommandCenter() {
  const [activeTab, setActiveTab] = useState("servicing");

  return (
    <div className="min-h-screen w-full bg-gray-50 px-4 py-10 sm:px-8">
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-1">
          <LogoMark />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">Platform Command Center</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            One console for both sides of the platform — servicing tools that keep existing
            cardholders paid on time, and the partner pipeline that gets new promotional policies
            reviewed and shipped.
          </p>
        </div>

        <div className="mb-6 inline-flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("servicing")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "servicing" ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Users className="h-4 w-4" /> User servicing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("partner")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "partner" ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Boxes className="h-4 w-4" /> Partner operations
          </button>
        </div>

        <div className={activeTab === "servicing" ? "" : "hidden"}>
          <SmartFallbackTab />
        </div>
        <div className={activeTab === "partner" ? "" : "hidden"}>
          <PartnerOperationsTab />
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Internal prototype — Imprint Payments Engineering. All balances, ledger entries, and
          merchant data are simulated for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}
