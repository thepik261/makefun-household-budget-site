// Home Ledger data: the household's seed figures and the tiny store that
// keeps them in localStorage. Amounts are USD. A transaction's amount is
// positive for money in, negative for money out.

export const CATEGORIES = [
  { name: 'Housing', color: '#2f6b4f' },
  { name: 'Groceries', color: '#7a9e43' },
  { name: 'Utilities', color: '#3e7ca6' },
  { name: 'Transport', color: '#c98a2b' },
  { name: 'Dining Out', color: '#b4552d' },
  { name: 'Kids & School', color: '#7b5ea7' },
  { name: 'Health', color: '#4f9d8f' },
  { name: 'Entertainment', color: '#c25b7a' },
  { name: 'Subscriptions', color: '#6b7a8f' },
  { name: 'Shopping', color: '#8a6d3b' },
  { name: 'Income', color: '#2f6b4f' },
  { name: 'Savings', color: '#2f6b4f' },
];

export function categoryColor(name) {
  const found = CATEGORIES.find((c) => c.name === name);
  return found ? found.color : '#6b7a8f';
}

const STORE_KEY = 'homeledger-v1';

function seedTransactions() {
  // [date, description, category, amount, account]
  const rows = [
    // --- November 2026 ---
    ['2026-11-01', 'Paycheck — Maya Alvarez', 'Income', 3200, 'Checking'],
    ['2026-11-01', 'Rent — Maple Court Apt 4B', 'Housing', -1850, 'Checking'],
    ['2026-11-02', 'GreenMart weekly shop', 'Groceries', -142.60, 'Checking'],
    ['2026-11-03', 'City power bill', 'Utilities', -128.40, 'Checking'],
    ['2026-11-04', 'School lunch — Leo & Nora', 'Kids & School', -64.00, 'Checking'],
    ['2026-11-05', 'Gym membership', 'Health', -45.00, 'Checking'],
    ['2026-11-06', 'Bus passes — November', 'Transport', -96.00, 'Checking'],
    ['2026-11-07', 'Farmers market', 'Groceries', -58.25, 'Cash'],
    ['2026-11-08', 'Pizza night — Tony’s', 'Dining Out', -46.80, 'Checking'],
    ['2026-11-09', 'Kids’ winter jackets', 'Shopping', -118.00, 'Credit card'],
    ['2026-11-10', 'Internet — Fiber 300', 'Utilities', -79.00, 'Checking'],
    ['2026-11-11', 'Fuel — Shell', 'Transport', -52.30, 'Credit card'],
    ['2026-11-12', 'Pharmacy — flu shots', 'Health', -38.50, 'Checking'],
    ['2026-11-13', 'GreenMart weekly shop', 'Groceries', -167.90, 'Checking'],
    ['2026-11-14', 'Cinema — family movie', 'Entertainment', -54.00, 'Checking'],
    ['2026-11-15', 'Paycheck — Daniel Alvarez', 'Income', 3200, 'Checking'],
    ['2026-11-15', 'Transfer to emergency fund', 'Savings', -400, 'Savings'],
    ['2026-11-16', 'School field trip — Leo', 'Kids & School', -42.00, 'Checking'],
    ['2026-11-17', 'Water bill', 'Utilities', -68.20, 'Checking'],
    ['2026-11-18', 'GreenMart weekly shop', 'Groceries', -129.45, 'Checking'],
    ['2026-11-19', 'Car insurance — monthly', 'Transport', -134.00, 'Checking'],
    ['2026-11-20', 'Birthday dinner — Grandma Rosa', 'Dining Out', -88.40, 'Credit card'],
    ['2026-11-21', 'Bookshop — Nora’s reading list', 'Kids & School', -36.75, 'Cash'],
    ['2026-11-22', 'Streaming bundle', 'Subscriptions', -32.00, 'Checking'],
    ['2026-11-23', 'Freelance — logo design (Maya)', 'Income', 450, 'Checking'],
    ['2026-11-24', 'GreenMart weekly shop', 'Groceries', -151.30, 'Checking'],
    ['2026-11-25', 'Phone plan — two lines', 'Utilities', -112.00, 'Checking'],
    // --- October 2026 (for reports and trends) ---
    ['2026-10-01', 'Paycheck — Maya Alvarez', 'Income', 3200, 'Checking'],
    ['2026-10-01', 'Rent — Maple Court Apt 4B', 'Housing', -1850, 'Checking'],
    ['2026-10-03', 'GreenMart weekly shop', 'Groceries', -158.20, 'Checking'],
    ['2026-10-05', 'City power bill', 'Utilities', -141.10, 'Checking'],
    ['2026-10-07', 'School supplies', 'Kids & School', -96.40, 'Checking'],
    ['2026-10-09', 'Fuel — Shell', 'Transport', -58.75, 'Credit card'],
    ['2026-10-11', 'GreenMart weekly shop', 'Groceries', -171.55, 'Checking'],
    ['2026-10-13', 'Dentist — Leo check-up', 'Health', -85.00, 'Checking'],
    ['2026-10-15', 'Paycheck — Daniel Alvarez', 'Income', 3200, 'Checking'],
    ['2026-10-15', 'Transfer to emergency fund', 'Savings', -400, 'Savings'],
    ['2026-10-17', 'Takeaway — Thai Orchid', 'Dining Out', -62.30, 'Credit card'],
    ['2026-10-19', 'GreenMart weekly shop', 'Groceries', -139.80, 'Checking'],
    ['2026-10-21', 'Concert tickets — school fair', 'Entertainment', -72.00, 'Checking'],
    ['2026-10-23', 'New shoes — Daniel', 'Shopping', -89.00, 'Credit card'],
    ['2026-10-25', 'GreenMart weekly shop', 'Groceries', -148.90, 'Checking'],
    ['2026-10-27', 'Car service — oil & brakes', 'Transport', -210.00, 'Checking'],
    ['2026-10-29', 'Halloween costumes', 'Kids & School', -74.50, 'Cash'],
    ['2026-10-30', 'Streaming bundle', 'Subscriptions', -32.00, 'Checking'],
    // --- September 2026 (trend tail) ---
    ['2026-09-01', 'Paycheck — Maya Alvarez', 'Income', 3200, 'Checking'],
    ['2026-09-01', 'Rent — Maple Court Apt 4B', 'Housing', -1850, 'Checking'],
    ['2026-09-15', 'Paycheck — Daniel Alvarez', 'Income', 3200, 'Checking'],
    ['2026-09-15', 'Transfer to emergency fund', 'Savings', -400, 'Savings'],
    ['2026-09-04', 'GreenMart weekly shop', 'Groceries', -152.40, 'Checking'],
    ['2026-09-12', 'GreenMart weekly shop', 'Groceries', -166.10, 'Checking'],
    ['2026-09-20', 'GreenMart weekly shop', 'Groceries', -144.75, 'Checking'],
    ['2026-09-28', 'GreenMart weekly shop', 'Groceries', -159.60, 'Checking'],
    ['2026-09-08', 'City power bill', 'Utilities', -155.30, 'Checking'],
    ['2026-09-18', 'Fuel — Shell', 'Transport', -61.20, 'Credit card'],
    ['2026-09-22', 'Takeaway — Thai Orchid', 'Dining Out', -58.90, 'Credit card'],
    ['2026-09-26', 'Cinema — family movie', 'Entertainment', -48.00, 'Checking'],
  ];
  return rows.map(([date, description, category, amount, account], i) => ({
    id: `seed-${i + 1}`, date, description, category, amount, account,
  }));
}

function seedState() {
  return {
    household: {
      name: 'The Alvarez Household',
      members: ['Maya', 'Daniel', 'Leo (9)', 'Nora (7)'],
      monthIncome: 6850,
    },
    budgets: {
      '2026-11': {
        Housing: 1850, Groceries: 850, Utilities: 320, Transport: 380,
        'Dining Out': 300, 'Kids & School': 450, Health: 250,
        Entertainment: 180, Subscriptions: 95, Shopping: 350,
      },
      '2026-10': {
        Housing: 1850, Groceries: 850, Utilities: 320, Transport: 380,
        'Dining Out': 300, 'Kids & School': 450, Health: 250,
        Entertainment: 180, Subscriptions: 95, Shopping: 350,
      },
    },
    goals: [
      { id: 'goal-1', name: 'Emergency fund', target: 10000, saved: 6400, note: 'Six months of essentials, for the unexpected.' },
      { id: 'goal-2', name: 'Family vacation — coast trip', target: 3500, saved: 1850, note: 'A week by the sea next summer.' },
      { id: 'goal-3', name: 'New car down payment', target: 8000, saved: 2300, note: 'Replace the 2014 hatchback before it gives up.' },
      { id: 'goal-4', name: 'Kids’ college fund', target: 25000, saved: 4100, note: 'A little every month, starting early.' },
    ],
    bills: [
      { id: 'bill-rent', name: 'Rent — Maple Court Apt 4B', amount: 1850, dueDay: 1, category: 'Housing', autopay: true },
      { id: 'bill-gym', name: 'Gym membership', amount: 45, dueDay: 5, category: 'Health', autopay: true },
      { id: 'bill-stream', name: 'Streaming bundle', amount: 32, dueDay: 8, category: 'Subscriptions', autopay: true },
      { id: 'bill-power', name: 'City power', amount: 128.40, dueDay: 12, category: 'Utilities', autopay: false },
      { id: 'bill-internet', name: 'Internet — Fiber 300', amount: 79, dueDay: 15, category: 'Utilities', autopay: true },
      { id: 'bill-water', name: 'Water bill', amount: 68.20, dueDay: 18, category: 'Utilities', autopay: false },
      { id: 'bill-insurance', name: 'Car insurance', amount: 134, dueDay: 20, category: 'Transport', autopay: true },
      { id: 'bill-phone', name: 'Phone plan — two lines', amount: 112, dueDay: 22, category: 'Utilities', autopay: true },
    ],
    // paid[month][billId] = true once marked paid
    paid: { '2026-11': { 'bill-rent': true, 'bill-gym': true, 'bill-stream': true, 'bill-power': true, 'bill-internet': true } },
    transactions: seedTransactions(),
    month: '2026-11',
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage: fall back to the seed.
  }
  return seedState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the in-memory state still works.
  }
}

export function resetState() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    // ignore
  }
  return seedState();
}

// --- Derived figures for one month ("YYYY-MM") ---

export function monthTransactions(state, month) {
  return state.transactions
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function monthTotals(state, month) {
  let income = 0;
  let spending = 0;
  for (const t of state.transactions) {
    if (!t.date.startsWith(month)) continue;
    if (t.amount > 0) income += t.amount;
    else spending += -t.amount;
  }
  const saved = income - spending;
  return { income, spending, saved, rate: income > 0 ? saved / income : 0 };
}

export function spendingByCategory(state, month) {
  const sums = new Map();
  for (const t of state.transactions) {
    if (!t.date.startsWith(month) || t.amount >= 0) continue;
    if (t.category === 'Savings') continue; // a transfer, not spending
    sums.set(t.category, (sums.get(t.category) || 0) + -t.amount);
  }
  return [...sums.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function budgetProgress(state, month) {
  const budgets = state.budgets[month] || {};
  const spent = new Map();
  for (const t of state.transactions) {
    if (!t.date.startsWith(month) || t.amount >= 0) continue;
    spent.set(t.category, (spent.get(t.category) || 0) + -t.amount);
  }
  return Object.entries(budgets)
    .map(([category, limit]) => ({
      category,
      limit,
      spent: spent.get(category) || 0,
      left: limit - (spent.get(category) || 0),
    }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
}

export function monthName(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function formatMoney(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}
