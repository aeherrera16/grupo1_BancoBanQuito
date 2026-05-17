import { login as loginApi, changePassword as changePasswordApi } from '../services/api';
import { getState, setState, saveSession } from '../hooks/useState';
import { setMessage, escapeHtml, formatDate } from '../helpers/formatters';
import { loadAccounts } from './AccountsPage';

const $ = (selector: string): any => document.querySelector(selector);
const $$ = (selector: string): any[] => Array.from(document.querySelectorAll(selector));

async function login(event: SubmitEvent) {
  event.preventDefault();
  const loginMessage = $('#loginMessage');
  setMessage(loginMessage, 'Validando credenciales...');

  const form = new FormData(event.currentTarget as HTMLFormElement);
  const username = form.get('username') as string;
  const password = form.get('password') as string;

  try {
    const session = await loginApi(username, password);

    if (session.passwordChangeRequired) {
      setMessage(loginMessage, 'Cambio de contraseña requerido.', 'success');
      showPasswordChange(username, password);
      return;
    }

    const realType = session.customerType;
    if (!realType) {
      throw new Error('No se pudo identificar el tipo de cliente. Intenta nuevamente en unos minutos.');
    }

    setState({ session, customerType: realType });
    saveSession();
    setMessage(loginMessage, 'Ingreso correcto.', 'success');
    showDashboard();
    await refreshAll();
  } catch (error: any) {
    setMessage(loginMessage, error.message || 'No se pudo iniciar sesion.', 'error');
  }
}

function showPasswordChange(username: string, currentPassword: string) {
  $('[data-view="login"]').classList.add('is-hidden');
  $('[data-view="password-change"]').classList.remove('is-hidden');

  const form = $('#passwordChangeForm');
  $('#currentPassword').value = currentPassword;

  form.onsubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const message = $('#passwordChangeMessage');
    const newPassword = $('#newPassword').value;
    const confirmPassword = $('#confirmPassword').value;

    if (newPassword !== confirmPassword) {
      setMessage(message, 'Las contraseñas no coinciden.', 'error');
      return;
    }

    if (newPassword === currentPassword) {
      setMessage(message, 'La nueva contraseña debe ser diferente a la actual.', 'error');
      return;
    }

    setMessage(message, 'Actualizando contraseña...');
    try {
      const session = await changePasswordApi(username, currentPassword, newPassword);

      const realType = session.customerType;
      setState({ session, customerType: realType });
      saveSession();

      setMessage(message, 'Contraseña actualizada con éxito.', 'success');
      $('[data-view="password-change"]').classList.add('is-hidden');
      showDashboard();
      await refreshAll();
    } catch (error: any) {
      setMessage(message, error.message || 'Error al cambiar la contraseña.', 'error');
    }
  };
}

function showDashboard() {
  $('[data-view="login"]').classList.add('is-hidden');
  $('[data-view="password-change"]').classList.add('is-hidden');
  $('[data-view="dashboard"]').classList.remove('is-hidden');

  const state = getState();
  const isCompany = state.customerType === 'JURIDICO';
  $('#sessionType').textContent = isCompany ? 'Cliente juridico' : 'Cliente natural';
  $('#sessionName').textContent = state.session?.customerName || state.session?.username || 'Panel principal';
  $('#sessionMeta').textContent = `${state.session?.identificationType || 'ID'} ${state.session?.identification || ''}`.trim();
  $('#sidebarType').textContent = isCompany ? 'Perfil juridico' : 'Perfil natural';

  $$('.company-only').forEach((element: any) => element.classList.toggle('is-hidden', !isCompany));
  $$('.natural-only').forEach((element: any) => element.classList.toggle('is-hidden', isCompany));

  activateSection('overview');
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  renderProfile();
}

function logout() {
  const state = getState();
  state.session = null;
  state.accounts = [];
  state.transactions = [];
  state.batches = [];
  state.charges = [];
  localStorage.removeItem('banquitoSession');
  $('#loginForm').reset();
  activateSection('overview');
  $('[data-view="dashboard"]').classList.add('is-hidden');
  $('[data-view="login"]').classList.remove('is-hidden');
}

function activateSection(section: string) {
  const state = getState();
  const isCompany = state.customerType === 'JURIDICO';
  if (!isCompany && ['payments', 'reports', 'sftp'].includes(section)) section = 'overview';

  $$('.nav-item').forEach((button: any) => button.classList.toggle('is-active', button.dataset.section === section));
  $$('[data-section-panel]').forEach((panel: any) => {
    panel.classList.toggle('is-hidden', panel.dataset.sectionPanel !== section);
  });
}

function renderProfile() {
  const state = getState();
  if (!state.session) return;

  const session = state.session;
  const isCompany = state.customerType === 'JURIDICO';
  const customerName = session.customerName || 'Informacion del cliente';
  const identification = `${session.identificationType || 'ID'} ${session.identification || ''}`.trim();

  $('#profileName').textContent = session.customerName || 'Informacion del cliente';
  $('#profileDetails').innerHTML = `
    <section class="client-identity-card">
      <div class="client-avatar">${isCompany ? 'CO' : 'CL'}</div>
      <div>
        <span>${isCompany ? 'Cliente juridico' : 'Cliente natural'}</span>
        <strong>${escapeHtml(customerName)}</strong>
        <small>${escapeHtml(identification || 'Identificacion no disponible')}</small>
      </div>
      <em class="badge ${session.status === 'ACTIVO' ? 'is-success' : 'is-neutral'}">${escapeHtml(session.status || 'N/D')}</em>
    </section>

    <section class="bank-reference-card">
      <span>Referencia bancaria</span>
      <strong>BanQuito</strong>
      <p>Cliente verificado para consultas digitales, productos bancarios y servicios empresariales habilitados.</p>
    </section>

    <section class="profile-info-grid">
      ${[
        ['Usuario digital', session.username],
        ['Correo registrado', session.email],
        ['Telefono de contacto', session.mobilePhone],
        ['Ultimo ingreso', formatDate(session.lastLogin)],
      ]
        .map(([label, value]) => `
          <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value || 'N/D')}</dd>
          </div>
        `)
        .join('')}
    </section>

    <section class="profile-map-card">
      <div>
        <span>Ubicacion registrada</span>
        <strong>${escapeHtml(session.address || 'Direccion no disponible')}</strong>
      </div>
      <div class="map-lines" aria-hidden="true"></div>
    </section>
  `;
}

async function refreshAll() {
  await loadAccounts();
}

export {
  login,
  logout,
  showDashboard,
  activateSection,
  renderProfile,
  refreshAll,
};
