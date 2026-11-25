// Home Ledger app shell: hash routing, month switching, and wiring for the
// forms and buttons the views render. All state lives in data.js's store.

import {
  CATEGORIES, loadState, monthName, resetState, saveState, shiftMonth,
} from './data.js';
import {
  renderBills, renderBudgets, renderDashboard, renderGoals,
  renderReports, renderTransactions,
} from './views.js';

const app = document.getElementById('app');
const monthLabel = document.getElementById('month-label');
let state = loadState();

function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, queryString] = raw.split('?');
  const query = new URLSearchParams(queryString || '');
  return { path: path || '', query };
}

function render() {
  const { path, query } = route();
  monthLabel.textContent = monthName(state.month);
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const name = a.getAttribute('data-nav');
    const active = (path === '' && name === 'dashboard') || path === name;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  let html;
  switch (path) {
    case 'transactions': html = renderTransactions(state, query); break;
    case 'budgets': html = renderBudgets(state); break;
    case 'goals': html = renderGoals(state); break;
    case 'reports': html = renderReports(state); break;
    case 'bills': html = renderBills(state); break;
    default: html = renderDashboard(state);
  }
  app.innerHTML = html;
  wire();
  window.scrollTo(0, 0);
}

function rerender() {
  saveState(state);
  render();
}

function wire() {
  // Add a transaction.
  const addTx = document.getElementById('add-tx');
  if (addTx) {
    addTx.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData(addTx);
      const amount = Math.abs(Number(form.get('amount')));
      const direction = form.get('direction');
      if (!amount || amount <= 0) return;
      state.transactions.push({
        id: `user-${Date.now()}`,
        date: String(form.get('date')),
        description: String(form.get('description')).trim(),
        category: String(form.get('category')),
        amount: direction === 'in' ? amount : -amount,
        account: String(form.get('account')),
      });
      rerender();
      const note = document.querySelector('.page-head .lede');
      if (note) note.textContent = 'Added — the totals, charts and budgets already include it.';
    });
  }

  // Filters re-render through the hash so they survive a reload.
  const filterTx = document.getElementById('filter-tx');
  if (filterTx) {
    filterTx.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData(filterTx);
      const params = new URLSearchParams();
      if (form.get('q')) params.set('q', form.get('q'));
      if (form.get('category')) params.set('category', form.get('category'));
      if (form.get('type') && form.get('type') !== 'all') params.set('type', form.get('type'));
      const suffix = params.toString() ? `?${params}` : '';
      location.hash = `#/transactions${suffix}`;
    });
  }

  // Delete a transaction.
  app.querySelectorAll('[data-delete-tx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-tx');
      state.transactions = state.transactions.filter((t) => t.id !== id);
      rerender();
    });
  });

  // Save edited budgets.
  const editBudgets = document.getElementById('edit-budgets');
  if (editBudgets) {
    editBudgets.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData(editBudgets);
      const next = { ...(state.budgets[state.month] || {}) };
      for (const [key, value] of form.entries()) {
        if (key.startsWith('budget:')) {
          const category = key.slice('budget:'.length);
          const limit = Math.max(0, Number(value) || 0);
          next[category] = limit;
        }
      }
      state.budgets[state.month] = next;
      rerender();
    });
  }

  // Add money to a goal.
  app.querySelectorAll('.add-to-goal').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const amount = Number(data.get('amount'));
      if (!amount || amount <= 0) return;
      const goal = state.goals.find((g) => g.id === form.getAttribute('data-goal'));
      if (goal) {
        goal.saved = Math.min(goal.target, goal.saved + amount);
        state.transactions.push({
          id: `user-${Date.now()}`,
          date: `${state.month}-25`,
          description: `Transfer to ${goal.name}`,
          category: 'Savings',
          amount: -amount,
          account: 'Savings',
        });
        rerender();
      }
    });
  });

  // Add a new goal.
  const addGoal = document.getElementById('add-goal');
  if (addGoal) {
    addGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData(addGoal);
      state.goals.push({
        id: `goal-${Date.now()}`,
        name: String(form.get('name')).trim(),
        target: Math.max(1, Number(form.get('target')) || 1),
        saved: Math.max(0, Number(form.get('saved')) || 0),
        note: String(form.get('note')).trim() || 'A new goal for the household.',
      });
      rerender();
    });
  }

  // Mark bills paid / unpaid.
  app.querySelectorAll('[data-pay-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-pay-bill');
      state.paid[state.month] = { ...(state.paid[state.month] || {}), [id]: true };
      rerender();
    });
  });
  app.querySelectorAll('[data-unpay-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-unpay-bill');
      state.paid[state.month] = { ...(state.paid[state.month] || {}) };
      delete state.paid[state.month][id];
      rerender();
    });
  });
}

document.getElementById('prev-month').addEventListener('click', () => {
  state.month = shiftMonth(state.month, -1);
  rerender();
});
document.getElementById('next-month').addEventListener('click', () => {
  state.month = shiftMonth(state.month, 1);
  rerender();
});
document.getElementById('reset-demo').addEventListener('click', () => {
  state = resetState();
  rerender();
});

window.addEventListener('hashchange', render);
render();
