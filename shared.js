// shared.js — Single source of truth for app-wide display/configuration constants.
// Keep this file dependency-light so every feature can consume the same definitions.
(function () {
  const CURRENCY_REGISTRY = [
    { code: "AED", name: "UAE Dirham" },
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "Pound" },
    { code: "SAR", name: "Saudi Riyal" },
    { code: "INR", name: "Indian Rupee" },
    { code: "PKR", name: "Pakistani Rupee" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" }
  ];

  const CURRENCY_CODES = CURRENCY_REGISTRY.map(item => item.code);
  const RATE_CURRENCY_OPTIONS = CURRENCY_REGISTRY.filter(item => item.code !== "AED").map(item => [item.code, item.name]);
  const RATE_CURRENCY_CODES = RATE_CURRENCY_OPTIONS.map(item => item[0]);

  const DASHBOARD_CARD_OPTIONS = [
    { id: "accounts", label: "Accounts" },
    { id: "vault", label: "Assets" },
    { id: "loans", label: "Lent" },
    { id: "analytics", label: "Month Snapshot" },
    { id: "planning", label: "Plans" },
    { id: "recurring", label: "Upcoming" },
    { id: "gold", label: "24k Gold Rate" },
    { id: "rates", label: "FX Rates" },
    { id: "gold-performance", label: "Gold Performance" },
    { id: "runway", label: "Cash Buffer" },
    { id: "spending", label: "Spending Pace" }
  ];

  const ACCOUNT_COLORS = [
    "#1DBF73", "#3B82F6", "#6366F1", "#F59E0B",
    "#8B5CF6", "#EF5DA8", "#14B8A6", "#F97316"
  ];

  const accountColor = acc => {
    const name = String(acc?.name || "").toLowerCase();
    const type = String(acc?.type || "").toLowerCase();
    if (name.includes("fiverr")) return "#3B82F6";
    if (name.includes("paypal")) return "#6366F1";
    if (name.includes("ubl")) return "#F59E0B";
    if (name.includes("dib")) return "#1DBF73";
    if (name.includes("cash") || type === "cash") return "#8E8E93";
    return acc?.color || "#1DBF73";
  };

  window.AleemFinShared = Object.freeze({
    CURRENCY_REGISTRY: Object.freeze(CURRENCY_REGISTRY),
    CURRENCY_CODES: Object.freeze(CURRENCY_CODES),
    RATE_CURRENCY_OPTIONS: Object.freeze(RATE_CURRENCY_OPTIONS),
    RATE_CURRENCY_CODES: Object.freeze(RATE_CURRENCY_CODES),
    DASHBOARD_CARD_OPTIONS: Object.freeze(DASHBOARD_CARD_OPTIONS),
    ACCOUNT_COLORS: Object.freeze(ACCOUNT_COLORS),
    accountColor
  });
})();
