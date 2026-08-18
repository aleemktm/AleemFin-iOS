// core.js — Pure, dependency-light application helpers.
// These helpers contain no React state and are safe to reuse across features.
(function () {
  const STORAGE_KEY = "aleemfin_data_v8";

  const loadStoredData = (key, fallback) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[key]) return parsed[key];
      }
    } catch (e) {}
    return fallback;
  };


  const persistData = (snapshot, fallback = {}) => {
    try {
      let existing = {};
      try {
        existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
      } catch (_) {}
      const data = { ...snapshot };
      for (const key of ["budgets", "goals", "recurringItems"]) {
        if (data[key] === undefined) data[key] = Array.isArray(existing[key]) ? existing[key] : fallback[key];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (_) {
      return false;
    }
  };

  const rowsToCsv = rows => rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");

  const downloadTextFile = (content, filename, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const hashPin = async pin => {
    const value = String(pin || "");
    if (window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(value);
      const digest = await window.crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return (hash >>> 0).toString(16);
  };

  const advanceRecurringDate = (date, frequency) => {
    const next = new Date(`${date}T12:00:00`);
    if (frequency === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (frequency === "yearly") {
      const day = next.getDate();
      next.setFullYear(next.getFullYear() + 1);
      if (next.getDate() !== day) next.setDate(0);
    } else {
      const day = next.getDate();
      next.setDate(1);
      next.setMonth(next.getMonth() + 2, 0);
      next.setDate(Math.min(day, next.getDate()));
    }
    const off = next.getTimezoneOffset();
    const local = new Date(next.getTime() - off * 6e4);
    return local.toISOString().slice(0, 10);
  };

  const makeId = (prefix = "") => {
    const rand = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return prefix ? `${prefix}${rand}` : rand;
  };

  window.AleemFinCore = Object.freeze({ STORAGE_KEY, loadStoredData, persistData, rowsToCsv, downloadTextFile, hashPin, advanceRecurringDate, makeId });
})();


// -----------------------------------------------------------------------------
// State history utility (Phase 4)
// Behavior-preserving helper for undo/redo snapshots.
// The application decides when snapshots are captured; this utility only manages
// bounded history and never changes the application's data schema.
// -----------------------------------------------------------------------------
export const createStateHistory = (limit = 50) => {
  let past = [];
  let future = [];

  const clone = (value) => {
    if (value == null) return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  };

  return {
    clear() {
      past = [];
      future = [];
    },
    push(state) {
      past.push(clone(state));
      if (past.length > limit) past.shift();
      future = [];
    },
    undo(current) {
      if (!past.length) return { state: current, changed: false };
      const previous = past.pop();
      future.push(clone(current));
      return { state: clone(previous), changed: true };
    },
    redo(current) {
      if (!future.length) return { state: current, changed: false };
      const next = future.pop();
      past.push(clone(current));
      return { state: clone(next), changed: true };
    },
    canUndo() {
      return past.length > 0;
    },
    canRedo() {
      return future.length > 0;
    },
    sizes() {
      return { past: past.length, future: future.length };
    }
  };
};


// -----------------------------------------------------------------------------
// Loan domain utility (Phase 5)
// Pure helpers only. Existing loan UI/state behavior remains unchanged.
// -----------------------------------------------------------------------------
export const AleemFinLoanLogic = Object.freeze({
  paymentTotal(payments = []) {
    return payments.reduce((sum, payment) => {
      const amount = Number(payment?.amount);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);
  },

  remainingBalance(originalAmount, payments = []) {
    const original = Number(originalAmount);
    if (!Number.isFinite(original)) return 0;
    return Math.max(0, original - this.paymentTotal(payments));
  },

  normalizeType(type) {
    return type === 'borrowed' ? 'borrowed' : 'lent';
  }
});


// -----------------------------------------------------------------------------
// Loan record utilities (Phase 6)
// Pure, schema-preserving helpers. UI/state orchestration remains in app.js.
// -----------------------------------------------------------------------------
export const AleemFinLoanRecords = Object.freeze({
  payments(loan) {
    return Array.isArray(loan?.payments) ? loan.payments : [];
  },
  paidAmount(loan) {
    return this.payments(loan).reduce((sum, p) => {
      const n = Number(p?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
  },
  balance(loan) {
    const original = Number(loan?.amount);
    if (!Number.isFinite(original)) return 0;
    return Math.max(0, original - this.paidAmount(loan));
  },
  isSettled(loan) {
    return this.balance(loan) <= 0;
  }
});


// -----------------------------------------------------------------------------
// Loan actions (Phase 7)
// Pure immutable actions. These return new records and do not mutate app state.
// Existing App orchestration remains unchanged.
// -----------------------------------------------------------------------------
export const AleemFinLoanActions = Object.freeze({
  addPayment(loan, payment) {
    const current = Array.isArray(loan?.payments) ? loan.payments : [];
    return {
      ...loan,
      payments: [...current, { ...payment }]
    };
  },

  removePayment(loan, paymentId) {
    const current = Array.isArray(loan?.payments) ? loan.payments : [];
    return {
      ...loan,
      payments: current.filter(p => p?.id !== paymentId)
    };
  },

  withPayment(loan, payment) {
    return this.addPayment(loan, payment);
  }
});
