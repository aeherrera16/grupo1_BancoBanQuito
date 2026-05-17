(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}})();async function m(e,t={}){const s=await fetch(e,t),a=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){const r=typeof a=="object"?a.error||a.detail||a.message:a;throw new Error(r||`Error HTTP ${s.status}`)}return a}async function W(e,t){const s=await fetch(e);if(!s.ok){const r=await s.text();throw new Error(r||`Error HTTP ${s.status}`)}const o=await s.blob(),n=URL.createObjectURL(o),a=document.createElement("a");a.href=n,a.download=t,document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(n)}async function X(){try{return await m("/api/core/v1/health"),{coreUserId:1,coreStatus:"Banca disponible",switchStatus:null}}catch{return{coreUserId:1,coreStatus:"Banca no disponible",switchStatus:null}}}async function Z(){try{return await m("/api/switch/v1/switch/health"),"Pagos disponibles"}catch{return"Pagos no disponibles"}}async function Y(e,t){return m("/api/core/v1/auth/customers/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:t})})}async function ee(e,t,s){return m("/api/core/v1/auth/customers/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,currentPassword:t,newPassword:s})})}async function te(e,t){return m(`/api/core/v1/accounts/customer/${e}`,{headers:{"X-Core-User-Id":String(t)}})}async function se(e,t){return m(`/api/core/v1/accounts/customer/${e}/transactions`,{headers:{"X-Core-User-Id":String(t)}})}async function ne(){return m("/api/switch/v1/payment-batch")}async function oe(){return(await m("/api/switch/v1/billing/charges")).cargos||[]}async function ae(){return(await m("/api/switch/v1/billing/empresa-account")).cuentaEmpresa||null}async function re(e){const t=new FormData;return t.append("file",e),t.append("channel","PORTAL"),m("/api/switch/v1/payment-batch/upload-csv",{method:"POST",body:t})}async function ie(e){return m(`/api/switch/v1/payment-batch/${e}/process`,{method:"POST"})}async function ce(e,t){const s={summary:`/api/switch/v1/billing/batches/${t}/summary`,detail:`/api/switch/v1/billing/batches/${t}/detail`,history:`/api/switch/v1/billing/batches/${t}/history`,charge:`/api/switch/v1/billing/batches/${t}/charge`,receipt:`/api/switch/v1/billing/batches/${t}/receipt`};return m(s[e])}async function de(e,t){const s={"receipt-pdf":`/api/switch/v1/payment-batch/${t}/receipt`,"billing-novelties":`/api/switch/v1/billing/batches/${t}/novelties`},o={"receipt-pdf":`recibo_lote_${t}.pdf`,"billing-novelties":`novedades_${t}.csv`};return await W(s[e],o[e]),o[e]}const y={session:null,customerType:"NATURAL",coreUserId:null,accounts:[],transactions:[],batches:[],charges:[],companyAccount:null};function c(){return y}function u(e){Object.assign(y,e)}function k(){y.session&&localStorage.setItem("banquitoSession",JSON.stringify({session:y.session,customerType:y.customerType}))}function le(){var t;const e=localStorage.getItem("banquitoSession");if(!e)return!1;try{const s=JSON.parse(e);return y.session=s.session,y.customerType=s.customerType||((t=s.session)==null?void 0:t.customerType)||"NATURAL",!0}catch{return localStorage.removeItem("banquitoSession"),!1}}function f(e){const t=Number(e||0);return new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD"}).format(t)}function b(e){if(!e)return"Sin fecha";const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(t)}function w(e){const t=String(e||"").toUpperCase();return["ACTIVO","COMPLETADA","SUCCESS","PROCESADO","APROBADO"].some(s=>t.includes(s))?"is-success":["ERROR","RECHAZ","REJECT","FALL","BLOQUEADO","INACTIVO"].some(s=>t.includes(s))?"is-danger":"is-neutral"}function ue(e){const t=String(e||"N/D");return t.length>4?`**** ${t.slice(-4)}`:t}function pe(e){return String(e||"").toUpperCase().includes("CREDITO")?"is-credit":"is-debit"}function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function l(e,t,s=""){e.textContent=t||"",e.classList.toggle("is-error",s==="error"),e.classList.toggle("is-success",s==="success")}const C=e=>document.querySelector(e);async function me(){var t;const e=c();if((t=e.session)!=null&&t.customerId){try{const s=await te(e.session.customerId,e.coreUserId||1);u({accounts:s})}catch(s){u({accounts:[]}),C("#accountsTable").innerHTML=`<div class="empty-state">${i(s.message)}</div>`}fe()}}function fe(){const e=c();C("#accountsMetric").textContent=e.accounts.length;const t=e.accounts.reduce((n,a)=>n+Number(a.availableBalance||0),0);C("#balanceMetric").textContent=f(t),ge();const s=C("#accountsTable");if(!s)return;if(!e.accounts.length){s.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}const o=e.accounts.map(n=>`
      <tr>
        <td><strong>${i(n.accountNumber||"Sin numero")}</strong></td>
        <td>${i(n.accountSubtypeDescription||"Cuenta")}</td>
        <td>${f(n.accountingBalance)}</td>
        <td><strong class="amount-highlight" style="color: #02745c; font-size: 15px;">${f(n.availableBalance)}</strong></td>
        <td><span class="badge ${w(n.status)}">${i(n.status||"N/D")}</span></td>
        <td>${i(n.branchName||"N/D")}</td>
        <td>${n.openingDate?i(String(n.openingDate).split("T")[0]):"N/D"}</td>
      </tr>
    `).join("");s.innerHTML=`
    <table>
      <thead>
        <tr>
          <th>Número de Cuenta</th>
          <th>Tipo de Cuenta</th>
          <th>Saldo Contable</th>
          <th>Saldo Disponible</th>
          <th>Estado</th>
          <th>Agencia</th>
          <th>Fecha de Apertura</th>
        </tr>
      </thead>
      <tbody>${o}</tbody>
    </table>
  `}function ge(){const e=c(),t=C("#dashboardAccounts");if(t){if(!e.accounts.length){t.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}t.innerHTML=e.accounts.slice(0,3).map(s=>`
      <article class="dashboard-account-card">
        <span>${i(s.accountSubtypeDescription||"Cuenta")}</span>
        <strong>${i(s.accountNumber||"Sin numero")}</strong>
        <div>
          <small>Disponible</small>
          <b>${f(s.availableBalance)}</b>
        </div>
        <em class="badge ${w(s.status)}">${i(s.status||"N/D")}</em>
      </article>
    `).join("")}}const d=e=>document.querySelector(e),N=e=>Array.from(document.querySelectorAll(e));async function he(e){e.preventDefault();const t=d("#loginMessage");l(t,"Validando credenciales...");const s=new FormData(e.currentTarget),o=s.get("username"),n=s.get("password");try{const a=await Y(o,n);if(a.passwordChangeRequired){l(t,"Cambio de contraseña requerido.","success"),ve(o,n);return}const r=a.customerType;if(!r)throw new Error("No se pudo identificar el tipo de cliente. Intenta nuevamente en unos minutos.");u({session:a,customerType:r}),k(),l(t,"Ingreso correcto.","success"),M(),await D()}catch(a){l(t,a.message||"No se pudo iniciar sesion.","error")}}function ve(e,t){d('[data-view="login"]').classList.add("is-hidden"),d('[data-view="password-change"]').classList.remove("is-hidden");const s=d("#passwordChangeForm");d("#currentPassword").value=t,s.onsubmit=async o=>{o.preventDefault();const n=d("#passwordChangeMessage"),a=d("#newPassword").value,r=d("#confirmPassword").value;if(a!==r){l(n,"Las contraseñas no coinciden.","error");return}if(a===t){l(n,"La nueva contraseña debe ser diferente a la actual.","error");return}l(n,"Actualizando contraseña...");try{const h=await ee(e,t,a),$=h.customerType;u({session:h,customerType:$}),k(),l(n,"Contraseña actualizada con éxito.","success"),d('[data-view="password-change"]').classList.add("is-hidden"),M(),await D()}catch(h){l(n,h.message||"Error al cambiar la contraseña.","error")}}}function M(){var s,o,n,a;d('[data-view="login"]').classList.add("is-hidden"),d('[data-view="password-change"]').classList.add("is-hidden"),d('[data-view="dashboard"]').classList.remove("is-hidden");const e=c(),t=e.customerType==="JURIDICO";d("#sessionType").textContent=t?"Cliente juridico":"Cliente natural",d("#sessionName").textContent=((s=e.session)==null?void 0:s.customerName)||((o=e.session)==null?void 0:o.username)||"Panel principal",d("#sessionMeta").textContent=`${((n=e.session)==null?void 0:n.identificationType)||"ID"} ${((a=e.session)==null?void 0:a.identification)||""}`.trim(),d("#sidebarType").textContent=t?"Perfil juridico":"Perfil natural",N(".company-only").forEach(r=>r.classList.toggle("is-hidden",!t)),N(".natural-only").forEach(r=>r.classList.toggle("is-hidden",t)),U("overview"),window.scrollTo({top:0,left:0,behavior:"auto"}),be()}function ye(){const e=c();e.session=null,e.accounts=[],e.transactions=[],e.batches=[],e.charges=[],localStorage.removeItem("banquitoSession"),d("#loginForm").reset(),U("overview"),d('[data-view="dashboard"]').classList.add("is-hidden"),d('[data-view="login"]').classList.remove("is-hidden")}function U(e){!(c().customerType==="JURIDICO")&&["payments","reports"].includes(e)&&(e="overview"),N(".nav-item").forEach(o=>o.classList.toggle("is-active",o.dataset.section===e)),N("[data-section-panel]").forEach(o=>{o.classList.toggle("is-hidden",o.dataset.sectionPanel!==e)})}function be(){const e=c();if(!e.session)return;const t=e.session,s=e.customerType==="JURIDICO",o=t.customerName||"Informacion del cliente",n=`${t.identificationType||"ID"} ${t.identification||""}`.trim();d("#profileName").textContent=t.customerName||"Informacion del cliente",d("#profileDetails").innerHTML=`
    <section class="client-identity-card">
      <div class="client-avatar">${s?"CO":"CL"}</div>
      <div>
        <span>${s?"Cliente juridico":"Cliente natural"}</span>
        <strong>${i(o)}</strong>
        <small>${i(n||"Identificacion no disponible")}</small>
      </div>
      <em class="badge ${t.status==="ACTIVO"?"is-success":"is-neutral"}">${i(t.status||"N/D")}</em>
    </section>

    <section class="bank-reference-card">
      <span>Referencia bancaria</span>
      <strong>BanQuito</strong>
      <p>Cliente verificado para consultas digitales, productos bancarios y servicios empresariales habilitados.</p>
    </section>

    <section class="profile-info-grid">
      ${[["Usuario digital",t.username],["Correo registrado",t.email],["Telefono de contacto",t.mobilePhone],["Ultimo ingreso",b(t.lastLogin)]].map(([a,r])=>`
          <div>
            <dt>${i(a)}</dt>
            <dd>${i(r||"N/D")}</dd>
          </div>
        `).join("")}
    </section>

    <section class="profile-map-card">
      <div>
        <span>Ubicacion registrada</span>
        <strong>${i(t.address||"Direccion no disponible")}</strong>
      </div>
      <div class="map-lines" aria-hidden="true"></div>
    </section>
  `}async function D(){await me()}const A=e=>document.querySelector(e);async function J(){var t;const e=c();if((t=e.session)!=null&&t.customerId){try{const s=await se(e.session.customerId,e.coreUserId||1);u({transactions:s})}catch(s){u({transactions:[]}),A("#transactionsTable").innerHTML=`<div class="empty-state">${i(s.message)}</div>`}$e()}}function $e(){const e=c(),t=A("#transactionsMetric");t&&(t.textContent=e.transactions.length);const s=A("#recentTransactions"),o=A("#transactionsTable");if(!e.transactions.length){const r='<div class="empty-state">Sin transacciones registradas.</div>';s&&(s.innerHTML=r),o.innerHTML=r;return}const a=`
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
      <tbody>${e.transactions.map(r=>`
    <tr>
      <td>${i(r.accountNumber||"N/D")}</td>
      <td><span class="badge ${pe(r.movementType)}">${i(r.movementType||"N/D")}</span></td>
      <td>${f(r.amount)}</td>
      <td>${f(r.resultingBalance)}</td>
      <td><span class="badge ${w(r.status)}">${i(r.status||"N/D")}</span></td>
      <td>${b(r.transactionDate)}</td>
      <td>${i(r.message||"N/D")}</td>
      <td><span title="${i(r.transactionUuid||"N/D")}">${i(Ce(r.transactionUuid))}</span></td>
    </tr>
  `).join("")}</tbody>
    </table>
  `;o.innerHTML=a,s&&(s.innerHTML=`<div class="table-wrap compact-table">${a}</div>`)}function Ce(e){const t=String(e||"N/D");return t.length>14?`${t.slice(0,8)}...${t.slice(-4)}`:t}const E=e=>document.querySelector(e),Se={summary:"Resumen del lote",detail:"Detalle del lote",charge:"Cargo del lote",receipt:"Comprobante del lote"},we={id:"Referencia",fileName:"Archivo",ruc:"RUC",status:"Estado",headerTotalRecords:"Registros",headerTotalAmount:"Monto total",totalAmount:"Monto total",amount:"Monto",chargeAmount:"Valor comision",commissionAmount:"Valor comision",feeAmount:"Valor comision",totalChargeAmount:"Valor comision",chargeStatus:"Respuesta del proceso",commissionStatus:"Estado comision",chargeDate:"Fecha de cobro",receivedAt:"Recibido",createdAt:"Creado",processedAt:"Procesado",updatedAt:"Actualizado",validationResult:"Validacion",batchStatus:"Estado del lote",accountNumber:"Cuenta",description:"Descripcion",message:"Mensaje",notificationStatus:"Estado notif.",rejectionReason:"Motivo rechazo",lineNumber:"Linea",beneficiaryName:"Beneficiario",identification:"Identificacion",identificationNumber:"Identificacion",executedAt:"Ejecutado"},Ae=["fileName","ruc","status","validationResult","batchStatus","headerTotalRecords","totalRecords","processedRecords","successfulRecords","failedRecords","headerTotalAmount","totalAmount","amount","chargeAmount","receivedAt","processedAt","createdAt","message"],R=["chargeAmount","commissionAmount","feeAmount","amount","totalChargeAmount"],Te=["chargeStatus","commissionStatus","status","result"],Ne=["lineNumber","accountNumber","beneficiaryName","identification","identificationNumber","amount","status","validationResult","notificationStatus","rejectionReason","message","description","executedAt","createdAt","processedAt"],Re=new Set(["id","batchId","customerId","userId","createdBy","updatedBy","deletedBy","version","trace","stack","rawPayload","payload"]);function L(e,t){return!(t==null||t===""||Array.isArray(t)||typeof t=="object"||Re.has(e)||e.startsWith("_"))}function B(e){return we[e]||e.replace(/([A-Z])/g," $1").replace(/^./,t=>t.toUpperCase())}function z(e,t){if(t==null||t==="")return"N/D";const s=e.toLowerCase();return s.includes("amount")||s.includes("monto")||s.includes("balance")?f(t):s.includes("date")||s.includes("at")||s.includes("fecha")?b(t):String(t)}function Le(e){return String(e||"").trim().toUpperCase()}function T(e){return String((e==null?void 0:e.id)||(e==null?void 0:e.batchId)||(e==null?void 0:e.reference)||"")}function j(){var e,t;return((t=(e=E("#batchSelector"))==null?void 0:e.value)==null?void 0:t.trim())||""}function P(){const e=j();return c().batches.find(t=>T(t)===e)||null}function S(e,t){if(!e||typeof e!="object")return;const s=t.find(o=>e[o]!==void 0&&e[o]!==null&&e[o]!=="");return s?e[s]:void 0}function De(e,t){return!e||typeof e!="object"?!1:[e.batchId,e.paymentBatchId,e.loteId,e.idLote,e.reference].filter(s=>s!=null).some(s=>String(s)===String(t))}function Ee(e,t){const s=c().charges.find(o=>De(o,e));return s||(Array.isArray(t)?t.find(o=>S(o,R)):t&&typeof t=="object"&&S(t,R)?t:null)}function Ie(e,t){const s=Ee(e,t),o=Le(S(t,Te)),n=S(s,R)??S(t,R),a=Number(n||0)>0,r=["REJECTED","RECHAZADO","FAILED","ERROR"].some(K=>o.includes(K));if(!s&&!a&&!o)return"";const h=s||a?"Comision registrada":"Sin cargo confirmado",$=s||a?"is-success":"is-neutral",_=r&&(s||a)?"La respuesta del proceso vino rechazada, pero existe evidencia de comision registrada. No se interpreta como comision pendiente.":"Validado con la informacion operativa disponible para el lote.";return`
    <div class="charge-reconciliation">
      <div>
        <span>Estado operativo del cobro</span>
        <strong class="badge ${$}">${i(h)}</strong>
      </div>
      <div>
        <span>Valor comision</span>
        <strong>${i(f(n||0))}</strong>
      </div>
      <p>${i(_)}</p>
    </div>
  `}function Q(e){return`<span class="badge ${w(e)}">${i(e||"N/D")}</span>`}function Oe(e,t){return t&&typeof t=="object"&&!Array.isArray(t)?t.status||t.batchStatus||t.validationResult||(e==null?void 0:e.status)||"Generado":(e==null?void 0:e.status)||"Generado"}function Me(e,t,s,o){const a=c().session||{},r=new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(new Date),h=Oe(s,o),$=Se[e]||"Reporte del lote";return`
    <article class="bank-report">
      <header class="bank-report-cover">
        <div class="bank-report-brand">
          <span>BQ</span>
          <div>
            <strong>Banco BanQuito</strong>
            <small>Informe empresarial</small>
          </div>
        </div>
        <div class="bank-report-title">
          <span>Reporte generado</span>
          <h3>${i($)}</h3>
          <p>${i((s==null?void 0:s.fileName)||`Referencia de lote ${t}`)}</p>
        </div>
        <div class="bank-report-status">
          ${Q(h)}
          <small>Emitido ${i(r)}</small>
        </div>
      </header>

      <dl class="bank-report-context">
        <div>
          <dt>Cliente</dt>
          <dd>${i(a.customerName||"Cliente juridico")}</dd>
        </div>
        <div>
          <dt>Identificacion</dt>
          <dd>${i(`${a.identificationType||"RUC"} ${a.identification||(s==null?void 0:s.ruc)||"N/D"}`.trim())}</dd>
        </div>
        <div>
          <dt>Lote consultado</dt>
          <dd>${i((s==null?void 0:s.fileName)||`Lote ${t}`)}</dd>
        </div>
        <div>
          <dt>Fecha de recepcion</dt>
          <dd>${i(b(s==null?void 0:s.receivedAt))}</dd>
        </div>
      </dl>

      ${e==="charge"?Ie(t,o):""}

      <section class="bank-report-body">
        <div class="bank-report-section-title">
          <span>Contenido del informe</span>
          <strong>${i($)}</strong>
        </div>
        ${Be(o)}
      </section>

      <footer class="bank-report-footer">
        <span>Documento informativo generado desde Banca Web BanQuito.</span>
        <strong>Grupo 1 - Switch de pagos</strong>
      </footer>
    </article>
  `}function G(e){const t=E("#selectedBatchPreview");if(t){if(!e){t.className="selected-batch empty-state",t.innerHTML="Carga los lotes disponibles para elegir una operacion.";return}t.className="selected-batch",t.innerHTML=`
    <div>
      <span>Archivo</span>
      <strong>${i(e.fileName||"Archivo CSV")}</strong>
    </div>
    <div>
      <span>RUC</span>
      <strong>${i(e.ruc||"N/D")}</strong>
    </div>
    <div>
      <span>Estado</span>
      ${Q(e.status)}
    </div>
    <div>
      <span>Monto</span>
      <strong>${f(e.headerTotalAmount)}</strong>
    </div>
    <div>
      <span>Recibido</span>
      <strong>${i(b(e.receivedAt))}</strong>
    </div>
  `}}function x(){const e=E("#batchSelector");if(!e)return;const t=c(),s=e.value,o=t.batches.slice().sort((n,a)=>Number(a.id||a.batchId||0)-Number(n.id||n.batchId||0));e.innerHTML=['<option value="">Selecciona por archivo, RUC o fecha</option>',...o.map(n=>{const a=T(n),r=[n.fileName||"Archivo CSV",n.ruc?`RUC ${n.ruc}`:"RUC N/D",n.status||"Estado N/D",f(n.headerTotalAmount),b(n.receivedAt)].join(" - ");return`<option value="${i(a)}">${i(r)}</option>`})].join(""),s&&o.some(n=>T(n)===s)?e.value=s:o.length&&(e.value=T(o[0])),G(P())}function Ue(e){const t=Ae.filter(n=>Object.prototype.hasOwnProperty.call(e,n)).filter(n=>L(n,e[n])),s=Object.keys(e).filter(n=>!t.includes(n)).filter(n=>L(n,e[n])).slice(0,10-t.length),o=[...t,...s].map(n=>[n,e[n]]);return o.length?`
    <dl class="report-ledger">
      ${o.map(([n,a])=>`
        <div>
          <dt>${i(B(n))}</dt>
          <dd>${i(z(n,a))}</dd>
        </div>
      `).join("")}
    </dl>
  `:""}function F(e){if(!e.length)return'<div class="empty-state">Sin registros para mostrar.</div>';const t=Ne.filter(n=>e.some(a=>L(n,a==null?void 0:a[n]))),s=Array.from(e.reduce((n,a)=>(Object.keys(a||{}).forEach(r=>{!t.includes(r)&&L(r,a[r])&&n.add(r)}),n),new Set)).slice(0,Math.max(0,10-t.length)),o=[...t,...s];return o.length?`
    <div class="table-wrap report-table">
      <table>
        <thead>
          <tr>${o.map(n=>`<th>${i(B(n))}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${e.map(n=>`
            <tr>
              ${o.map(a=>`<td>${i(z(a,n==null?void 0:n[a]))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:'<div class="empty-state">El reporte no contiene campos operativos para mostrar.</div>'}function Be(e){if(Array.isArray(e))return F(e);if(!e||typeof e!="object")return`<div class="report-note">${i(e||"Sin datos.")}</div>`;const t=Object.entries(e).filter(([,s])=>Array.isArray(s)).map(([s,o])=>`
      <section class="report-section">
        <h3>${i(B(s))}</h3>
        ${F(o)}
      </section>
    `).join("");return`${Ue(e)}${t||'<div class="report-note">Sin movimientos o novedades relevantes para mostrar.</div>'}`}function v(e,t=""){const s=E("#reportOutput");s.classList.remove("is-error","is-success","is-info"),t&&s.classList.add(`is-${t}`),s.innerHTML=e}async function je(e){const t=j();if(!t){v('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de consultar.</span></div>',"error");return}try{v('<div class="report-empty"><strong>Consultando reporte...</strong><span>Estamos preparando la informacion del lote seleccionado.</span></div>');const s=await ce(e,t),o=P();v(Me(e,t,o,s))}catch(s){const o=s.message||"";if(o.includes("No service charge found")||o.includes("No hay cargo")){v(`
        <div class="report-empty">
          <strong>Lote en espera de procesamiento</strong>
          <span>Este lote se encuentra en estado ENCOLADO o PROGRAMADO. El reporte estará disponible automáticamente una vez que el banco procese la operación (en el siguiente corte o día hábil).</span>
        </div>
      `,"info");return}v(`<div class="report-empty"><strong>No se pudo consultar el reporte.</strong><span>${i(s.message)}</span></div>`,"error")}}async function Pe(e){const t=j();if(!t){v('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de descargar.</span></div>',"error");return}try{v('<div class="report-empty"><strong>Preparando descarga...</strong><span>El archivo se generara con la referencia interna del lote seleccionado.</span></div>');const s=await de(e,t);v(`
      <div class="download-card">
        <span>Descarga generada</span>
        <strong>${i(s)}</strong>
        <small>Operacion completada para el lote seleccionado.</small>
      </div>
    `,"success")}catch(s){const o=s.message||"";if(o.includes("No service charge found")||o.includes("No hay cargo")){v(`
        <div class="report-empty">
          <strong>Comprobante aún no generado</strong>
          <span>El lote aún no ha sido procesado por el sistema contable del banco. Podrás descargar el comprobante PDF una vez que el lote pase a estado EXITOSO.</span>
        </div>
      `,"info");return}v(`<div class="report-empty"><strong>No se pudo generar la descarga.</strong><span>${i(s.message)}</span></div>`,"error")}}const g=e=>document.querySelector(e);function H(){var s;const e=c(),t=e.accounts.find(o=>o.isFavorite);return(t==null?void 0:t.accountNumber)||((s=e.accounts[0])==null?void 0:s.accountNumber)||null}async function O(){if(c().customerType!=="JURIDICO")return;try{const s=await ne();u({batches:s})}catch(s){u({batches:[]}),g("#batchesTable").innerHTML=`<div class="empty-state">${i(s.message)}</div>`}He();const t=document.getElementById("batchesTable");t&&t.scrollIntoView({behavior:"smooth",block:"start"})}async function xe(){if(c().customerType!=="JURIDICO")return;try{const s=await oe();u({charges:s})}catch{u({charges:[]})}const t=g("#chargesMetric");t&&(t.textContent=c().charges.length)}async function Fe(){if(c().customerType!=="JURIDICO")return;try{const n=await ae();u({companyAccount:n})}catch{u({companyAccount:H()})}c().companyAccount||u({companyAccount:H()});const s=ue(c().companyAccount),o=g("#companyAccountMetric");o&&(o.textContent=s),g("#companyAccountHero").textContent=s}function He(){const e=c(),t=g("#batchesMetric");t&&(t.textContent=e.batches.length);const s=g("#batchesTable"),o=g("#recentBatches");if(!e.batches.length){const r='<div class="empty-state">Sin lotes cargados todavia.</div>';s.innerHTML=r,o&&(o.innerHTML=r);return}const a=`
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
        </tr>
      </thead>
      <tbody>${e.batches.slice().sort((r,h)=>(h.id||0)-(r.id||0)).map(r=>`
      <tr>
        <td>${i(r.id||"N/D")}</td>
        <td>${i(r.fileName||"Archivo CSV")}</td>
        <td>${i(r.ruc||"N/D")}</td>
        <td><span class="badge ${w(r.status)}">${i(r.status||"N/D")}</span></td>
        <td>${i(r.headerTotalRecords||0)}</td>
        <td>${f(r.headerTotalAmount)}</td>
        <td>${b(r.receivedAt)}</td>
        
      </tr>
    `).join("")}</tbody>
    </table>
  `;s.innerHTML=a,o&&(o.innerHTML=`<div class="table-wrap compact-table">${a}</div>`),x()}async function Ve(e){e.preventDefault();const t=g("#uploadMessage");if(c().customerType!=="JURIDICO"){l(t,"Solo clientes juridicos pueden enviar pagos masivos.","error");return}const o=g("#csvFile").files[0];if(!o){l(t,"Selecciona un archivo CSV.","error");return}l(t,"Procesando archivo de pagos...");try{const n=await re(o);l(t,`Resultado: ${n.validationResult||"procesado"} | Estado: ${n.batchStatus||"N/D"}`,"success"),await I()}catch(n){l(t,n.message||"No se pudo cargar el CSV.","error")}}async function qe(e){if(c().customerType==="JURIDICO")try{const s=await ie(e);g("#reportOutput").textContent=typeof s=="string"?s:JSON.stringify(s,null,2),await I()}catch(s){g("#reportOutput").textContent=s.message}}async function I(){c().customerType==="JURIDICO"&&await Promise.all([O(),xe(),Fe()])}function ke(e){const t=e.trim().toLowerCase();document.querySelectorAll("tbody tr, .account-card").forEach(s=>{const o=!t||s.textContent.toLowerCase().includes(t);s.classList.toggle("is-filtered",!o)})}const p=e=>document.querySelector(e),V=e=>Array.from(document.querySelectorAll(e));"scrollRestoration"in history&&(history.scrollRestoration="manual");async function Je(){const{coreUserId:e,coreStatus:t}=await X();u({coreUserId:e}),p("#coreStatus").textContent=t;const s=p("#portalCoreStatus");s&&(s.textContent=t);const o=await Z();p("#switchStatus").textContent=o}async function q(e){U(e),e==="transactions"&&await J(),(e==="payments"||e==="reports")&&(await I(),e==="reports"&&x())}function ze(){le()&&(M(),D())}function Qe(){p("#loginForm").addEventListener("submit",he),p("#logoutButton").addEventListener("click",ye),p("#refreshButton").addEventListener("click",async()=>{var t;await D();const e=(t=p(".nav-item.is-active"))==null?void 0:t.dataset.section;e==="transactions"&&await J(),(e==="payments"||e==="reports")&&(await I(),e==="reports"&&x())}),p("#globalSearch").addEventListener("input",e=>ke(e.target.value)),p("#uploadForm").addEventListener("submit",Ve),p("#loadBatchesButton").addEventListener("click",O),p("#batchSelector").addEventListener("change",()=>G(P())),p("#csvFile").addEventListener("change",e=>{var t;p("#fileName").textContent=((t=e.target.files[0])==null?void 0:t.name)||"Seleccionar CSV"}),V(".nav-item").forEach(e=>{e.addEventListener("click",()=>q(e.dataset.section))}),V("[data-section-shortcut]").forEach(e=>{e.addEventListener("click",()=>q(e.dataset.sectionShortcut))}),document.addEventListener("click",e=>{const t=e.target.closest("[data-process]");t&&qe(t.dataset.process);const s=e.target.closest("[data-report]");s&&je(s.dataset.report);const o=e.target.closest("[data-download]");o&&Pe(o.dataset.download),e.target.closest("[data-refresh-reports]")&&O(),e.target.closest("[data-feature-coming-soon]")&&alert("Estamos trabajando para tu futuro")})}Qe();Je();ze();
