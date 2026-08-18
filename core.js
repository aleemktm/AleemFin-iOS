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
