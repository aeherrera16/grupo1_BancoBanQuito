(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const d of n.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function s(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(a){if(a.ep)return;a.ep=!0;const n=s(a);fetch(a.href,n)}})();async function m(t,e={}){const s=await fetch(t,e),n=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){const d=typeof n=="object"?n.error||n.detail||n.message:n;throw new Error(d||`Error HTTP ${s.status}`)}return n}async function U(t,e){const s=await fetch(t);if(!s.ok){const d=await s.text();throw new Error(d||`Error HTTP ${s.status}`)}const o=await s.blob(),a=URL.createObjectURL(o),n=document.createElement("a");n.href=a,n.download=e,document.body.appendChild(n),n.click(),n.remove(),URL.revokeObjectURL(a)}async function M(){try{return await m("/api/core/actuator/health"),{coreUserId:1,coreStatus:"Banca disponible",switchStatus:null}}catch{return{coreUserId:1,coreStatus:"Banca no disponible",switchStatus:null}}}async function x(){try{return await m("/api/switch/switch/v1/switch/health"),"Pagos disponibles"}catch{return"Pagos no disponibles"}}async function R(t,e){return m("/api/core/core/v1/auth/customers/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:e})})}async function P(t,e){return m(`/api/core/core/v1/accounts/customer/${t}`,{headers:{"X-Core-User-Id":String(e)}})}async function H(t,e){return m(`/api/core/core/v1/accounts/customer/${t}/transactions`,{headers:{"X-Core-User-Id":String(e)}})}async function B(){return m("/api/switch/switch/v1/payment-batch")}async function J(){return(await m("/api/switch/switch/v1/billing/charges")).cargos||[]}async function q(){return(await m("/api/switch/switch/v1/billing/empresa-account")).cuentaEmpresa||null}async function j(t){const e=new FormData;return e.append("file",t),e.append("channel","WEB"),m("/api/switch/switch/v1/payment-batch/upload-csv",{method:"POST",body:e})}async function F(t){return m(`/api/switch/switch/v1/payment-batch/${t}/process`,{method:"POST"})}async function k(t,e){const s={summary:`/api/switch/switch/v1/billing/batches/${e}/summary`,detail:`/api/switch/switch/v1/billing/batches/${e}/detail`,history:`/api/switch/switch/v1/billing/batches/${e}/history`,charge:`/api/switch/switch/v1/billing/batches/${e}/charge`,receipt:`/api/switch/switch/v1/billing/batches/${e}/receipt`};return m(s[t])}async function V(t,e){const s={"receipt-pdf":`/api/switch/switch/v1/payment-batch/${e}/receipt`,"billing-novelties":`/api/switch/switch/v1/billing/batches/${e}/novelties`},o={"receipt-pdf":`recibo_lote_${e}.pdf`,"billing-novelties":`novedades_${e}.csv`};return await U(s[t],o[t]),o[t]}const y={session:null,customerType:"NATURAL",coreUserId:null,accounts:[],transactions:[],batches:[],charges:[],companyAccount:null};function c(){return y}function u(t){Object.assign(y,t)}function _(){y.session&&localStorage.setItem("banquitoSession",JSON.stringify({session:y.session,customerType:y.customerType}))}function z(){var e;const t=localStorage.getItem("banquitoSession");if(!t)return!1;try{const s=JSON.parse(t);return y.session=s.session,y.customerType=s.customerType||((e=s.session)==null?void 0:e.customerType)||"NATURAL",!0}catch{return localStorage.removeItem("banquitoSession"),!1}}function g(t){const e=Number(t||0);return new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD"}).format(e)}function C(t){if(!t)return"Sin fecha";const e=new Date(t);return Number.isNaN(e.getTime())?t:new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(e)}function T(t){const e=String(t||"").toUpperCase();return["ACTIVO","COMPLETADA","SUCCESS","PROCESADO","APROBADO"].some(s=>e.includes(s))?"is-success":["ERROR","RECHAZ","FALL","BLOQUEADO","INACTIVO"].some(s=>e.includes(s))?"is-danger":"is-neutral"}function X(t){const e=String(t||"N/D");return e.length>4?`**** ${e.slice(-4)}`:e}function K(t){return String(t||"").toUpperCase().includes("CREDITO")?"is-credit":"is-debit"}function r(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function h(t,e,s=""){t.textContent=e||"",t.classList.toggle("is-error",s==="error"),t.classList.toggle("is-success",s==="success")}const v=t=>document.querySelector(t);async function Q(){var e;const t=c();if((e=t.session)!=null&&e.customerId){try{const s=await P(t.session.customerId,t.coreUserId||1);u({accounts:s})}catch(s){u({accounts:[]}),v("#accountsList").innerHTML=`<div class="empty-state">${r(s.message)}</div>`}W()}}function W(){const t=c();v("#accountsMetric").textContent=t.accounts.length;const e=t.accounts.reduce((o,a)=>o+Number(a.availableBalance||0),0);v("#balanceMetric").textContent=g(e);const s=v("#accountsList");if(!t.accounts.length){s.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}s.innerHTML=t.accounts.map(o=>`
      <article class="account-card">
        <span>${r(o.accountSubtypeDescription||"Cuenta")}</span>
        <strong>${r(o.accountNumber||"Sin numero")}</strong>
        <dl>
          <div>
            <dt>Disponible</dt>
            <dd>${g(o.availableBalance)}</dd>
          </div>
          <div>
            <dt>Contable</dt>
            <dd>${g(o.accountingBalance)}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd><span class="badge ${T(o.status)}">${r(o.status||"N/D")}</span></dd>
          </div>
          <div>
            <dt>Agencia</dt>
            <dd>${r(o.branchName||"N/D")}</dd>
          </div>
        </dl>
      </article>
    `).join("")}const w=t=>document.querySelector(t);async function Z(){var e;const t=c();if((e=t.session)!=null&&e.customerId){try{const s=await H(t.session.customerId,t.coreUserId||1);u({transactions:s})}catch(s){u({transactions:[]}),w("#transactionsTable").innerHTML=`<div class="empty-state">${r(s.message)}</div>`}G()}}function G(){const t=c();w("#transactionsMetric").textContent=t.transactions.length;const e=w("#recentTransactions"),s=w("#transactionsTable");if(!t.transactions.length){const n='<div class="empty-state">Sin transacciones registradas.</div>';e.innerHTML=n,s.innerHTML=n;return}const a=`
    <table>
      <thead>
        <tr>
          <th>Cuenta</th>
          <th>Movimiento</th>
          <th>Monto</th>
          <th>Saldo resultante</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Descripcion</th>
          <th>UUID</th>
        </tr>
      </thead>
      <tbody>${t.transactions.map(n=>`
    <tr>
      <td>${r(n.accountNumber||"N/D")}</td>
      <td><span class="badge ${K(n.movementType)}">${r(n.movementType||"N/D")}</span></td>
      <td>${g(n.amount)}</td>
      <td>${g(n.resultingBalance)}</td>
      <td><span class="badge ${T(n.status)}">${r(n.status||"N/D")}</span></td>
      <td>${C(n.transactionDate)}</td>
      <td>${r(n.message||"N/D")}</td>
      <td><span title="${r(n.transactionUuid||"N/D")}">${r(Y(n.transactionUuid))}</span></td>
    </tr>
  `).join("")}</tbody>
    </table>
  `;s.innerHTML=a,e.innerHTML=`<div class="table-wrap compact-table">${a}</div>`}function Y(t){const e=String(t||"N/D");return e.length>14?`${e.slice(0,8)}...${e.slice(-4)}`:e}const p=t=>document.querySelector(t);function N(){var s;const t=c(),e=t.accounts.find(o=>o.isFavorite);return(e==null?void 0:e.accountNumber)||((s=t.accounts[0])==null?void 0:s.accountNumber)||null}async function A(){if(c().customerType==="JURIDICO"){try{const e=await B();u({batches:e})}catch(e){u({batches:[]}),p("#batchesTable").innerHTML=`<div class="empty-state">${r(e.message)}</div>`}st()}}async function tt(){if(c().customerType==="JURIDICO"){try{const e=await J();u({charges:e})}catch{u({charges:[]})}p("#chargesMetric").textContent=c().charges.length}}async function et(){if(c().customerType!=="JURIDICO")return;try{const o=await q();u({companyAccount:o})}catch{u({companyAccount:N()})}c().companyAccount||u({companyAccount:N()});const s=X(c().companyAccount);p("#companyAccountMetric").textContent=s,p("#companyAccountHero").textContent=s}function st(){const t=c();p("#batchesMetric").textContent=t.batches.length;const e=p("#batchesTable"),s=p("#recentBatches");if(!t.batches.length){const n='<div class="empty-state">Sin lotes cargados todavia.</div>';e.innerHTML=n,s.innerHTML=n;return}const a=`
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Archivo</th>
          <th>RUC</th>
          <th>Estado</th>
          <th>Registros</th>
          <th>Monto</th>
          <th>Recibido</th>
          <th>Accion</th>
        </tr>
      </thead>
      <tbody>${t.batches.slice().sort((n,d)=>(d.id||0)-(n.id||0)).map(n=>`
      <tr>
        <td>${r(n.id||"N/D")}</td>
        <td>${r(n.fileName||"Archivo CSV")}</td>
        <td>${r(n.ruc||"N/D")}</td>
        <td><span class="badge ${T(n.status)}">${r(n.status||"N/D")}</span></td>
        <td>${r(n.headerTotalRecords||0)}</td>
        <td>${g(n.headerTotalAmount)}</td>
        <td>${C(n.receivedAt)}</td>
        <td><button class="secondary-button" data-process="${r(n.id)}" type="button">Procesar</button></td>
      </tr>
    `).join("")}</tbody>
    </table>
  `;e.innerHTML=a,s.innerHTML=`<div class="table-wrap compact-table">${a}</div>`}async function nt(t){t.preventDefault();const e=p("#uploadMessage");if(c().customerType!=="JURIDICO"){h(e,"Solo clientes juridicos pueden enviar pagos masivos.","error");return}const o=p("#csvFile").files[0];if(!o){h(e,"Selecciona un archivo CSV.","error");return}h(e,"Procesando archivo de pagos...");try{const a=await j(o);h(e,`Resultado: ${a.validationResult||"procesado"} | Estado: ${a.batchStatus||"N/D"}`,"success"),await L()}catch(a){h(e,a.message||"No se pudo cargar el CSV.","error")}}async function ot(t){if(c().customerType==="JURIDICO")try{const s=await F(t);p("#reportOutput").textContent=typeof s=="string"?s:JSON.stringify(s,null,2),await L()}catch(s){p("#reportOutput").textContent=s.message}}async function L(){c().customerType==="JURIDICO"&&await Promise.all([A(),tt(),et()])}const i=t=>document.querySelector(t),b=t=>Array.from(document.querySelectorAll(t));async function at(t){t.preventDefault();const e=i("#loginMessage");h(e,"Validando credenciales...");const s=new FormData(t.currentTarget);try{const o=await R(s.get("username"),s.get("password")),a=o.customerType;if(!a)throw new Error("No se pudo identificar el tipo de cliente. Intenta nuevamente en unos minutos.");u({session:o,customerType:a}),_(),h(e,"Ingreso correcto.","success"),E(),await D()}catch(o){h(e,o.message||"No se pudo iniciar sesion.","error")}}function E(){var o,a,n,d,I;i('[data-view="login"]').classList.add("is-hidden"),i('[data-view="dashboard"]').classList.remove("is-hidden");const t=c(),e=t.customerType==="JURIDICO";i("#sessionType").textContent=e?"Cliente juridico":"Cliente natural",i("#sessionName").textContent=((o=t.session)==null?void 0:o.customerName)||((a=t.session)==null?void 0:a.username)||"Panel principal",i("#sessionMeta").textContent=`${((n=t.session)==null?void 0:n.identificationType)||"ID"} ${((d=t.session)==null?void 0:d.identification)||""}`.trim(),i("#sidebarType").textContent=e?"Perfil juridico":"Perfil natural",b(".company-only").forEach(S=>S.classList.toggle("is-hidden",!e)),b(".natural-only").forEach(S=>S.classList.toggle("is-hidden",e));const s=(I=i(".nav-item.is-active"))==null?void 0:I.dataset.section;!e&&["payments","reports"].includes(s)&&$("overview"),ct()}function rt(){const t=c();t.session=null,t.accounts=[],t.transactions=[],t.batches=[],t.charges=[],localStorage.removeItem("banquitoSession"),i("#loginForm").reset(),$("overview"),i('[data-view="dashboard"]').classList.add("is-hidden"),i('[data-view="login"]').classList.remove("is-hidden")}function $(t){!(c().customerType==="JURIDICO")&&["payments","reports"].includes(t)&&(t="overview"),b(".nav-item").forEach(o=>o.classList.toggle("is-active",o.dataset.section===t)),b("[data-section-panel]").forEach(o=>{o.classList.toggle("is-hidden",o.dataset.sectionPanel!==t)})}function ct(){const t=c();if(!t.session)return;const e=t.session;i("#profileName").textContent=e.customerName||"Informacion del cliente",i("#profileDetails").innerHTML=[["Tipo",t.customerType==="JURIDICO"?"Juridico":"Natural"],["Identificacion",`${e.identificationType||"N/D"} ${e.identification||""}`.trim()],["Usuario",e.username],["Correo",e.email],["Telefono",e.mobilePhone],["Direccion",e.address],["Estado credencial",e.status],["Ultimo ingreso",C(e.lastLogin)]].map(([s,o])=>`
      <div>
        <dt>${r(s)}</dt>
        <dd>${r(o||"N/D")}</dd>
      </div>
    `).join("")}async function D(){await Promise.all([Q(),Z(),L()])}const f=t=>document.querySelector(t);async function it(t){const e=f("#batchIdInput").value.trim();if(!e){f("#reportOutput").textContent="Ingresa el ID del lote.";return}try{const s=await k(t,e);f("#reportOutput").textContent=JSON.stringify(s,null,2)}catch(s){f("#reportOutput").textContent=s.message}}async function ut(t){const e=f("#batchIdInput").value.trim();if(!e){f("#reportOutput").textContent="Ingresa el ID del lote.";return}try{const s=await V(t,e);f("#reportOutput").textContent=`Descarga generada: ${s}`}catch(s){f("#reportOutput").textContent=s.message}}function dt(t){const e=t.trim().toLowerCase();document.querySelectorAll("tbody tr, .account-card").forEach(s=>{const o=!e||s.textContent.toLowerCase().includes(e);s.classList.toggle("is-filtered",!o)})}const l=t=>document.querySelector(t),O=t=>Array.from(document.querySelectorAll(t));async function lt(){const{coreUserId:t,coreStatus:e}=await M();u({coreUserId:t}),l("#coreStatus").textContent=e;const s=l("#portalCoreStatus");s&&(s.textContent=e);const o=await x();l("#switchStatus").textContent=o}function pt(){z()&&(E(),D())}function mt(){l("#loginForm").addEventListener("submit",at),l("#logoutButton").addEventListener("click",rt),l("#refreshButton").addEventListener("click",D),l("#globalSearch").addEventListener("input",t=>dt(t.target.value)),l("#uploadForm").addEventListener("submit",nt),l("#loadBatchesButton").addEventListener("click",A),l("#csvFile").addEventListener("change",t=>{var e;l("#fileName").textContent=((e=t.target.files[0])==null?void 0:e.name)||"Seleccionar CSV"}),O(".nav-item").forEach(t=>{t.addEventListener("click",()=>$(t.dataset.section))}),O("[data-section-shortcut]").forEach(t=>{t.addEventListener("click",()=>$(t.dataset.sectionShortcut))}),document.addEventListener("click",t=>{const e=t.target.closest("[data-process]");e&&ot(e.dataset.process);const s=t.target.closest("[data-report]");s&&it(s.dataset.report);const o=t.target.closest("[data-download]");o&&ut(o.dataset.download)})}mt();lt();pt();
