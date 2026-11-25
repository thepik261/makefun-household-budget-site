// Home Ledger views: one render function per section. Each returns HTML for
// the month in state; main.js wires the controls after render.

import {
  CATEGORIES, budgetProgress, categoryColor, formatDate, formatMoney, monthName,
  monthTotals, monthTransactions, spendingByCategory,
} from './data.js';
import { donutChart, monthBars, progressBar } from './charts.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function statCard(label, value, note, tone) {
  return `<div class="stat${tone ? ` ${tone}` : ''}">
    <span class="stat-label">${label}</span>
    <strong class="stat-value">${value}</strong>
    <span class="stat-note">${note}</span>
  </div>`;
}

function txRow(t, withDelete) {
  const sign = t.amount >= 0 ? '+' : '−';
  const cls = t.amount >= 0 ? 'in' : 'out';
  return `<tr>
    <td>${formatDate(t.date)}</td>
    <td>${esc(t.description)}</td>
    <td><span class="chip">${esc(t.category)}</span></td>
    <td>${esc(t.account)}</td>
    <td class="amount ${cls}">${sign}${formatMoney(Math.abs(t.amount)).slice(0)}</td>
    ${withDelete ? `<td><button type="button" class="mini danger" data-delete-tx="${t.id}">Delete</button></td>` : ''}
  </tr>`;
}

export function renderDashboard(state) {
  const month = state.month;
  const totals = monthTotals(state, month);
  const byCat = spendingByCategory(state, month);
  const spentNoSavings = byCat.reduce((s, p) => s + p.amount, 0);
  const budgets = budgetProgress(state, month);
  const recent = monthTransactions(state, month).slice(0, 8);
  const paid = state.paid[month] || {};
  const upcoming = state.bills
    .filter((b) => !paid[b.id])
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 4);
  const nextGoal = [...state.goals].sort((a, b) => b.saved / b.target - a.saved / a.target)[0];
  const over = budgets.filter((b) => b.spent > b.limit);

  return `<section class="page-head">
    <div>
      <h1>${monthName(month)} budget</h1>
      <p class="lede">What the ${esc(state.household.name)} has coming in, going out, and left over — at a glance.</p>
    </div>
    <a class="btn primary" href="#/transactions">Add a transaction</a>
  </section>

  <section class="stats" aria-label="Month totals">
    ${statCard('Money in', formatMoney(totals.income), 'Paychecks + freelance', 'good')}
    ${statCard('Money out', formatMoney(totals.spending), 'All spending + transfers', 'bad')}
    ${statCard('Left over', formatMoney(totals.saved), totals.saved >= 0 ? 'Saved this month' : 'Over budget this month', totals.saved >= 0 ? 'good' : 'bad')}
    ${statCard('Savings rate', `${Math.round(totals.rate * 100)}%`, 'Share of income kept', '')}
  </section>

  ${over.length ? `<div class="alert">⚠ Over budget: ${over.map((b) => `${esc(b.category)} (${formatMoney(b.spent - b.limit)} over)`).join(', ')}. See <a href="#/budgets">Budgets</a>.</div>` : ''}

  <div class="grid-2">
    <section class="card">
      <h2>Where the money went</h2>
      ${donutChart(byCat, spentNoSavings)}
    </section>
    <section class="card">
      <h2>Budgets this month</h2>
      <ul class="budget-list">
        ${budgets.slice(0, 5).map((b) => {
          const frac = b.spent / b.limit;
          const tone = frac > 1 ? 'over' : frac > 0.85 ? 'warn' : '';
          return `<li>
            <div class="budget-line"><span>${esc(b.category)}</span><span>${formatMoney(b.spent)} of ${formatMoney(b.limit)}</span></div>
            ${progressBar(frac, tone)}
          </li>`;
        }).join('')}
      </ul>
      <p class="card-link"><a href="#/budgets">See all budgets &rarr;</a></p>
    </section>
  </div>

  <div class="grid-2">
    <section class="card">
      <h2>Recent transactions</h2>
      <table class="tx">
        <thead><tr><th>Date</th><th>What</th><th>Category</th><th>Amount</th></tr></thead>
        <tbody>${recent.map((t) => txRow(t, false)).join('')}</tbody>
      </table>
      <p class="card-link"><a href="#/transactions">All transactions &rarr;</a></p>
    </section>
    <div class="stack">
      <section class="card">
        <h2>Bills coming up</h2>
        ${upcoming.length ? `<ul class="bill-list">${upcoming.map((b) => `<li><span>${esc(b.name)}</span><strong>${formatMoney(b.amount)}</strong><span class="due">due ${monthName(month).split(' ')[0]} ${b.dueDay}</span></li>`).join('')}</ul>` : '<p class="empty">Every bill this month is paid. 🎉</p>'}
        <p class="card-link"><a href="#/bills">All bills &rarr;</a></p>
      </section>
      <section class="card">
        <h2>Closest goal: ${esc(nextGoal.name)}</h2>
        <p class="goal-figures"><strong>${formatMoney(nextGoal.saved)}</strong> of ${formatMoney(nextGoal.target)} — ${Math.round((nextGoal.saved / nextGoal.target) * 100)}%</p>
        ${progressBar(nextGoal.saved / nextGoal.target, '')}
        <p class="card-link"><a href="#/goals">All savings goals &rarr;</a></p>
      </section>
    </div>
  </div>`;
}

export function renderTransactions(state, query) {
  const month = state.month;
  let list = monthTransactions(state, month);
  const totals = monthTotals(state, month);
  const cat = query.get('category') || '';
  const q = (query.get('q') || '').toLowerCase();
  const type = query.get('type') || 'all';
  if (cat) list = list.filter((t) => t.category === cat);
  if (q) list = list.filter((t) => t.description.toLowerCase().includes(q) || t.account.toLowerCase().includes(q));
  if (type === 'in') list = list.filter((t) => t.amount > 0);
  if (type === 'out') list = list.filter((t) => t.amount < 0);
  const shownOut = list.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
  const shownIn = list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return `<section class="page-head">
    <div><h1>Transactions</h1>
    <p class="lede">${list.length} transactions in ${monthName(month)} — ${formatMoney(shownIn)} in, ${formatMoney(shownOut)} out. Month total: ${formatMoney(totals.income)} in, ${formatMoney(totals.spending)} out.</p></div>
  </section>

  <section class="card">
    <h2>Add a transaction</h2>
    <form id="add-tx" class="form-grid">
      <label>Date <input type="date" name="date" value="${month}-25" required></label>
      <label>What <input type="text" name="description" placeholder="e.g. GreenMart weekly shop" required maxlength="80"></label>
      <label>Category <select name="category">${CATEGORIES.map((c) => `<option>${c.name}</option>`).join('')}</select></label>
      <label>Amount (USD) <input type="number" name="amount" step="0.01" min="0.01" placeholder="42.50" required></label>
      <label>Direction <select name="direction"><option value="out">Money out</option><option value="in">Money in</option></select></label>
      <label>Account <select name="account"><option>Checking</option><option>Credit card</option><option>Cash</option><option>Savings</option></select></label>
      <div class="form-actions"><button class="btn primary" type="submit">Add transaction</button></div>
    </form>
    <p class="hint">Added transactions are saved on this device and included in every total, chart and budget at once.</p>
  </section>

  <section class="card">
    <h2>Filter</h2>
    <form id="filter-tx" class="form-grid filters">
      <label>Search <input type="search" name="q" value="${esc(query.get('q') || '')}" placeholder="Shop, bill, account…"></label>
      <label>Category <select name="category"><option value="">All categories</option>${CATEGORIES.map((c) => `<option${c.name === cat ? ' selected' : ''}>${c.name}</option>`).join('')}</select></label>
      <label>Type <select name="type"><option value="all"${type === 'all' ? ' selected' : ''}>All</option><option value="in"${type === 'in' ? ' selected' : ''}>Money in</option><option value="out"${type === 'out' ? ' selected' : ''}>Money out</option></select></label>
      <div class="form-actions"><button class="btn" type="submit">Apply filters</button> <a class="btn ghost" href="#/transactions">Clear</a></div>
    </form>
    ${list.length ? `<div class="table-scroll"><table class="tx">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th>Account</th><th>Amount</th><th></th></tr></thead>
      <tbody>${list.map((t) => txRow(t, true)).join('')}</tbody>
    </table></div>` : '<p class="empty">Nothing matches those filters. Try clearing them.</p>'}
  </section>`;
}

export function renderBudgets(state) {
  const month = state.month;
  const budgets = budgetProgress(state, month);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  return `<section class="page-head">
    <div><h1>Budgets — ${monthName(month)}</h1>
    <p class="lede">${formatMoney(totalSpent)} spent of ${formatMoney(totalLimit)} budgeted. Set a limit per category; the bars update as you add transactions.</p></div>
  </section>
  <section class="card">
    <form id="edit-budgets">
    <table class="tx budgets">
      <thead><tr><th>Category</th><th>Spent</th><th>Budget</th><th>Left</th><th>Progress</th></tr></thead>
      <tbody>
      ${budgets.map((b) => {
        const frac = b.spent / b.limit;
        const tone = frac > 1 ? 'over' : frac > 0.85 ? 'warn' : '';
        const leftCls = b.left < 0 ? 'amount out' : 'amount in';
        return `<tr>
          <td><span class="swatch" style="background:${categoryColor(b.category)}"></span> ${esc(b.category)}</td>
          <td>${formatMoney(b.spent)}</td>
          <td><label class="sr-only" for="budget-${esc(b.category)}">Budget for ${esc(b.category)}</label><input class="budget-input" id="budget-${esc(b.category)}" type="number" min="0" step="1" name="budget:${esc(b.category)}" value="${b.limit}"> </td>
          <td class="${leftCls}">${b.left < 0 ? '−' : ''}${formatMoney(Math.abs(b.left))}${b.left < 0 ? ' over' : ' left'}</td>
          <td class="progress-cell">${progressBar(frac, tone)}<span class="pct">${Math.round(frac * 100)}%</span></td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    <div class="form-actions"><button class="btn primary" type="submit">Save budgets</button></div>
    </form>
    <p class="hint">Tip: a household that keeps groceries under ${formatMoney(850)} and dining out under ${formatMoney(300)} frees about ${formatMoney(150)} a month for savings.</p>
  </section>`;
}

export function renderGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `<section class="page-head">
    <div><h1>Savings goals</h1>
    <p class="lede">${formatMoney(totalSaved)} saved toward ${formatMoney(totalTarget)} of goals. Add money to a goal whenever there is something left over.</p></div>
  </section>
  <div class="grid-2 goals">
  ${state.goals.map((g) => {
    const pct = Math.round((g.saved / g.target) * 100);
    return `<section class="card goal">
      <h2>${esc(g.name)}</h2>
      <p class="goal-figures"><strong>${formatMoney(g.saved)}</strong> of ${formatMoney(g.target)} <span class="pct">${pct}%</span></p>
      ${progressBar(g.saved / g.target, '')}
      <p>${esc(g.note)}</p>
      <form class="add-to-goal" data-goal="${g.id}">
        <label>Add to this goal <input type="number" name="amount" min="1" step="1" placeholder="50" required></label>
        <button class="btn" type="submit">Add</button>
      </form>
    </section>`;
  }).join('')}
  </div>
  <section class="card">
    <h2>Start a new goal</h2>
    <form id="add-goal" class="form-grid">
      <label>Goal name <input type="text" name="name" placeholder="e.g. New washing machine" required maxlength="60"></label>
      <label>Target (USD) <input type="number" name="target" min="1" step="1" placeholder="1200" required></label>
      <label>Saved so far (USD) <input type="number" name="saved" min="0" step="1" value="0"></label>
      <label>Why it matters <input type="text" name="note" placeholder="One line about this goal" maxlength="120"></label>
      <div class="form-actions"><button class="btn primary" type="submit">Add goal</button></div>
    </form>
  </section>`;
}

export function renderReports(state) {
  const months = ['2026-09', '2026-10', '2026-11'].map((m) => {
    const t = monthTotals(state, m);
    return { label: monthName(m).split(' ')[0].slice(0, 3), income: t.income, spending: t.spending };
  });
  const byCat = spendingByCategory(state, state.month);
  const top = byCat[0];
  const totals = monthTotals(state, state.month);
  const prev = monthTotals(state, '2026-10');
  const dining = byCat.find((p) => p.category === 'Dining Out');
  const diningPrev = spendingByCategory(state, '2026-10').find((p) => p.category === 'Dining Out');
  const diningChange = dining && diningPrev ? Math.round(((dining.amount - diningPrev.amount) / diningPrev.amount) * 100) : 0;
  const grocery = byCat.find((p) => p.category === 'Groceries');

  return `<section class="page-head">
    <div><h1>Reports</h1>
    <p class="lede">Three months of the household's money, side by side — and what it means.</p></div>
  </section>
  <section class="card">
    <h2>Income vs spending</h2>
    ${monthBars(months)}
    <p class="hint">September–November 2026. Income is steady at ${formatMoney(6850)} a month; spending moves with the seasons.</p>
  </section>
  <div class="grid-2">
    <section class="card">
      <h2>Where November's money went</h2>
      ${donutChart(byCat, byCat.reduce((s, p) => s + p.amount, 0))}
    </section>
    <section class="card">
      <h2>What the numbers say</h2>
      <ul class="insights">
        <li><strong>Biggest cost: ${esc(top.category)}.</strong> ${formatMoney(top.amount)} in November — ${Math.round((top.amount / totals.spending) * 100)}% of all spending. It is fixed, so the lever is everywhere else.</li>
        <li><strong>Savings rate ${Math.round(totals.rate * 100)}%.</strong> ${formatMoney(totals.saved)} stayed in the household this month, ${totals.saved >= prev.saved ? 'more' : 'less'} than October's ${formatMoney(prev.saved)}.</li>
        ${dining ? `<li><strong>Dining out is ${diningChange >= 0 ? 'up' : 'down'} ${Math.abs(diningChange)}% on October.</strong> ${formatMoney(dining.amount)} this month. Cooking two more nights a week would save roughly ${formatMoney(120)} a month.</li>` : ''}
        ${grocery ? `<li><strong>Groceries: ${formatMoney(grocery.amount)}.</strong> Four weekly shops, averaging ${formatMoney(Math.round(grocery.amount / 4))} each — steady, and the easiest place to shave a little with a list.</li>` : ''}
        <li><strong>Subscriptions are quiet money.</strong> ${formatMoney(32)} a month for the streaming bundle — worth a yearly check that everyone still watches it.</li>
      </ul>
    </section>
  </div>`;
}

export function renderBills(state) {
  const month = state.month;
  const paid = state.paid[month] || {};
  const sorted = [...state.bills].sort((a, b) => a.dueDay - b.dueDay);
  const total = sorted.reduce((s, b) => s + b.amount, 0);
  const paidTotal = sorted.filter((b) => paid[b.id]).reduce((s, b) => s + b.amount, 0);
  const remaining = sorted.filter((b) => !paid[b.id]);
  return `<section class="page-head">
    <div><h1>Bills — ${monthName(month)}</h1>
    <p class="lede">${formatMoney(paidTotal)} of ${formatMoney(total)} paid. ${remaining.length} bill${remaining.length === 1 ? '' : 's'} still to go.</p></div>
  </section>
  <section class="card">
    <table class="tx bills">
      <thead><tr><th>Bill</th><th>Category</th><th>Due</th><th>Amount</th><th>How</th><th>Status</th><th></th></tr></thead>
      <tbody>
      ${sorted.map((b) => `<tr class="${paid[b.id] ? 'paid' : ''}">
        <td>${esc(b.name)}</td>
        <td><span class="chip">${esc(b.category)}</span></td>
        <td>${monthName(month).split(' ')[0]} ${b.dueDay}</td>
        <td class="amount">${formatMoney(b.amount)}</td>
        <td>${b.autopay ? 'Autopay' : 'Manual'}</td>
        <td>${paid[b.id] ? '<span class="pill done">Paid ✓</span>' : '<span class="pill due">To pay</span>'}</td>
        <td>${paid[b.id]
          ? `<button type="button" class="mini" data-unpay-bill="${b.id}">Undo</button>`
          : `<button type="button" class="mini primary" data-pay-bill="${b.id}">Mark paid</button>`}</td>
      </tr>`).join('')}
      </tbody>
    </table>
    <p class="hint">Marking a bill paid moves it out of “coming up” on the dashboard and into this month's paid total. Autopay bills are marked paid automatically on their due day in a real bank feed — here you tap the button.</p>
  </section>`;
}
