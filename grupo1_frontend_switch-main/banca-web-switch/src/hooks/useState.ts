const state: any = {
  session: null,
  customerType: 'NATURAL',
  coreUserId: null,
  accounts: [],
  transactions: [],
  batches: [],
  charges: [],
  companyAccount: null,
};

function getState() {
  return state;
}

function setState(newState: any) {
  Object.assign(state, newState);
}

function resetState() {
  state.session = null;
  state.accounts = [];
  state.transactions = [];
  state.batches = [];
  state.charges = [];
  state.companyAccount = null;
}

function saveSession() {
  if (state.session) {
    localStorage.setItem('banquitoSession', JSON.stringify({ session: state.session, customerType: state.customerType }));
  }
}

function restoreSession() {
  const raw = localStorage.getItem('banquitoSession');
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    state.session = parsed.session;
    state.customerType = parsed.customerType || parsed.session?.customerType || 'NATURAL';
    return true;
  } catch (error) {
    localStorage.removeItem('banquitoSession');
    return false;
  }
}

function clearSession() {
  resetState();
  localStorage.removeItem('banquitoSession');
}

export {
  getState,
  setState,
  resetState,
  saveSession,
  restoreSession,
  clearSession,
};
