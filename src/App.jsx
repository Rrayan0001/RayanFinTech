import React, { useState, useEffect, useMemo, useCallback, useRef, forwardRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";


/* ══════════════════════════════════════════
   MOCK DATA GENERATION
   ══════════════════════════════════════════ */
const EXPENSE_CATS = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Education", "Others"];
const INCOME_CATS = ["Salary", "Freelance", "Investments"];
const ALL_CATS = [...EXPENSE_CATS, ...INCOME_CATS];

const DESC_MAP = {
  "Food & Dining": ["Swiggy Order", "Zomato Delivery", "Starbucks", "Restaurant Bill", "BigBasket"],
  "Transport": ["Uber Ride", "Metro Recharge", "Ola Auto", "Fuel Station", "Rapido"],
  "Shopping": ["Amazon", "Flipkart", "Myntra", "IKEA", "Decathlon"],
  "Entertainment": ["Netflix", "Movie Tickets", "Spotify", "Steam Games", "BookMyShow"],
  "Bills & Utilities": ["Electricity Bill", "WiFi Bill", "Mobile Recharge", "Water Bill", "Gas Bill"],
  "Healthcare": ["Apollo Pharmacy", "Doctor Visit", "Lab Tests", "Insurance", "Gym"],
  "Education": ["Udemy Course", "Books", "Coursera", "Workshop", "Exam Fee"],
  "Others": ["Misc Expense", "General Purchase", "Unexpected Cost", "Cash Payment", "Other Expense"],
  "Salary": ["Monthly Salary", "Bonus", "Incentive"],
  "Freelance": ["Client Payment", "Project Fee", "Consulting"],
  "Investments": ["MF Returns", "Dividend", "FD Interest", "Rental Income"],
};

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function generateTransactions() {
  const txns = [];
  const rand = seededRandom(42);
  const months = [
    { y: 2026, m: 3 }, { y: 2026, m: 2 }, { y: 2026, m: 1 },
    { y: 2025, m: 12 }, { y: 2025, m: 11 }, { y: 2025, m: 10 },
  ];
  months.forEach(({ y, m }, mi) => {
    const n = 12 + Math.floor(rand() * 10);
    for (let i = 0; i < n; i++) {
      const isIncome = rand() < 0.22;
      const cats = isIncome ? INCOME_CATS : EXPENSE_CATS;
      const cat = cats[Math.floor(rand() * cats.length)];
      const descs = DESC_MAP[cat];
      const amount = isIncome
        ? Math.round((8000 + rand() * 92000) * 100) / 100
        : Math.round((80 + rand() * 7000) * 100) / 100;
      const day = 1 + Math.floor(rand() * 28);
      txns.push({
        id: `t${mi}${i}`,
        date: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        description: descs[Math.floor(rand() * descs.length)],
        category: cat,
        amount,
        type: isIncome ? "income" : "expense",
      });
    }
  });
  return txns.sort((a, b) => b.date.localeCompare(a.date));
}

const INITIAL_TXNS = generateTransactions();

const TAB_ROUTES = {
  overview: "/",
  transactions: "/transactions",
  insights: "/insights",
  settings: "/settings",
};

const normalizePath = (pathname = "/") => {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) || "/" : pathname;
};

const getTabFromPath = (pathname = "/") => {
  const normalized = normalizePath(pathname);
  const match = Object.entries(TAB_ROUTES).find(([, route]) => route === normalized);
  return match ? match[0] : "overview";
};

/* ══════════════════════════════════════════
   THEMES
   ══════════════════════════════════════════ */
const DARK = {
  bg: "#0D0D0D", surface: "#151515", card: "#1A1A1A", cardAlt: "#222222",
  border: "#292929", text: "#FFFFFF", textSec: "#A1A1A1", textMuted: "#666666",
  green: "#A3FF12", greenSoft: "rgba(163,255,18,0.1)", orange: "#FF9500",
  orangeSoft: "rgba(255,149,0,0.1)", red: "#FF3B30", redSoft: "rgba(255,59,48,0.1)",
  accent: "#A3FF12", inputBg: "#1F1F1F", hover: "#2C2C2C",
  shadow: "0 4px 20px rgba(0,0,0,0.2)", gradientFrom: "#A3FF12", gradientTo: "#c8ff00",
};
const LIGHT = {
  bg: "#eef2e4", surface: "#fff", card: "#fff", cardAlt: "#f8f9f4",
  border: "#ddd9ce", text: "#111", textSec: "#666", textMuted: "#aaa",
  green: "#4a9e2f", greenSoft: "rgba(74,158,47,0.08)", orange: "#d4891a",
  orangeSoft: "rgba(212,137,26,0.08)", red: "#d63031", redSoft: "rgba(214,48,49,0.08)",
  accent: "#6b8e23", inputBg: "#f4f5ef", hover: "#f0f1ea",
  shadow: "0 2px 16px rgba(0,0,0,0.06)", gradientFrom: "#4a9e2f", gradientTo: "#8ab820",
};

/* ══════════════════════════════════════════
   ICONS (inline SVG)
   ══════════════════════════════════════════ */
const Icons = {
  wallet: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="14" rx="3" /><path d="M2 10h20" /><circle cx="17" cy="14" r="1.5" fill={c} /></svg>,
  trendUp: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  trendDown: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
  search: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  download: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  plus: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  edit: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  lightbulb: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  x: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  empty: (c) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>,
  chart: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  list: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill={c} /><circle cx="4" cy="12" r="1" fill={c} /><circle cx="4" cy="18" r="1" fill={c} /></svg>,
  heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  diamond: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M11 3 8 9l4 13"></path><path d="M12 3v13"></path></svg>,
  settings: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  box: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  sliders: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>,
  message: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  premiumFlame: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21.5C9.5 21.5 7.5 19.5 7.5 17C7.5 14 12 7.5 12 7.5C12 7.5 16.5 14 16.5 17C16.5 19.5 14.5 21.5 12 21.5Z" fill="url(#flameGrad1)" /><path d="M12 21.5C10.5 21.5 9 20 9 18.5C9 16.5 12 12.5 12 12.5C12 12.5 15 16.5 15 18.5C15 20 13.5 21.5 12 21.5Z" fill="url(#flameGrad2)" /><defs><linearGradient id="flameGrad1" x1="12" y1="7.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse"><stop stopColor="#FF6B00" /><stop offset="1" stopColor="#FFC700" /></linearGradient><linearGradient id="flameGrad2" x1="12" y1="12.5" x2="12" y2="21.5" gradientUnits="userSpaceOnUse"><stop stopColor="#FF1F00" /><stop offset="1" stopColor="#FF9900" /></linearGradient></defs></svg>,
  premiumChartDown: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" fill="#EEF2F6" /><path d="M7 9L11 13L13 11L17 15" stroke="#4C82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 11V15H13" stroke="#4C82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  premiumChartUp: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" fill="#EEF2F6" /><path d="M7 15L11 11L13 13L17 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 13V9H13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  premiumMoneyBag: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C10 2 8 3.5 8 5C8 6 9 6.5 10 7C9.5 7.5 7 8 6 12C5.5 14 5 17 7 19.5C8 20.5 10 21 12 21C14 21 16 20.5 17 19.5C19 17 18.5 14 18 12C17 8 14.5 7.5 14 7C15 6.5 16 6 16 5C16 3.5 14 2 12 2Z" fill="url(#goldGrad)" /><circle cx="12" cy="14" r="3" fill="#D97706" /><line x1="12" y1="12.5" x2="12" y2="15.5" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" /><defs><linearGradient id="goldGrad" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop stopColor="#FDE68A" /><stop offset="1" stopColor="#D97706" /></linearGradient></defs></svg>,
  premiumMetricBar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="14" width="4" height="6" rx="1" fill="#EF4444" /><rect x="10" y="8" width="4" height="12" rx="1" fill="#10B981" /><rect x="16" y="11" width="4" height="9" rx="1" fill="#3B82F6" /></svg>,
  user: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  alertTriangle: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
};

/* ══════════════════════════════════════════
   UTILITY FUNCTIONS
   ══════════════════════════════════════════ */
const fmtDate = (d) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/* ══════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════ */

function SummaryCard({ title, value, subtitle, icon, color, soft, delay, t, userSettings, rawValue, isMobile, variant = "default" }) {
  const [vis, setVis] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isBoxless = variant === "boxless";

  useEffect(() => { const tm = setTimeout(() => setVis(true), delay); return () => clearTimeout(tm); }, [delay]);

  const isOverBudget = title === "Total Expenses" && rawValue > userSettings.budget;
  const cardColor = isOverBudget ? "#ff4d4f" : color;
  const cardSoft = isOverBudget ? "#fff1f0" : soft;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isBoxless
          ? `linear-gradient(180deg, ${cardColor}10 0%, ${t.cardAlt || t.surface} 82%)`
          : isOverBudget ? cardSoft : t.card,
        borderRadius: isBoxless ? 22 : 16,
        borderStyle: "solid",
        borderWidth: isBoxless ? "1px" : "1px",
        borderColor: isBoxless ? (hovered ? cardColor + "26" : t.border) : (isOverBudget ? cardColor : (hovered ? color + '44' : t.border)),
        padding: isBoxless ? (isMobile ? "18px 18px 20px" : "20px 20px 22px") : isMobile ? "18px 18px" : "22px 24px",
        boxShadow: isBoxless ? `0 10px 30px ${cardColor}0d` : hovered ? `0 8px 32px ${cardColor}22` : t.shadow,
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", cursor: "default",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: isBoxless ? 14 : 16 }}>
        <div style={{ width: isBoxless ? 42 : 44, height: isBoxless ? 42 : 44, borderRadius: isBoxless ? 14 : 12, backgroundColor: isOverBudget ? "#ff4d4f22" : soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isOverBudget ? Icons.alertTriangle("#ff4d4f") : icon}
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: t.textSec, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 900, color: cardColor, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 8, wordBreak: "break-word" }}>{value}</div>
      <div style={{ fontSize: isMobile ? 10 : 11, color: isOverBudget ? "#ff4d4f" : t.textMuted, fontWeight: isOverBudget ? 700 : 500 }}>
        {isOverBudget ? "Budget Exceeded!" : subtitle}
      </div>
    </div>
  );
}

function BalanceTrend({ txns, t, fmt, isMobile, variant = "default" }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const isBoxless = variant === "boxless";
  const monthlyData = useMemo(() => {
    const map = {};
    txns.forEach(tx => {
      const key = tx.date.slice(0, 7);
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (tx.type === "income") map[key].income += tx.amount;
      else map[key].expense += tx.amount;
    });
    const sorted = Object.keys(map).sort();
    let balance = 50000;
    return sorted.map(k => {
      balance += map[k].income - map[k].expense;
      const dt = new Date(k + "-01T00:00:00");
      return { month: dt.toLocaleDateString("en-IN", { month: "short" }), year: k.slice(0, 4), balance: Math.round(balance), income: Math.round(map[k].income), expense: Math.round(map[k].expense) };
    });
  }, [txns]);

  if (!monthlyData.length) return <EmptyState t={t} msg="No trend data yet" />;

  const W = isMobile ? 360 : 500;
  const H = isMobile ? 168 : 180;
  const PX = isMobile ? 28 : 40;
  const PY = isMobile ? 18 : 20;
  const maxV = Math.max(...monthlyData.map(d => d.balance)) * 1.15;
  const minV = Math.min(...monthlyData.map(d => d.balance)) * 0.85;
  const range = maxV - minV || 1;
  const pts = monthlyData.map((d, i) => ({
    x: PX + (i / Math.max(monthlyData.length - 1, 1)) * (W - PX * 2),
    y: PY + (1 - (d.balance - minV) / range) * (H - PY * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = line + ` L${pts[pts.length - 1].x},${H - PY} L${pts[0].x},${H - PY} Z`;

  const highestMonth = monthlyData.reduce((a, b) => a.balance > b.balance ? a : b);
  const lowestMonth = monthlyData.reduce((a, b) => a.balance < b.balance ? a : b);
  const avgBalance = Math.round(monthlyData.reduce((s, d) => s + d.balance, 0) / monthlyData.length);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: "100%", minWidth: isMobile ? 280 : 300, height: "auto" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.green} stopOpacity="0.25" />
              <stop offset="100%" stopColor={t.green} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = PY + pct * (H - PY * 2);
            const val = Math.round(maxV - pct * range);
            return (<g key={i}>
              <line x1={PX} y1={y} x2={W - PX} y2={y} stroke={t.border} strokeWidth="1" />
              <text x={PX - 6} y={y + 4} textAnchor="end" fill={t.textMuted} fontSize="9" fontFamily="Oswald">{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}</text>
            </g>);
          })}
          <path d={area} fill="url(#areaGrad)" />
          <path d={line} fill="none" stroke={t.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dasharray" from="0 2000" to="2000 0" dur="1.2s" fill="freeze" />
          </path>
          {pts.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={hoverIdx === i ? "6" : "4"} fill={t.card} stroke={t.green} strokeWidth={hoverIdx === i ? "3" : "2.5"} style={{ transition: "all 0.2s" }} />
              <text x={p.x} y={H + 16} textAnchor="middle" fill={hoverIdx === i ? t.text : t.textSec} fontSize="10" fontWeight="600" fontFamily="Oswald">{monthlyData[i].month}</text>
              {hoverIdx === i && (
                <g>
                  <rect x={Math.min(Math.max(p.x - 42, 4), W - 88)} y={p.y - 44} width="84" height="34" rx="6" fill={t.text} />
                  <text x={Math.min(Math.max(p.x, 46), W - 46)} y={p.y - 28} textAnchor="middle" fill={t.bg} fontSize="9" fontWeight="600" fontFamily="Oswald">{monthlyData[i].month.toUpperCase()} {monthlyData[i].year}</text>
                  <text x={Math.min(Math.max(p.x, 46), W - 46)} y={p.y - 14} textAnchor="middle" fill={t.bg} fontSize="11" fontWeight="900" fontFamily="Oswald">{fmt(monthlyData[i].balance)}</text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
      {/* Mini Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
        {[
          { label: "Highest Balance", value: fmt(highestMonth.balance), sub: `${highestMonth.month} ${highestMonth.year}`, color: t.green, icon: Icons.trendUp(t.green) },
          { label: "Lowest Balance", value: fmt(lowestMonth.balance), sub: `${lowestMonth.month} ${lowestMonth.year}`, color: t.orange, icon: Icons.trendDown(t.orange) },
          { label: "Average Balance", value: fmt(avgBalance), sub: `Last ${monthlyData.length} Months`, color: t.text, icon: Icons.wallet(t.text) },
        ].map((s, i) => (
          <div key={i} style={{
            background: isBoxless ? t.cardAlt || t.surface : t.surface,
            borderRadius: 14,
            padding: isBoxless ? "12px 12px" : "10px 12px",
            borderStyle: "solid",
            borderColor: t.border,
            borderWidth: "0 1px 1px 1px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: s.color + '22', color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>{s.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: t.textMuted }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpendingDonut({ txns, t, fmt, CAT_COLORS, isMobile, variant = "default" }) {
  const [hoverCat, setHoverCat] = useState(null);
  const isBoxless = variant === "boxless";
  const data = useMemo(() => {
    const map = {};
    txns.filter(tx => tx.type === "expense").forEach(tx => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([cat, val]) => ({ cat, val }));
  }, [txns]);

  if (!data.length) return <EmptyState t={t} msg="No spending data" />;

  const total = data.reduce((s, d) => s + d.val, 0);
  const R = 70, r = 45, cx = 90, cy = 90;
  let cumAngle = -90;
  const maxCat = data[0];
  const avgPerCat = Math.round(total / data.length);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, flexWrap: "wrap", justifyContent: "center", flex: 1, flexDirection: isMobile ? "column" : "row" }}>
        <svg width={isMobile ? "144" : "160"} height={isMobile ? "144" : "160"} viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
          {data.map((d, i) => {
            const angle = (d.val / total) * 360;
            const startAngle = cumAngle;
            cumAngle += angle;
            const endAngle = cumAngle;
            const largeArc = angle > 180 ? 1 : 0;
            const toRad = (a) => (a * Math.PI) / 180;
            const x1o = cx + R * Math.cos(toRad(startAngle)), y1o = cy + R * Math.sin(toRad(startAngle));
            const x2o = cx + R * Math.cos(toRad(endAngle)), y2o = cy + R * Math.sin(toRad(endAngle));
            const x1i = cx + r * Math.cos(toRad(endAngle)), y1i = cy + r * Math.sin(toRad(endAngle));
            const x2i = cx + r * Math.cos(toRad(startAngle)), y2i = cy + r * Math.sin(toRad(startAngle));
            const path = `M${x1o},${y1o} A${R},${R} 0 ${largeArc},1 ${x2o},${y2o} L${x1i},${y1i} A${r},${r} 0 ${largeArc},0 ${x2i},${y2i} Z`;
            return <path key={i} d={path} fill={CAT_COLORS[d.cat] || t.textMuted} stroke={t.card} strokeWidth="2"
              onMouseEnter={() => setHoverCat(d.cat)} onMouseLeave={() => setHoverCat(null)}
              style={{ opacity: hoverCat && hoverCat !== d.cat ? 0.3 : 1, cursor: "pointer", transition: "opacity 0.25s", transformOrigin: "90px 90px", transform: hoverCat === d.cat ? "scale(1.04)" : "scale(1)" }}>
              <animate attributeName="fill-opacity" from="0" to="1" dur="0.6s" begin={`${i * 0.08}s`} fill="freeze" />
            </path>;
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fill={t.text} fontSize="14" fontWeight="900" fontFamily="Oswald">{fmt(total)}</text>
          <text x={cx} y={cy + 11} textAnchor="middle" fill={t.textSec} fontSize="8" fontWeight="700" fontFamily="Oswald" letterSpacing="0.5">TOTAL SPENT</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: isMobile ? 0 : 200, width: "100%", overflow: "hidden" }}>
          {data.slice(0, 6).map((d, i) => (
            <div key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: isBoxless ? "10px 12px" : "3px 6px", borderRadius: 12, opacity: hoverCat && hoverCat !== d.cat ? 0.35 : 1, transition: "all 0.2s", cursor: "pointer", backgroundColor: hoverCat === d.cat ? (CAT_COLORS[d.cat] || t.textMuted) + '18' : isBoxless ? (t.cardAlt || t.surface) : 'transparent', width: "100%", borderBottom: "none", border: isBoxless ? `1px solid ${hoverCat === d.cat ? (CAT_COLORS[d.cat] || t.border) + "33" : t.border}` : "none" }}
              onMouseEnter={() => setHoverCat(d.cat)} onMouseLeave={() => setHoverCat(null)}>
              <span style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: (CAT_COLORS[d.cat] || t.textMuted) + '22', display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: CAT_COLORS[d.cat] || t.textMuted }} />
              </span>
              <span style={{ flex: 1, color: t.textSec, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.cat}</span>
              <span style={{ color: t.textMuted, fontSize: 11, fontVariantNumeric: "tabular-nums", marginRight: 4, flexShrink: 0 }}>{fmt(Math.round(d.val))}</span>
              <span style={{ fontWeight: 800, color: t.text, fontVariantNumeric: "tabular-nums", minWidth: 28, textAlign: "right", flexShrink: 0 }}>{Math.round((d.val / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Category Mini Stats */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
        {[
          { label: "Categories", value: data.length, sub: "Tracked", color: t.text, icon: Icons.box(t.text) },
          { label: "Avg / Category", value: fmt(avgPerCat), sub: "Per category", color: t.green, icon: Icons.chart(t.green) },
          { label: "Top Category", value: `${Math.round((maxCat.val / total) * 100)}%`, sub: maxCat.cat, color: CAT_COLORS[maxCat.cat] || t.orange, icon: Icons.diamond(CAT_COLORS[maxCat.cat] || t.orange) },
        ].map((s, i) => (
          <div key={i} style={{
            background: isBoxless ? t.cardAlt || t.surface : t.surface,
            borderRadius: 14,
            padding: isBoxless ? "12px 12px" : "10px 12px",
            borderStyle: "solid",
            borderColor: t.border,
            borderWidth: "0 1px 1px 1px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{s.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: t.textMuted }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ t, msg }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 12 }}>
      {Icons.empty(t.textMuted)}
      <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>{msg}</span>
    </div>
  );
}

function StatusMarquee({ txns, userSettings, t, fmt, isMobile }) {
  const items = useMemo(() => {
    if (!txns.length) return ["No live transaction data available yet."];

    const latestTxn = [...txns].sort((a, b) => b.date.localeCompare(a.date))[0];
    const latestMonthKey = latestTxn.date.slice(0, 7);
    const [yearStr, monthStr] = latestMonthKey.split("-");
    const monthIndex = Number(monthStr) - 1;
    const yearNum = Number(yearStr);
    const monthLabel = new Date(`${latestMonthKey}-01T00:00:00`).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    const monthDays = new Date(yearNum, monthIndex + 1, 0).getDate();
    const monthTxns = txns.filter((tx) => tx.date.startsWith(latestMonthKey));
    const expenseTxns = monthTxns.filter((tx) => tx.type === "expense");
    const incomeTxns = monthTxns.filter((tx) => tx.type === "income");
    const spent = expenseTxns.reduce((sum, tx) => sum + tx.amount, 0);
    const earned = incomeTxns.reduce((sum, tx) => sum + tx.amount, 0);
    const latestDay = Math.max(1, ...monthTxns.map((tx) => Number(tx.date.slice(8, 10))));
    const dailyBurn = spent / latestDay;
    const projectedMonthSpend = dailyBurn * monthDays;
    const netFlow = earned - spent;

    const categoryTotals = {};
    expenseTxns.forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });
    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    let paceMessage = `${monthLabel} spend is trending at ${fmt(Math.round(projectedMonthSpend || spent))} for the month.`;
    if (userSettings.budget > 0) {
      if (spent >= userSettings.budget) {
        paceMessage = `${monthLabel} budget already exceeded by ${fmt(Math.round(spent - userSettings.budget))}.`;
      } else if (dailyBurn > 0 && projectedMonthSpend >= userSettings.budget) {
        const daysUntilLimit = Math.max(0, Math.ceil((userSettings.budget - spent) / dailyBurn));
        const projectedHitDate = new Date(yearNum, monthIndex, Math.min(latestDay + daysUntilLimit, monthDays));
        paceMessage = `At the current pace, budget limit may be reached by ${projectedHitDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}.`;
      } else {
        paceMessage = `At the current pace, about ${fmt(Math.round(Math.max(userSettings.budget - projectedMonthSpend, 0)))} should remain from budget by month-end.`;
      }
    }

    return [
      paceMessage,
      `${monthLabel} daily burn is averaging ${fmt(Math.round(dailyBurn || spent))} per day.`,
      topCategoryEntry
        ? `Top spend category this month is ${topCategoryEntry[0]} at ${fmt(Math.round(topCategoryEntry[1]))}.`
        : `No expense categories tracked yet for ${monthLabel}.`,
      `${monthLabel} net flow is ${netFlow >= 0 ? "+" : "-"}${fmt(Math.round(Math.abs(netFlow)))}, with ${fmt(Math.round(earned))} income tracked.`,
    ];
  }, [fmt, txns, userSettings.budget]);

  const loopItems = [...items, ...items];
  const durationSeconds = Math.max(isMobile ? 28 : 34, items.length * (isMobile ? 8 : 10));

  return (
    <div
      className="status-marquee"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 0,
        borderTop: `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
        borderLeft: "none",
        borderRight: "none",
        background: `linear-gradient(90deg, ${t.green}12 0%, ${t.cardAlt || t.surface} 28%, ${t.orange}10 100%)`,
        boxShadow: `0 14px 32px ${t.green}0d`,
        marginLeft: isMobile ? -14 : -40,
        marginRight: isMobile ? -14 : -40,
        marginBottom: isMobile ? 18 : 24,
      }}
    >
      <div
        className="status-marquee-track"
        style={{
          display: "flex",
          width: "max-content",
          gap: isMobile ? 10 : 14,
          padding: isMobile ? "10px 0" : "12px 0",
          animation: `statusMarquee ${durationSeconds}s linear infinite`,
        }}
      >
        {loopItems.map((item, idx) => (
          <div
            key={`${item}-${idx}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: isMobile ? "0 12px" : "0 16px",
              whiteSpace: "nowrap",
              color: t.text,
              fontSize: isMobile ? 12 : 13,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: idx % 2 === 0 ? t.green : t.orange,
                boxShadow: `0 0 0 4px ${(idx % 2 === 0 ? t.green : t.orange)}22`,
                flexShrink: 0,
              }}
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RolePinModal({ t, isMobile, onClose, onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const demoPin = "2026";

  const submit = () => {
    if (pin === demoPin) {
      onUnlock();
      setPin("");
      setError("");
      return;
    }
    setError("Incorrect PIN. Use the demo PIN shown below.");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: isMobile ? 18 : 20,
          boxShadow: t.shadow,
          padding: isMobile ? 20 : 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 8px", color: t.text, fontSize: 20, fontWeight: 800 }}>Admin PIN Required</h3>
        <p style={{ margin: "0 0 16px", color: t.textMuted, fontSize: 13, lineHeight: 1.5 }}>
          Enter the demo PIN to unlock admin actions for this frontend role switch.
        </p>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: t.textMuted, marginBottom: 8 }}>
            PIN
          </div>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Enter PIN"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${error ? t.red : t.border}`,
              backgroundColor: t.inputBg,
              color: t.text,
              outline: "none",
              fontSize: 15,
              fontWeight: 600,
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: error ? t.red : t.textMuted, marginBottom: 16 }}>
          {error || "Demo PIN: 2026"}
        </div>
        <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column-reverse" : "row" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 12,
              border: `1px solid ${t.border}`,
              backgroundColor: "transparent",
              color: t.textSec,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
              color: "#080808",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Unlock Admin
          </button>
        </div>
      </div>
    </div>
  );
}

function AddModal({ onAdd, onClose, t, editTxn, currencySymbol, isMobile }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(editTxn || { description: "", amount: "", category: EXPENSE_CATS[0], type: "expense", date: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState("");
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const cats = form.type === "income" ? INCOME_CATS : EXPENSE_CATS;

  useEffect(() => {
    if (!cats.includes(form.category)) upd("category", cats[0]);
  }, [form.type]);

  useEffect(() => {
    if (Number(form.amount) < 0) upd("amount", "0");
    if (form.date > today) upd("date", today);
  }, [form.amount, form.date, today]);

  const submit = () => {
    const parsedAmount = Number(form.amount);
    if (!form.description || form.amount === "" || !form.date) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError("Amount cannot be negative.");
      return;
    }
    if (form.date > today) {
      setError("Future dates are not allowed.");
      return;
    }
    onAdd({ ...form, amount: parsedAmount, id: editTxn?.id || `t-new-${Date.now()}` });
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`,
    backgroundColor: t.inputBg, color: t.text, fontSize: 13, fontFamily: "Oswald",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: t.textSec, marginBottom: 6, display: "block" };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: t.card, borderRadius: isMobile ? 18 : 20, padding: isMobile ? 20 : 28, width: "100%", maxWidth: 420,
        maxHeight: isMobile ? "calc(100vh - 32px)" : "none", overflowY: isMobile ? "auto" : "visible",
        border: `1px solid ${t.border}`, boxShadow: t.shadow,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>{editTxn ? "Edit" : "Add"} Transaction</h3>
          <div onClick={onClose} style={{ cursor: "pointer", color: t.textMuted }}>{Icons.x}</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["expense", "income"].map(tp => (
            <button key={tp} onClick={() => upd("type", tp)} style={{
              flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${form.type === tp ? (tp === "income" ? t.green : t.orange) : t.border}`,
              backgroundColor: form.type === tp ? (tp === "income" ? t.greenSoft : t.orangeSoft) : "transparent",
              color: form.type === tp ? (tp === "income" ? t.green : t.orange) : t.textSec,
              fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase", fontFamily: "Oswald", letterSpacing: "0.5px",
            }}>{tp}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={labelStyle}>Description</label><input style={inputStyle} value={form.description} onChange={e => { upd("description", e.target.value); if (error) setError(""); }} placeholder="e.g. Swiggy Order" /></div>
          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Amount ({currencySymbol})</label><input style={inputStyle} type="number" min="0" step="0.01" value={form.amount} onChange={e => { upd("amount", e.target.value === "" ? "" : String(Math.max(0, Number(e.target.value)))); if (error) setError(""); }} placeholder="0" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Date</label><input style={inputStyle} type="date" max={today} value={form.date} onChange={e => { upd("date", e.target.value > today ? today : e.target.value); if (error) setError(""); }} /></div>
          </div>
          <div><label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, appearance: "auto" }} value={form.category} onChange={e => { upd("category", e.target.value); if (error) setError(""); }}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <div style={{ marginTop: 12, fontSize: 12, color: t.red, fontWeight: 600 }}>{error}</div>}

        <button onClick={submit} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none", marginTop: 24,
          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
          color: "#080808", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "Oswald",
          textTransform: "uppercase", letterSpacing: "1px",
        }}>{editTxn ? "Update" : "Add"} Transaction</button>
      </div>
    </div>
  );
}

function InsightsSection({ txns, t, fmt, isMobile, variant = "default" }) {
  const isBoxless = variant === "boxless";
  const insights = useMemo(() => {
    const expenses = txns.filter(tx => tx.type === "expense");
    const incomes = txns.filter(tx => tx.type === "income");
    if (!expenses.length) return [];

    const catTotals = {};
    expenses.forEach(tx => { catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount; });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    const monthMap = {};
    txns.forEach(tx => {
      const key = tx.date.slice(0, 7);
      if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
      if (tx.type === "income") monthMap[key].income += tx.amount;
      else monthMap[key].expense += tx.amount;
    });
    const months = Object.keys(monthMap).sort();
    const latest = months[months.length - 1];
    const prev = months.length > 1 ? months[months.length - 2] : null;

    const result = [];
    if (topCat) result.push({ title: "Highest Spending", value: topCat[0], sub: `${fmt(Math.round(topCat[1]))} total`, color: "#F030E4", icon: Icons.chart("#F030E4") });

    if (prev && latest) {
      const diff = monthMap[latest].expense - monthMap[prev].expense;
      const pct = monthMap[prev].expense ? Math.round((diff / monthMap[prev].expense) * 100) : 0;
      result.push({
        title: "Monthly Change", value: `${pct > 0 ? "+" : ""}${pct}%`,
        sub: "vs previous month", color: pct > 0 ? t.red : t.green,
        icon: pct > 0 ? Icons.trendUp(t.red) : Icons.trendDown(t.green),
      });
    }

    const totalIncome = incomes.reduce((s, tx) => s + tx.amount, 0);
    const totalExpense = expenses.reduce((s, tx) => s + tx.amount, 0);
    const savingsRate = totalIncome ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
    result.push({ title: "Savings Rate", value: `${savingsRate}%`, sub: "of total income saved", color: savingsRate > 20 ? t.green : t.orange, icon: Icons.wallet(savingsRate > 20 ? t.green : t.orange) });

    const avgTxn = Math.round(totalExpense / expenses.length);
    result.push({ title: "Avg. Transaction", value: fmt(avgTxn), sub: `across ${expenses.length} expenses`, color: t.text, icon: Icons.list(t.text) });

    return result;
  }, [txns, t]);

  if (!insights.length) return null;

  return (
    <div style={{ padding: "0" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 160 : 200}px, 1fr))`, gap: isMobile ? 12 : 16 }}>
        {insights.map((ins, i) => (
          <div key={ins.title} style={{
            background: isBoxless
              ? `linear-gradient(180deg, ${ins.color}12 0%, ${t.cardAlt || t.surface} 100%)`
              : t.cardAlt,
            borderRadius: 18, padding: isMobile ? "16px" : "20px", display: "flex", flexDirection: "column",
            border: `1px solid ${t.border}`, outline: `1px solid transparent`,
            boxShadow: isBoxless ? `0 12px 28px ${ins.color}10` : `0 2px 10px rgba(0,0,0,0.02)`,
            opacity: 0, animation: `fadeSlideIn 0.4s ${i * 0.1}s forwards`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyItems: "center" }}>
                {ins.icon}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: t.textMuted }}>{ins.title}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: ins.color, letterSpacing: "-0.5px" }}>{ins.value}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, fontWeight: 500 }}>{ins.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportModal({ onClose, onExport, t, isMobile }) {
  const [format, setFormat] = useState("csv");

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: t.card, borderRadius: isMobile ? 18 : 20, padding: isMobile ? 20 : 28, width: "100%", maxWidth: 360,
        border: `1px solid ${t.border}`, boxShadow: t.shadow,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 20, fontFamily: "Oswald" }}>
          {Icons.download(t.text)} Select Export Format
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            { id: "csv", label: "CSV Document (.csv)" },
            { id: "json", label: "JSON Data (.json)" },
            { id: "pdf", label: "Print / Save as PDF" }
          ].map(f => (
            <label key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: t.text, fontSize: 14, padding: "12px 14px", border: `1px solid ${format === f.id ? t.green : t.border}`, borderRadius: 12, backgroundColor: format === f.id ? t.green + "11" : "transparent", transition: "all 0.2s" }}>
              <input type="radio" name="format" value={f.id} checked={format === f.id} onChange={() => setFormat(f.id)} style={{ accentColor: t.green, width: 16, height: 16, cursor: "pointer" }} />
              <span style={{ fontWeight: 600 }}>{f.label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column-reverse" : "row" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${t.border}`, backgroundColor: "transparent", color: t.textSec, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Oswald", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = t.text} onMouseLeave={e => e.currentTarget.style.color = t.textSec}>Cancel</button>
          <button onClick={() => onExport(format)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`, color: "#080808", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Oswald" }}>Export</button>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════
   SETTINGS DROPDOWN (Radix UI — portal-based, fixes mobile positioning)
   ══════════════════════════════════════════ */
function SettingsDropdown({ value, onChange, options, t }) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find(o => o.value === value)?.label || value;

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 14px", borderRadius: 10,
          border: `1px solid ${open ? t.green : t.border}`,
          backgroundColor: t.inputBg, color: t.text,
          fontFamily: "Oswald", fontSize: 14, fontWeight: 600,
          cursor: "pointer", outline: "none", transition: "border-color 0.2s",
          minWidth: 180,
        }}>
          <span style={{ flex: 1, textAlign: "left" }}>{currentLabel}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.5, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={6}
          align="end"
          style={{
            minWidth: 200, backgroundColor: t.card, borderRadius: 12,
            border: `1px solid ${t.border}`, padding: "6px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            zIndex: 9999, outline: "none",
            animation: "fadeSlideIn 0.15s ease",
          }}
        >
          {options.map(opt => (
            <DropdownMenuPrimitive.Item
              key={opt.value}
              onSelect={() => onChange(opt.value)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                fontFamily: "Oswald", fontSize: 14, fontWeight: value === opt.value ? 700 : 500,
                color: value === opt.value ? t.green : t.text,
                backgroundColor: value === opt.value ? t.greenSoft : "transparent",
                outline: "none", transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.backgroundColor = t.hover; }}
              onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {value === opt.value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M2 6l3 3 5-5" stroke={t.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {value !== opt.value && <span style={{ width: 12, flexShrink: 0 }} />}
              {opt.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}


const SettingsView = ({ userSettings, setUserSettings, t, Icons, txns, setTxns, isMobile }) => {
  const [activeCat, setActiveCat] = useState('general');

  const updateSetting = (key, val) => {
    setUserSettings(prev => ({ ...prev, [key]: val }));
  };

  const cats = [
    { id: 'general', label: 'General', icon: Icons.sliders },
    { id: 'security', label: 'Security', icon: Icons.user },
    { id: 'display', label: 'Display', icon: Icons.lightbulb },
    { id: 'data', label: 'Data', icon: Icons.box },
  ];

  const handleReset = () => {
    if (confirm("Are you sure? This will delete all transaction history and reset to factory defaults.")) {
      setTxns([]);
      localStorage.removeItem("rayan_fint_settings");
      alert("System Reset Complete. Refreshing...");
      window.location.reload();
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(txns, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `rayan_fintech_export_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const sectionLabel = (txt) => (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: t.textMuted, marginBottom: isMobile ? 10 : 12, marginTop: isMobile ? 18 : 24 }}>{txt}</div>
  );

  const settingRow = (label, desc, action) => (
    <div style={{ display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 0, padding: isMobile ? "12px 0" : "16px 0", borderBottom: `1px solid ${t.border}` }}>
      <div style={{ paddingRight: isMobile ? 0 : 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{label}</div>
        <div style={{ fontSize: isMobile ? 11 : 12, color: t.textMuted, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ flexShrink: 0, width: isMobile ? "100%" : "auto" }}>{action}</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease", display: "flex", gap: isMobile ? 12 : 32, flexDirection: isMobile ? 'column' : 'row', alignItems: "flex-start" }}>
      {/* Settings Navigation */}
      <div style={{ width: isMobile ? '100%' : 220, display: "flex", flexDirection: isMobile ? 'row' : 'column', gap: 4, overflowX: isMobile ? 'auto' : 'hidden', paddingBottom: isMobile ? 6 : 0 }}>
        {cats.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            style={{
              display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, padding: isMobile ? "10px 12px" : "12px 16px", borderRadius: 12, border: "none",
              backgroundColor: activeCat === c.id ? t.greenSoft : "transparent",
              color: activeCat === c.id ? t.green : t.textSec,
              cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              fontSize: isMobile ? 13 : 14, fontWeight: activeCat === c.id ? 700 : 500, fontFamily: "Oswald",
              flexShrink: 0
            }}
          >
            {c.icon(activeCat === c.id ? t.green : t.textSec)}
            {c.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div style={{ flex: isMobile ? "1 1 auto" : "0 1 860px", maxWidth: isMobile ? "100%" : 860, width: "100%", backgroundColor: t.card, borderRadius: isMobile ? 16 : 20, border: `1px solid ${t.border}`, padding: isMobile ? 14 : 28, overflowY: "visible", boxShadow: t.shadow }}>
        <h2 style={{ fontFamily: "Oswald", fontSize: isMobile ? 18 : 24, fontWeight: 700, margin: "0 0 6px 0", color: t.text }}>{cats.find(c => c.id === activeCat).label} Settings</h2>
        <p style={{ fontSize: isMobile ? 12 : 13, color: t.textMuted, margin: 0 }}>Manage your preferences and system configuration.</p>

        {activeCat === 'general' && (
          <div>
            {sectionLabel("Financial Core")}
            {settingRow("Base Currency", "Select your primary reporting currency", (
              <SettingsDropdown
                value={userSettings.currency}
                onChange={val => updateSetting('currency', val)}
                t={t}
                options={[
                  { value: "INR", label: "₹ Indian Rupee (INR)" },
                  { value: "USD", label: "$ US Dollar (USD)" },
                  { value: "EUR", label: "€ Euro (EUR)" },
                ]}
              />
            ))}
            {settingRow("Monthly Budget", "Set a global spending limit for alerts", (
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: isMobile ? "100%" : "auto" }}>
                <span style={{ color: t.textMuted, fontSize: 14 }}>{userSettings.currency === 'INR' ? '₹' : userSettings.currency === 'USD' ? '$' : '€'}</span>
                <input
                  type="number"
                  value={userSettings.budget === 0 ? "" : userSettings.budget}
                  placeholder="0"
                  onChange={e => updateSetting('budget', e.target.value === "" ? 0 : Number(e.target.value))}
                  style={{ width: isMobile ? "100%" : 100, padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, backgroundColor: t.inputBg, color: t.text, fontFamily: "Oswald", outline: "none" }}
                />
              </div>
            ))}
            {settingRow("Fiscal Year Start", "Reporting period beginning month", (
              <SettingsDropdown
                value={userSettings.fiscalStart}
                onChange={val => updateSetting('fiscalStart', val)}
                t={t}
                options={[
                  { value: "April", label: "April (Standard)" },
                  { value: "January", label: "January (Calendar)" },
                ]}
              />
            ))}
          </div>
        )}

        {activeCat === 'security' && (
          <div>
            {sectionLabel("Identity & Access")}
            {settingRow("Full Name", "Used in reports and exports", (
              <input value={userSettings.name} onChange={e => updateSetting('name', e.target.value)} style={{ width: isMobile ? "100%" : "auto", padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, backgroundColor: t.inputBg, color: t.text, fontFamily: "Oswald", outline: "none" }} />
            ))}
            {settingRow("Job Title", "Displayed on your system profile", (
              <input value={userSettings.jobTitle} onChange={e => updateSetting('jobTitle', e.target.value)} style={{ width: isMobile ? "100%" : "auto", padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, backgroundColor: t.inputBg, color: t.text, fontFamily: "Oswald", outline: "none" }} />
            ))}
            {settingRow("Two-Factor Authentication", "Add an extra layer of security", (
              <button
                onClick={() => updateSetting('enable2FA', !userSettings.enable2FA)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  backgroundColor: userSettings.enable2FA ? t.green : t.border,
                  position: "relative", transition: "all 0.3s"
                }}
              >
                <div style={{
                  position: "absolute", top: 4, left: userSettings.enable2FA ? 24 : 4,
                  width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "all 0.3s"
                }} />
              </button>
            ))}
          </div>
        )}

        {activeCat === 'display' && (
          <div>
            {sectionLabel("Visual Aesthetic")}
            {settingRow("Chart Palette", "Premium color themes for data visualization", (
              <SettingsDropdown
                value={userSettings.palette}
                onChange={val => updateSetting('palette', val)}
                t={t}
                options={[
                  { value: "Emerald", label: "Classic Emerald" },
                  { value: "Gold", label: "Royal Gold" },
                  { value: "Indigo", label: "Midnight Indigo" },
                ]}
              />
            ))}
            {settingRow("Welcome Animation", "Play brand reveal on initial load", (
              <button
                onClick={() => updateSetting('showWelcome', !userSettings.showWelcome)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  backgroundColor: userSettings.showWelcome ? t.green : t.border,
                  position: "relative", transition: "all 0.3s"
                }}
              >
                <div style={{
                  position: "absolute", top: 4, left: userSettings.showWelcome ? 24 : 4,
                  width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "all 0.3s"
                }} />
              </button>
            ))}
            {settingRow("Compact Table View", "Reduce padding for dense data display", (
              <button
                onClick={() => updateSetting('compactView', !userSettings.compactView)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  backgroundColor: userSettings.compactView ? t.green : t.border,
                  position: "relative", transition: "all 0.3s"
                }}
              >
                <div style={{
                  position: "absolute", top: 4, left: userSettings.compactView ? 24 : 4,
                  width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "all 0.3s"
                }} />
              </button>
            ))}
          </div>
        )}

        {activeCat === 'data' && (
          <div>
            {sectionLabel("System Management")}
            {settingRow("Export All Data", "Download complete history as JSON", (
              <button onClick={handleExportJSON} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.green}`, backgroundColor: "transparent", color: t.green, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Oswald" }}>Export JSON</button>
            ))}
            {settingRow("Master Reset", "Wipe all transactions and local state", (
              <button onClick={handleReset} style={{ padding: "8px 16px", borderRadius: 10, border: "none", backgroundColor: "#ff4d4f", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Oswald" }}>Factory Reset</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════ */
export default function FinanceDashboard() {
  const mainContentRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);
  const [role, setRole] = useState("admin");
  const [txns, setTxns] = useState(INITIAL_TXNS);
  const [activeTab, setActiveTab] = useState(() =>
    typeof window !== "undefined" ? getTabFromPath(window.location.pathname) : "overview"
  );
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showModal, setShowModal] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showRolePinModal, setShowRolePinModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  // --- AUDIT LOG --- (Mock system activity)
  const [auditLogs] = useState([
    { id: 1, action: "System Initialized", time: "2 mins ago", user: "System" },
    { id: 2, action: "Manual Export Triggered", time: "1 hour ago", user: "Admin" },
    { id: 3, action: "Theme Preference Updated", time: "2 hours ago", user: "Admin" },
  ]);

  // --- SETTINGS STATE ---
  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem("rayan_fint_settings");
    return saved ? JSON.parse(saved) : {
      currency: 'INR',
      budget: 85000,
      fiscalStart: 'April',
      enable2FA: false,
      name: 'Bogdan Nikitin',
      jobTitle: 'System Administrator',
      palette: 'Emerald',
      animationSpeed: 1,
      showWelcome: true,
      compactView: false,
      highSpendAlert: 50000,
      balanceWarning: 10000
    };
  });

  useEffect(() => {
    localStorage.setItem("rayan_fint_settings", JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- DYNAMIC FORMATTING ---
  const fmt = (n) => {
    const configs = {
      INR: { locale: 'en-IN', symbol: '₹' },
      USD: { locale: 'en-US', symbol: '$' },
      EUR: { locale: 'de-DE', symbol: '€' }
    };
    const c = configs[userSettings.currency] || configs.INR;
    return c.symbol + n.toLocaleString(c.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const fmtDateInternal = (d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const CAT_COLORS = {
    Emerald: {
      "Food & Dining": "#f5a623", "Transport": "#4fc3f7", "Shopping": "#e040fb",
      "Entertainment": "#ff7043", "Bills & Utilities": "#78909c",
      "Healthcare": "#ef5350", "Education": "#66bb6a", "Others": "#9e9e9e",
      "Salary": "#7ed957", "Freelance": "#c8ff00", "Investments": "#ffd740",
    },
    Gold: {
      "Food & Dining": "#D4AF37", "Transport": "#C5B358", "Shopping": "#CFB53B",
      "Entertainment": "#B8860B", "Bills & Utilities": "#996515",
      "Healthcare": "#8B4513", "Education": "#A0522D", "Others": "#8d8070",
      "Salary": "#FFD700", "Freelance": "#EEE8AA", "Investments": "#FAFAD2",
    },
    Indigo: {
      "Food & Dining": "#4B0082", "Transport": "#483D8B", "Shopping": "#6A5ACD",
      "Entertainment": "#7B68EE", "Bills & Utilities": "#8470FF",
      "Healthcare": "#000080", "Education": "#00008B", "Others": "#6b7280",
      "Salary": "#4682B4", "Freelance": "#5F9EA0", "Investments": "#B0C4DE",
    }
  }[userSettings.palette] || {
    "Food & Dining": "#f5a623", "Transport": "#4fc3f7", "Shopping": "#e040fb",
    "Entertainment": "#ff7043", "Bills & Utilities": "#78909c",
    "Healthcare": "#ef5350", "Education": "#66bb6a", "Others": "#9e9e9e",
    "Salary": "#7ed957", "Freelance": "#c8ff00", "Investments": "#ffd740",
  };

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  const navigateToTab = useCallback((tab, options = {}) => {
    const { replace = false } = options;
    const nextTab = TAB_ROUTES[tab] ? tab : "overview";
    const nextPath = TAB_ROUTES[nextTab];

    setActiveTab(nextTab);

    if (typeof window === "undefined") return;
    if (normalizePath(window.location.pathname) === nextPath) return;

    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ tab: nextTab }, "", nextPath);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const normalizedPath = normalizePath(window.location.pathname);
    const expectedPath = TAB_ROUTES[activeTab] || "/";

    if (normalizedPath !== expectedPath) {
      window.history.replaceState({ tab: activeTab }, "", expectedPath);
    }
  }, [activeTab]);

  const t = isDark ? DARK : LIGHT;
  const isAdmin = role === "admin";

  const handleRoleToggle = useCallback(() => {
    if (role === "admin") {
      setRole("viewer");
      return;
    }
    setShowRolePinModal(true);
  }, [role]);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const totals = useMemo(() => {
    const income = txns.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
    const expense = txns.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
    return { income, expense, balance: income - expense + 50000 };
  }, [txns]);

  const filteredTxns = useMemo(() => {
    let list = [...txns];
    if (search) list = list.filter(tx => tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase()));
    if (filterCat !== "All") list = list.filter(tx => tx.category === filterCat);
    if (filterType !== "All") list = list.filter(tx => tx.type === filterType);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = a.category.localeCompare(b.category);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [txns, search, filterCat, filterType, sortKey, sortDir]);

  const addOrUpdateTxn = useCallback((txn) => {
    setTxns(prev => {
      const idx = prev.findIndex(t => t.id === txn.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = txn; return next.sort((a, b) => b.date.localeCompare(a.date)); }
      return [txn, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
  }, []);

  const handleExport = (format) => {
    if (format === "csv") {
      const header = "Date,Description,Category,Type,Amount\n";
      const rows = filteredTxns.map(tx => `${tx.date},"${tx.description}",${tx.category},${tx.type},${tx.amount}`).join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transactions.csv"; a.click();
      setShowExportModal(false);
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify(filteredTxns, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transactions.json"; a.click();
      setShowExportModal(false);
    } else if (format === "pdf") {
      setShowExportModal(false);
      setTimeout(() => {
        if (!window.jspdf) {
          console.error("jsPDF not loaded");
          window.print();
          return;
        }

        const pdfFmt = (n) => "Rs. " + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("Financial Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

        doc.text(`Total Balance: ${pdfFmt(Math.round(totals.balance))}`, 14, 40);
        doc.text(`Total Income: ${pdfFmt(Math.round(totals.income))}`, 14, 46);
        doc.text(`Total Expenses: ${pdfFmt(Math.round(totals.expense))}`, 14, 52);

        const tableColumn = ["Date", "Description", "Category", "Amount"];
        const tableRows = [];

        filteredTxns.forEach(tx => {
          const txData = [
            fmtDate(tx.date),
            tx.description,
            tx.category,
            (tx.type === "income" ? "+" : "-") + pdfFmt(Math.round(tx.amount))
          ];
          tableRows.push(txData);
        });

        doc.autoTable({
          startY: 60,
          head: [tableColumn],
          body: tableRows,
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
          didParseCell: function (data) {
            if (data.section === 'body' && data.column.index === 3) {
              if (data.cell.raw.startsWith('+')) {
                data.cell.styles.textColor = [74, 158, 47]; // Green
              } else if (data.cell.raw.startsWith('-')) {
                data.cell.styles.textColor = [214, 48, 49]; // Red
              }
            }
          }
        });

        doc.save(`Financial_Report_${activeTab}.pdf`);
      }, 100);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Icons.chart(activeTab === "overview" ? t.green : t.textSec) },
    { id: "transactions", label: "Transactions", icon: Icons.list(activeTab === "transactions" ? t.green : t.textSec) },
    { id: "insights", label: "Insights", icon: Icons.lightbulb(activeTab === "insights" ? t.green : t.textSec) },
    { id: "settings", label: "Settings", icon: Icons.settings(activeTab === "settings" ? t.green : t.textSec) },
  ];

  const deleteTxn = (id) => setTxns(prev => prev.filter(t => t.id !== id));

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const pillBtn = (active, label, onClick, key) => (
    <button key={key} onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 20, border: `1px solid ${active ? t.green : t.border}`,
      backgroundColor: active ? t.greenSoft : "transparent", color: active ? t.green : t.textSec,
      fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "Oswald",
      whiteSpace: "nowrap", transition: "all 0.2s",
    }}>{label}</button>
  );

  const cardWrap = (children, style = {}) => (
    <div style={{
      backgroundColor: t.card, borderRadius: 16, border: `1px solid ${t.border}`,
      padding: isMobile ? "16px" : "20px 22px", boxShadow: t.shadow, ...style,
    }}>{children}</div>
  );

  const overviewBand = (children, accent, style = {}) => (
    <div style={{
      padding: isMobile ? "18px 18px 16px" : "24px 24px 20px",
      background: `linear-gradient(180deg, ${accent}${isDark ? "08" : "0f"} 0%, ${t.cardAlt || t.card} 82%)`,
      border: `1px solid ${t.border}`,
      borderRadius: 24,
      boxShadow: `0 16px 40px ${accent}10`,
      ...style,
    }}>{children}</div>
  );

  const sectionTitle = (text) => (
    <div className="section-heading" style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: t.text }}>
      {text}
      <span style={{ flex: 1, height: 1, backgroundColor: t.border }} />
    </div>
  );

  return (
    <div style={{
      backgroundColor: t.bg, minHeight: "100vh", display: "flex", fontFamily: "'Instrument Sans', sans-serif", opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes statusMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        * { box-sizing: border-box; margin: 0; }
        body, body *, button, input, select, textarea, svg text {
          font-family: 'Instrument Sans', sans-serif !important;
        }
        h1, h2, h3, .section-heading {
          font-family: 'Oswald', sans-serif !important;
        }
        input:focus, select:focus { border-color: ${t.green} !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 4px; }
        .sidebar-nav-item { transition: background 0.18s, color 0.18s; }
        .sidebar-nav-item:hover { background: ${t.hover} !important; color: ${t.text} !important; }
        .sidebar-collapse-btn { transition: background 0.18s; }
        .sidebar-collapse-btn:hover { background: ${t.hover} !important; }
        .status-marquee:hover .status-marquee-track { animation-play-state: paused; }
        .main-content-area { padding: 32px 40px; }
        .mob-top-bar { display: none; }
        .mob-bottom-bar { display: none; }
        .mobile-page-title { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .status-marquee-track { animation: none !important; transform: translateX(0) !important; }
        }
        @media (max-width: 768px) {
          .desk { display: none !important; }
          .mgrid { grid-template-columns: 1fr !important; }
          .sgrid { grid-template-columns: 1fr !important; }
          .tfilters { flex-direction: column !important; }
          .mobile-stack { flex-direction: column !important; align-items: stretch !important; }
          .mobile-full-width { width: 100% !important; }
          .app-container { height: 100vh !important; border-radius: 0 !important; max-width: 100% !important; border: none !important; }
          .main-sidebar { display: none !important; }
          .main-content-area { padding: 84px 14px 118px 14px !important; }
          .mob-top-bar { 
             display: flex; position: fixed; top: 0; left: 0; right: 0; min-height: 64px; 
             background-color: ${t.surface}; border-bottom: 1px solid ${t.border}; 
             z-index: 100; align-items: center; justify-content: space-between; padding: env(safe-area-inset-top) 14px 0 14px;
             backdrop-filter: blur(14px);
          }
          .mob-bottom-bar {
             display: flex; position: fixed; left: 14px; right: 14px; bottom: calc(10px + env(safe-area-inset-bottom));
             min-height: 64px;
             z-index: 120; align-items: center; justify-content: space-between;
             padding: 6px;
             border-radius: 999px;
             border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)"};
             background: ${isDark ? "rgba(26,26,26,0.56)" : "rgba(255,255,255,0.58)"};
             backdrop-filter: blur(22px) saturate(180%);
             -webkit-backdrop-filter: blur(22px) saturate(180%);
             box-shadow: ${isDark ? "0 16px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 18px 40px rgba(89,104,58,0.14), inset 0 1px 0 rgba(255,255,255,0.8)"};
          }
          .mobile-page-title { display: block; margin-bottom: 18px; }
          .table-responsive { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
          .table-responsive > div { min-width: 600px; }
        }
        @media (min-width: 769px) {
          .mob { display: none !important; }
        }
        @media print {
          .main-sidebar, .mob-top-bar, .mob-bottom-bar, .desk button, .mob button { display: none !important; }
          .main-content-area { padding: 0 !important; margin: 0 !important; width: 100% !important; overflow: visible !important; height: auto !important; }
          .app-container { height: auto !important; overflow: visible !important; display: block !important; background: white !important; color: black !important; }
          body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="app-container" style={{
        backgroundColor: t.bg, width: "100%", height: "100vh", display: "flex", overflow: "hidden", color: t.text
      }}>
        {/* ═══ SIDEBAR (Retractable, hover to expand) ═══ */}
        <div
          className="main-sidebar"
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          style={{
            width: sidebarOpen ? 220 : 72,
            borderRight: `1px solid ${t.border}`,
            display: "flex", flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
            backgroundColor: t.surface,
            transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
            padding: "20px 0 16px",
          }}
        >
          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center",
            width: "100%", borderBottom: `1px solid ${t.border}`,
            paddingLeft: 14, paddingRight: 14, overflow: "hidden",
            height: 72,
          }}>
            <img
              src={isDark ? "/dark_theme_logo.png" : "/light_theme_logo.png"}
              alt="RayanFinTech Logo"
              onClick={() => navigateToTab("overview")}
              style={{
                height: 38,
                width: sidebarOpen ? 182 : 44,
                objectFit: "cover",
                objectPosition: "left center",
                flexShrink: 0,
                transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
                cursor: "pointer"
              }}
            />
          </div>

          {/* Nav Items */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, padding: "16px 12px" }}>
            {[
              { id: "overview", label: "Overview", icon: Icons.box },
              { id: "transactions", label: "Transactions", icon: Icons.sliders },
              { id: "insights", label: "Insights", icon: Icons.lightbulb },
            ].map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className="sidebar-nav-item"
                  onClick={() => navigateToTab(item.id)}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: 16,
                    padding: "12px",
                    borderRadius: 12, border: "none", cursor: "pointer",
                    backgroundColor: isActive ? t.greenSoft : "transparent",
                    color: isActive ? t.green : t.textSec,
                    transition: "all 0.18s",
                    outline: isActive ? `1px solid ${t.green}22` : "none",
                    width: "100%",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                  title={item.label}
                >
                  <span style={{ flexShrink: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon(isActive ? t.green : t.textSec)}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    fontFamily: "'Inter', sans-serif",
                    opacity: sidebarOpen ? 1 : 0,
                    transition: "opacity 0.15s ease",
                    overflow: "hidden",
                  }}>{item.label}</span>
                </button>
              );
            })}

            {/* Admin: Add Transaction */}
            {isAdmin && (
              <button
                className="sidebar-nav-item"
                onClick={() => { setEditTxn(null); setShowModal(true); }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "12px",
                  borderRadius: 12, border: `1px dashed ${t.border}`, cursor: "pointer",
                  backgroundColor: "transparent", color: t.textSec,
                  width: "100%", marginTop: 8, overflow: "hidden", whiteSpace: "nowrap",
                }}
                title="Add Transaction"
              >
                <span style={{ flexShrink: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Icons.plus(t.textSec)}
                </span>
                <span style={{
                  fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif",
                  opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.15s ease",
                }}>Add Transaction</span>
              </button>
            )}
          </div>

          {/* Bottom actions */}
          <div style={{
            borderTop: `1px solid ${t.border}`, paddingTop: 16,
            display: "flex", flexDirection: "column", gap: 8, padding: "16px 12px 0",
          }}>
            {/* Theme Toggle */}
            <button
              className="sidebar-nav-item"
              onClick={() => setIsDark(!isDark)}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "12px",
                borderRadius: 12, border: "none", cursor: "pointer",
                backgroundColor: "transparent", color: t.textSec,
                width: "100%", overflow: "hidden", whiteSpace: "nowrap",
              }}
              title="Toggle Theme"
            >
              <span style={{ flexShrink: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isDark ? Icons.sun : Icons.moon}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif",
                opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.15s ease",
              }}>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {/* Role Toggle */}
            <button
              className="sidebar-nav-item"
              onClick={handleRoleToggle}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "12px",
                borderRadius: 12, border: "none", cursor: "pointer",
                backgroundColor: "transparent", color: t.textSec,
                width: "100%", overflow: "hidden", whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
              title="Change Role"
            >
              <span style={{ flexShrink: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Icons.user(t.textSec)}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif",
                opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.15s ease",
              }}>{role === 'admin' ? "Admin Role" : "Viewer Role"}</span>
            </button>

            {/* Settings Toggle */}
            <button
              className="sidebar-nav-item"
              onClick={() => navigateToTab("settings")}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "12px",
                borderRadius: 12, border: "none", cursor: "pointer",
                backgroundColor: activeTab === "settings" ? t.greenSoft : "transparent",
                color: activeTab === "settings" ? t.green : t.textSec,
                width: "100%", overflow: "hidden", whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
              title="System Settings"
            >
              <span style={{ flexShrink: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Icons.settings(t.textSec)}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif",
                opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.15s ease",
              }}>Settings</span>
            </button>
          </div>
        </div>
        {/* End of main-sidebar */}

        {/* MOBILE TOP BAR */}
        <div className="mob-top-bar">
          <img
            src={isDark ? "/dark_theme_logo.png" : "/light_theme_logo.png"}
            alt="RayanFinTech"
            onClick={() => navigateToTab("overview")}
            style={{ height: 26, objectFit: "contain", cursor: "pointer", maxWidth: 142 }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              onClick={handleRoleToggle}
              title={role === "admin" ? "Switch to Viewer" : "Unlock Admin"}
              style={{
                color: role === "admin" ? t.green : t.textSec,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
                border: `1px solid ${role === "admin" ? t.green + "55" : t.border}`,
                borderRadius: 8,
                backgroundColor: role === "admin" ? t.greenSoft : "transparent",
              }}
            >
              {Icons.user(role === "admin" ? t.green : t.textSec)}
            </span>
            <span onClick={() => setIsDark(!isDark)} style={{ color: t.textSec, cursor: "pointer", display: "flex", alignItems: "center", padding: 6 }}>
              {isDark ? Icons.sun : Icons.moon}
            </span>
            <span onClick={() => setShowExportModal(true)} style={{ color: t.green, cursor: "pointer", display: "flex", alignItems: "center", padding: 6, border: `1px solid ${t.green}33`, borderRadius: 8 }}>
              {Icons.download(t.green)}
            </span>
            {isAdmin && (
              <button onClick={() => { setEditTxn(null); setShowModal(true); }} style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8,
                border: "none", background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`, cursor: "pointer",
              }}>{Icons.plus("#080808")}</button>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM BAR */}
        <div className="mob-bottom-bar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const iconColor = isActive ? t.green : (isDark ? "rgba(255,255,255,0.72)" : "rgba(22,24,19,0.68)");
            return (
              <button
                key={tab.id}
                onClick={() => navigateToTab(tab.id)}
                style={{
                  flex: isActive ? "1.18 1 0" : "0.95 1 0",
                  minWidth: 0,
                  minHeight: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isActive ? 8 : 0,
                  padding: isActive ? "0 14px" : "0 10px",
                  borderRadius: 999,
                  border: "none",
                  background: isActive
                    ? (isDark
                      ? "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,244,0.78))")
                    : "transparent",
                  boxShadow: isActive
                    ? (isDark
                      ? "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -8px 18px rgba(255,255,255,0.03), 0 8px 20px rgba(0,0,0,0.16)"
                      : "inset 0 1px 0 rgba(255,255,255,0.95), 0 8px 18px rgba(112,130,72,0.14)")
                    : "none",
                  color: iconColor,
                  cursor: "pointer",
                  transition: "all .22s ease"
                }}
              >
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isActive ? 26 : 24,
                  height: isActive ? 26 : 24,
                  color: iconColor,
                  transition: "all .22s ease"
                }}>
                  {tab.id === "overview" && Icons.box(iconColor)}
                  {tab.id === "transactions" && Icons.sliders(iconColor)}
                  {tab.id === "insights" && Icons.lightbulb(iconColor)}
                  {tab.id === "settings" && Icons.settings(iconColor)}
                </span>
                <span style={{
                  maxWidth: isActive ? 78 : 0,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  opacity: isActive ? 1 : 0,
                  transform: `translateX(${isActive ? "0" : "-4px"})`,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: isActive ? (isDark ? "#F5F7F0" : "#18210E") : "transparent",
                  transition: "all .22s ease"
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT MAIN AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

          {/* MAIN SCROLLABLE CONTENT AREA */}
          <div ref={mainContentRef} className="main-content-area" style={{ flex: 1, overflowY: (isMobile && activeTab === "settings") ? "visible" : "auto", backgroundColor: t.bg }}>
            <div className="mobile-page-title">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.4px", textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>
                    Rayan FinTech
                  </div>
                  <h1 style={{ fontFamily: "Oswald", fontSize: 30, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", margin: 0, color: t.text, lineHeight: 1 }}>
                    {activeTab === "overview" ? "Dashboard" : activeTab === "transactions" ? "Transactions" : activeTab === "insights" ? "Insights" : "Settings"}
                  </h1>
                </div>
              </div>
            </div>

            {/* Page Title inside content area */}
            <div className="desk" style={{ marginBottom: 30, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: t.textMuted, marginBottom: 8 }}>
                  {activeTab === "overview" ? "Financial Command Center" : "Workspace"}
                </div>
                <h1 style={{ fontFamily: "Oswald", fontSize: 42, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", margin: 0, color: t.text, lineHeight: 0.95 }}>
                  {activeTab === "overview" ? "Dashboard" : activeTab === "transactions" ? "Transactions" : activeTab === "insights" ? "Insights" : "Settings"}
                </h1>
              </div>
            </div>

            {/* ═══ OVERVIEW ═══ */}
            {activeTab === "overview" && (
              <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
                {/* Welcome + Action Row */}
                <div className={isMobile ? "mobile-stack" : ""} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                  <div />
                  <div className="desk" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {isAdmin && (
                      <button onClick={() => { setEditTxn(null); setShowModal(true); }} style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12,
                        border: "none", background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                        color: "#080808", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "Oswald",
                      }}>{Icons.plus("#080808")} Add Transaction</button>
                    )}
                    <button onClick={() => setShowExportModal(true)} style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 12,
                      border: `1px solid ${t.green}`, backgroundColor: "transparent",
                      color: t.green, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Oswald",
                    }}>{Icons.download(t.green)} Export Report</button>
                  </div>
                </div>

                <StatusMarquee txns={txns} userSettings={userSettings} t={t} fmt={fmt} isMobile={isMobile} />

                {/* Summary Cards */}
                <div className="sgrid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 12 : 22, marginBottom: isMobile ? 18 : 28 }}>
                  <SummaryCard title="Total Balance" subtitle="Available funds" value={fmt(Math.round(totals.balance))} icon={Icons.wallet(t.green)} color={t.green} soft={t.greenSoft} delay={100} t={t} userSettings={userSettings} rawValue={totals.balance} isMobile={isMobile} variant="boxless" />
                  <SummaryCard title="Total Income" subtitle="This period" value={fmt(Math.round(totals.income))} icon={Icons.trendUp(t.green)} color={t.green} soft={t.greenSoft} delay={200} t={t} userSettings={userSettings} rawValue={totals.income} isMobile={isMobile} variant="boxless" />
                  <SummaryCard title="Total Expenses" subtitle="This period" value={fmt(Math.round(totals.expense))} icon={Icons.trendDown(t.orange)} color={t.orange} soft={t.orangeSoft} delay={300} t={t} userSettings={userSettings} rawValue={totals.expense} isMobile={isMobile} variant="boxless" />
                </div>

                {/* Charts */}
                <div className="mgrid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: isMobile ? 20 : 34, marginBottom: 22 }}>
                  {overviewBand(<>{sectionTitle("Balance Trend")}<BalanceTrend txns={txns} t={t} fmt={fmt} isMobile={isMobile} variant="boxless" /></>, t.green, { display: "flex", flexDirection: "column" })}
                  {overviewBand(<>{sectionTitle("Spending Breakdown")}<SpendingDonut txns={txns} t={t} fmt={fmt} CAT_COLORS={CAT_COLORS} isMobile={isMobile} variant="boxless" /></>, t.orange, { display: "flex", flexDirection: "column" })}
                </div>

                {/* Bottom Insight Banner */}
                {(() => {
                  const saved = totals.income - totals.expense;
                  const isPositive = saved >= 0;
                  return (
                    <div style={{
                      display: "flex", alignItems: isMobile ? "stretch" : "center", flexDirection: isMobile ? "column" : "row", gap: 16, padding: isMobile ? "16px" : "16px 22px",
                      borderRadius: 22, background: `linear-gradient(180deg, ${(isPositive ? t.green : t.orange)}12 0%, ${t.cardAlt || t.card} 100%)`, border: `1px solid ${isPositive ? t.green + '26' : t.orange + '26'}`,
                      boxShadow: `0 14px 30px ${(isPositive ? t.green : t.orange)}10`,
                      animation: "fadeSlideIn 0.6s 0.3s both",
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: (isPositive ? t.green : t.orange) + '22', display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isPositive ? Icons.trendUp(t.green) : Icons.trendDown(t.orange)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: t.textMuted }}>Insight</span>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: t.text, fontWeight: 500 }}>
                          {isPositive
                            ? <>You've saved <strong style={{ color: t.green }}>{fmt(Math.round(saved))}</strong> more than you've spent this period. Great job managing your finances!</>
                            : <>You've overspent by <strong style={{ color: t.orange }}>{fmt(Math.round(Math.abs(saved)))}</strong> this period. Consider reviewing your expenses.</>
                          }
                        </p>
                      </div>
                      <button onClick={() => navigateToTab("insights")} style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${isPositive ? t.green : t.orange}`,
                        backgroundColor: "transparent", color: isPositive ? t.green : t.orange, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "Oswald", whiteSpace: "nowrap", justifyContent: "center", width: isMobile ? "100%" : "auto",
                      }}>{Icons.sliders(isPositive ? t.green : t.orange)} View Detailed Report</button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ═══ TRANSACTIONS ═══ */}
            {activeTab === "transactions" && (
              <div style={{ animation: "fadeSlideIn 0.4s ease" }}>

                {/* FILTER PANEL */}
                <div style={{ backgroundColor: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: "16px", marginBottom: 14, boxShadow: t.shadow }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Search */}
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>{Icons.search(t.textMuted)}</span>
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." style={{
                        width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10,
                        border: `1px solid ${t.border}`, backgroundColor: t.inputBg, color: t.text,
                        fontSize: 13, fontFamily: "Oswald", outline: "none",
                      }} />
                    </div>
                    {/* Category + Type Filters */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
                        flex: "1 1 140px", padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`,
                        backgroundColor: t.inputBg, color: t.text, fontSize: 12, fontFamily: "Oswald", fontWeight: 600,
                      }}>
                        <option value="All">All Categories</option>
                        {ALL_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {["All", "income", "expense"].map(tp => pillBtn(filterType === tp, tp === "All" ? "All" : tp.charAt(0).toUpperCase() + tp.slice(1), () => setFilterType(tp), tp))}
                      </div>
                    </div>
                  </div>
                </div>

                {filteredTxns.length === 0 ? (
                  <div style={{ backgroundColor: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: '20px', boxShadow: t.shadow }}>
                    <EmptyState t={t} msg='No transactions match your filters' />
                  </div>
                ) : (
                  <>
                    <div className='desk' style={{ backgroundColor: t.card, borderRadius: 16, border: `1px solid ${t.border}`, overflow: 'hidden', boxShadow: t.shadow }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: `2px solid ${t.border}` }}>
                              {[{ key: 'date', label: 'Date' }, { key: 'description', label: 'Description' }, { key: 'category', label: 'Category' }, { key: 'amount', label: 'Amount' }].map(col => (
                                <th key={col.key} onClick={() => toggleSort(col.key)} style={{ padding: '14px 12px', textAlign: col.key === 'amount' ? 'right' : 'left', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: sortKey === col.key ? t.green : t.textSec, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                                  {col.label} {sortKey === col.key && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                              ))}
                              {isAdmin && <th style={{ padding: '10px 12px', width: 40 }} />}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTxns.slice(0, 50).map((tx, i) => (
                              <tr key={tx.id} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.15s', animation: `fadeSlideIn 0.3s ${Math.min(i * 0.02, 0.5)}s both` }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = t.hover}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: userSettings.compactView ? '6px 12px' : '14px 12px', whiteSpace: 'nowrap', color: t.textSec, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtDate(tx.date)}</td>
                                <td style={{ padding: userSettings.compactView ? '6px 12px' : '14px 12px', fontWeight: 600 }}>{tx.description}</td>
                                <td style={{ padding: userSettings.compactView ? '6px 12px' : '14px 12px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, backgroundColor: (CAT_COLORS[tx.category] || t.textMuted) + '18', color: CAT_COLORS[tx.category] || t.textSec, fontSize: 11, fontWeight: 700 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: CAT_COLORS[tx.category] || t.textMuted }} />{tx.category}
                                  </span>
                                </td>
                                <td style={{ padding: userSettings.compactView ? '6px 12px' : '14px 12px', textAlign: 'right', fontWeight: 800, color: tx.type === 'income' ? t.green : t.orange, fontVariantNumeric: 'tabular-nums' }}>
                                  {tx.type === 'income' ? '+' : '−'}{fmt(Math.round(tx.amount))}
                                </td>
                                {isAdmin && (
                                  <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span onClick={() => { setEditTxn({ ...tx, amount: String(tx.amount) }); setShowModal(true); }} style={{ cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
                                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                      onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                    >{Icons.edit(t.textSec)}</span>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {filteredTxns.length > 50 && <div style={{ textAlign: 'center', padding: 16, fontSize: 12, color: t.textMuted, fontWeight: 600 }}>Showing 50 of {filteredTxns.length} transactions</div>}
                    </div>
                    <div className='mob' style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {filteredTxns.slice(0, 50).map((tx, i) => {
                        const isIncome = tx.type === 'income';
                        return (
                          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: t.card, borderRadius: 14, padding: userSettings.compactView ? '8px 12px' : '14px 16px', border: `1px solid ${t.border}`, animation: `fadeSlideIn 0.3s ${Math.min(i * 0.02, 0.4)}s both` }}>
                            <div style={{ width: userSettings.compactView ? 36 : 44, height: userSettings.compactView ? 36 : 44, borderRadius: 10, flexShrink: 0, backgroundColor: (isIncome ? t.green : (CAT_COLORS[tx.category] || t.orange)) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isIncome ? Icons.trendUp(t.green) : Icons.trendDown(CAT_COLORS[tx.category] || t.orange)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, backgroundColor: (CAT_COLORS[tx.category] || t.textMuted) + '20', color: CAT_COLORS[tx.category] || t.textMuted }}>{tx.category}</span>
                                <span style={{ fontSize: 11, color: t.textMuted }}>{fmtDate(tx.date)}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 900, color: isIncome ? t.green : t.text, fontVariantNumeric: 'tabular-nums' }}>
                                {isIncome ? '+' : '−'}{fmt(Math.round(tx.amount))}
                              </div>
                              {isAdmin && <span onClick={() => { setEditTxn({ ...tx, amount: String(tx.amount) }); setShowModal(true); }} style={{ cursor: 'pointer', display: 'inline-block', marginTop: 4, opacity: 0.5 }}>{Icons.edit(t.textMuted)}</span>}
                            </div>
                          </div>
                        );
                      })}
                      {filteredTxns.length > 50 && <div style={{ textAlign: 'center', padding: 16, fontSize: 12, color: t.textMuted, fontWeight: 600 }}>Showing 50 of {filteredTxns.length} transactions</div>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══ INSIGHTS ═══ */}
            {activeTab === "insights" && (
              <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
                {overviewBand(<>{sectionTitle("Key Observations")}<InsightsSection txns={txns} t={t} fmt={fmt} isMobile={isMobile} variant="boxless" /></>, t.green)}

                <div className="mgrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                  {overviewBand(<>{sectionTitle("Income vs Expenses")}<BalanceTrend txns={txns} t={t} fmt={fmt} isMobile={isMobile} variant="boxless" /></>, t.green, { display: "flex", flexDirection: "column" })}
                  {overviewBand(<>{sectionTitle("Category Breakdown")}<SpendingDonut txns={txns} t={t} fmt={fmt} CAT_COLORS={CAT_COLORS} isMobile={isMobile} variant="boxless" /></>, t.orange, { display: "flex", flexDirection: "column" })}
                </div>

                {/* Monthly Comparison */}
                {overviewBand(
                  (() => {
                    const monthMap = {};
                    txns.forEach(tx => {
                      const key = tx.date.slice(0, 7);
                      if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
                      if (tx.type === "income") monthMap[key].income += tx.amount;
                      else monthMap[key].expense += tx.amount;
                    });
                    const months = Object.keys(monthMap).sort();
                    const maxVal = Math.max(...months.map(m => Math.max(monthMap[m].income, monthMap[m].expense)));
                    return (
                      <>
                        {sectionTitle("Monthly Comparison")}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {months.map((m, i) => {
                            const dt = new Date(m + "-01T00:00:00");
                            const label = dt.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
                            return (
                              <div key={m} style={{ display: "flex", alignItems: isMobile ? "stretch" : "center", flexDirection: isMobile ? "column" : "row", gap: 12, animation: `fadeSlideIn 0.4s ${i * 0.08}s both` }}>
                                <span style={{ width: isMobile ? "auto" : 50, fontSize: 11, fontWeight: 700, color: t.textSec, textAlign: isMobile ? "left" : "right", flexShrink: 0 }}>{label}</span>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ height: 18, width: `${(monthMap[m].income / maxVal) * 100}%`, borderRadius: 9, background: `linear-gradient(90deg, ${t.green}, ${t.accent || t.green})`, minWidth: 4, transition: "width 0.6s ease" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: t.green, whiteSpace: "nowrap" }}>{fmt(Math.round(monthMap[m].income))}</span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ height: 18, width: `${(monthMap[m].expense / maxVal) * 100}%`, borderRadius: 9, background: `linear-gradient(90deg, ${t.orange}, ${t.red || t.orange})`, minWidth: 4, transition: "width 0.6s ease" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: t.orange, whiteSpace: "nowrap" }}>{fmt(Math.round(monthMap[m].expense))}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: t.textMuted, justifyContent: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: t.green }} />Income</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: t.orange }} />Expenses</span>
                          </div>
                        </div>
                      </>
                    );
                  })()
                  , t.text, { marginTop: 14 })}
              </div>
            )}

            {/* ═══ SETTINGS ═══ */}
            {activeTab === "settings" && (
              <SettingsView
                userSettings={userSettings}
                setUserSettings={setUserSettings}
                t={t}
                Icons={Icons}
                txns={txns}
                setTxns={setTxns}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>

        {/* Modals outside the main layout but inside the component */}
        {showModal && isAdmin && (
          <AddModal
            onAdd={addOrUpdateTxn}
            onClose={() => { setShowModal(false); setEditTxn(null); }}
            t={t}
            editTxn={editTxn}
            currencySymbol={userSettings.currency === 'INR' ? '₹' : userSettings.currency === 'USD' ? '$' : '€'}
            isMobile={isMobile}
          />
        )}
        {showRolePinModal && (
          <RolePinModal
            t={t}
            isMobile={isMobile}
            onClose={() => setShowRolePinModal(false)}
            onUnlock={() => {
              setRole("admin");
              setShowRolePinModal(false);
            }}
          />
        )}
        {showExportModal && (
          <ExportModal
            onExport={handleExport}
            onClose={() => setShowExportModal(false)}
            t={t}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}
