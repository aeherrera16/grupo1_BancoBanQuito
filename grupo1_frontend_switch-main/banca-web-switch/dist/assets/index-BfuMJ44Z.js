(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}})();async function m(e,t={}){const s=await fetch(e,t),a=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){const i=typeof a=="object"?a.error||a.detail||a.message:a;throw new Error(i||`Error HTTP ${s.status}`)}return a}async function Y(e,t){const s=await fetch(e);if(!s.ok){const i=await s.text();throw new Error(i||`Error HTTP ${s.status}`)}const o=await s.blob(),n=URL.createObjectURL(o),a=document.createElement("a");a.href=n,a.download=t,document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(n)}async function ee(){try{return await m("/api/core/v1/health"),{coreUserId:1,coreStatus:"Banca disponible",switchStatus:null}}catch{return{coreUserId:1,coreStatus:"Banca no disponible",switchStatus:null}}}async function te(){try{return await m("/api/switch/v1/switch/health"),"Pagos disponibles"}catch{return"Pagos no disponibles"}}async function se(e,t){return m("/api/core/v1/auth/customers/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:t})})}async function ne(e,t,s){return m("/api/core/v1/auth/customers/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,currentPassword:t,newPassword:s})})}async function oe(e,t){return m(`/api/core/v1/accounts/customer/${e}`,{headers:{"X-Core-User-Id":String(t)}})}async function ae(e,t){return m(`/api/core/v1/accounts/customer/${e}/transactions`,{headers:{"X-Core-User-Id":String(t)}})}async function z(){return m("/api/switch/v1/payment-batch")}async function re(){return(await m("/api/switch/v1/billing/charges")).cargos||[]}async function ie(){return(await m("/api/switch/v1/billing/empresa-account")).cuentaEmpresa||null}async function ce(e){const t=new FormData;return t.append("file",e),t.append("channel","PORTAL"),m("/api/switch/v1/payment-batch/upload-csv",{method:"POST",body:t})}async function de(e,t){const s=new FormData;s.append("file",e),s.append("channel","SFTP");const n=getState().session;return n&&n.identification&&s.append("ruc",n.identification),t&&s.append("scheduledDate",t+":00"),m("/api/switch/v1/payment-batch/upload-csv",{method:"POST",body:s})}async function le(e){return m(`/api/switch/v1/payment-batch/${e}/process`,{method:"POST"})}async function ue(e,t){const s={summary:`/api/switch/v1/billing/batches/${t}/summary`,detail:`/api/switch/v1/billing/batches/${t}/detail`,history:`/api/switch/v1/billing/batches/${t}/history`,charge:`/api/switch/v1/billing/batches/${t}/charge`,receipt:`/api/switch/v1/billing/batches/${t}/receipt`};return m(s[e])}async function pe(e,t){const s={"receipt-pdf":`/api/switch/v1/payment-batch/${t}/receipt`,"billing-novelties":`/api/switch/v1/billing/batches/${t}/novelties`},o={"receipt-pdf":`recibo_lote_${t}.pdf`,"billing-novelties":`novedades_${t}.csv`};return await Y(s[e],o[e]),o[e]}const $={session:null,customerType:"NATURAL",coreUserId:null,accounts:[],transactions:[],batches:[],charges:[],companyAccount:null};function c(){return $}function p(e){Object.assign($,e)}function G(){$.session&&localStorage.setItem("banquitoSession",JSON.stringify({session:$.session,customerType:$.customerType}))}function me(){var t;const e=localStorage.getItem("banquitoSession");if(!e)return!1;try{const s=JSON.parse(e);return $.session=s.session,$.customerType=s.customerType||((t=s.session)==null?void 0:t.customerType)||"NATURAL",!0}catch{return localStorage.removeItem("banquitoSession"),!1}}function f(e){const t=Number(e||0);return new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD"}).format(t)}function y(e){if(!e)return"Sin fecha";const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(t)}function C(e){const t=String(e||"").toUpperCase();return["ACTIVO","COMPLETADA","SUCCESS","PROCESADO","APROBADO"].some(s=>t.includes(s))?"is-success":["ERROR","RECHAZ","REJECT","FALL","BLOQUEADO","INACTIVO"].some(s=>t.includes(s))?"is-danger":"is-neutral"}function fe(e){const t=String(e||"N/D");return t.length>4?`**** ${t.slice(-4)}`:t}function he(e){return String(e||"").toUpperCase().includes("CREDITO")?"is-credit":"is-debit"}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function l(e,t,s=""){e.textContent=t||"",e.classList.toggle("is-error",s==="error"),e.classList.toggle("is-success",s==="success")}const w=e=>document.querySelector(e);async function ge(){var t;const e=c();if((t=e.session)!=null&&t.customerId){try{const s=await oe(e.session.customerId,e.coreUserId||1);p({accounts:s})}catch(s){p({accounts:[]}),w("#accountsTable").innerHTML=`<div class="empty-state">${r(s.message)}</div>`}ve()}}function ve(){const e=c();w("#accountsMetric").textContent=e.accounts.length;const t=e.accounts.reduce((n,a)=>n+Number(a.availableBalance||0),0);w("#balanceMetric").textContent=f(t),ye();const s=w("#accountsTable");if(!s)return;if(!e.accounts.length){s.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}const o=e.accounts.map(n=>`
      <tr>
        <td><strong>${r(n.accountNumber||"Sin numero")}</strong></td>
        <td>${r(n.accountSubtypeDescription||"Cuenta")}</td>
        <td>${f(n.accountingBalance)}</td>
        <td><strong class="amount-highlight" style="color: #02745c; font-size: 15px;">${f(n.availableBalance)}</strong></td>
        <td><span class="badge ${C(n.status)}">${r(n.status||"N/D")}</span></td>
        <td>${r(n.branchName||"N/D")}</td>
        <td>${n.openingDate?r(String(n.openingDate).split("T")[0]):"N/D"}</td>
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
  `}function ye(){const e=c(),t=w("#dashboardAccounts");if(t){if(!e.accounts.length){t.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}t.innerHTML=e.accounts.slice(0,3).map(s=>`
      <article class="dashboard-account-card">
        <span>${r(s.accountSubtypeDescription||"Cuenta")}</span>
        <strong>${r(s.accountNumber||"Sin numero")}</strong>
        <div>
          <small>Disponible</small>
          <b>${f(s.availableBalance)}</b>
        </div>
        <em class="badge ${C(s.status)}">${r(s.status||"N/D")}</em>
      </article>
    `).join("")}}const d=e=>document.querySelector(e),D=e=>Array.from(document.querySelectorAll(e));async function be(e){e.preventDefault();const t=d("#loginMessage");l(t,"Validando credenciales...");const s=new FormData(e.currentTarget),o=s.get("username"),n=s.get("password");try{const a=await se(o,n);if(a.passwordChangeRequired){l(t,"Cambio de contraseña requerido.","success"),$e(o,n);return}const i=a.customerType;if(!i)throw new Error("No se pudo identificar el tipo de cliente. Intenta nuevamente en unos minutos.");p({session:a,customerType:i}),G(),l(t,"Ingreso correcto.","success"),U(),await I()}catch(a){l(t,a.message||"No se pudo iniciar sesion.","error")}}function $e(e,t){d('[data-view="login"]').classList.add("is-hidden"),d('[data-view="password-change"]').classList.remove("is-hidden");const s=d("#passwordChangeForm");d("#currentPassword").value=t,s.onsubmit=async o=>{o.preventDefault();const n=d("#passwordChangeMessage"),a=d("#newPassword").value,i=d("#confirmPassword").value;if(a!==i){l(n,"Las contraseñas no coinciden.","error");return}if(a===t){l(n,"La nueva contraseña debe ser diferente a la actual.","error");return}l(n,"Actualizando contraseña...");try{const g=await ne(e,t,a),S=g.customerType;p({session:g,customerType:S}),G(),l(n,"Contraseña actualizada con éxito.","success"),d('[data-view="password-change"]').classList.add("is-hidden"),U(),await I()}catch(g){l(n,g.message||"Error al cambiar la contraseña.","error")}}}function U(){var s,o,n,a;d('[data-view="login"]').classList.add("is-hidden"),d('[data-view="password-change"]').classList.add("is-hidden"),d('[data-view="dashboard"]').classList.remove("is-hidden");const e=c(),t=e.customerType==="JURIDICO";d("#sessionType").textContent=t?"Cliente juridico":"Cliente natural",d("#sessionName").textContent=((s=e.session)==null?void 0:s.customerName)||((o=e.session)==null?void 0:o.username)||"Panel principal",d("#sessionMeta").textContent=`${((n=e.session)==null?void 0:n.identificationType)||"ID"} ${((a=e.session)==null?void 0:a.identification)||""}`.trim(),d("#sidebarType").textContent=t?"Perfil juridico":"Perfil natural",D(".company-only").forEach(i=>i.classList.toggle("is-hidden",!t)),D(".natural-only").forEach(i=>i.classList.toggle("is-hidden",t)),j("overview"),window.scrollTo({top:0,left:0,behavior:"auto"}),Ce()}function Se(){const e=c();e.session=null,e.accounts=[],e.transactions=[],e.batches=[],e.charges=[],localStorage.removeItem("banquitoSession"),d("#loginForm").reset(),j("overview"),d('[data-view="dashboard"]').classList.add("is-hidden"),d('[data-view="login"]').classList.remove("is-hidden")}function j(e){!(c().customerType==="JURIDICO")&&["payments","reports","sftp"].includes(e)&&(e="overview"),D(".nav-item").forEach(o=>o.classList.toggle("is-active",o.dataset.section===e)),D("[data-section-panel]").forEach(o=>{o.classList.toggle("is-hidden",o.dataset.sectionPanel!==e)})}function Ce(){const e=c();if(!e.session)return;const t=e.session,s=e.customerType==="JURIDICO",o=t.customerName||"Informacion del cliente",n=`${t.identificationType||"ID"} ${t.identification||""}`.trim();d("#profileName").textContent=t.customerName||"Informacion del cliente",d("#profileDetails").innerHTML=`
    <section class="client-identity-card">
      <div class="client-avatar">${s?"CO":"CL"}</div>
      <div>
        <span>${s?"Cliente juridico":"Cliente natural"}</span>
        <strong>${r(o)}</strong>
        <small>${r(n||"Identificacion no disponible")}</small>
      </div>
      <em class="badge ${t.status==="ACTIVO"?"is-success":"is-neutral"}">${r(t.status||"N/D")}</em>
    </section>

    <section class="bank-reference-card">
      <span>Referencia bancaria</span>
      <strong>BanQuito</strong>
      <p>Cliente verificado para consultas digitales, productos bancarios y servicios empresariales habilitados.</p>
    </section>

    <section class="profile-info-grid">
      ${[["Usuario digital",t.username],["Correo registrado",t.email],["Telefono de contacto",t.mobilePhone],["Ultimo ingreso",y(t.lastLogin)]].map(([a,i])=>`
          <div>
            <dt>${r(a)}</dt>
            <dd>${r(i||"N/D")}</dd>
          </div>
        `).join("")}
    </section>

    <section class="profile-map-card">
      <div>
        <span>Ubicacion registrada</span>
        <strong>${r(t.address||"Direccion no disponible")}</strong>
      </div>
      <div class="map-lines" aria-hidden="true"></div>
    </section>
  `}async function I(){await ge()}const A=e=>document.querySelector(e);async function Q(){var t;const e=c();if((t=e.session)!=null&&t.customerId){try{const s=await ae(e.session.customerId,e.coreUserId||1);p({transactions:s})}catch(s){p({transactions:[]}),A("#transactionsTable").innerHTML=`<div class="empty-state">${r(s.message)}</div>`}we()}}function we(){const e=c(),t=A("#transactionsMetric");t&&(t.textContent=e.transactions.length);const s=A("#recentTransactions"),o=A("#transactionsTable");if(!e.transactions.length){const i='<div class="empty-state">Sin transacciones registradas.</div>';s&&(s.innerHTML=i),o.innerHTML=i;return}const a=`
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
      <tbody>${e.transactions.map(i=>`
    <tr>
      <td>${r(i.accountNumber||"N/D")}</td>
      <td><span class="badge ${he(i.movementType)}">${r(i.movementType||"N/D")}</span></td>
      <td>${f(i.amount)}</td>
      <td>${f(i.resultingBalance)}</td>
      <td><span class="badge ${C(i.status)}">${r(i.status||"N/D")}</span></td>
      <td>${y(i.transactionDate)}</td>
      <td>${r(i.message||"N/D")}</td>
      <td><span title="${r(i.transactionUuid||"N/D")}">${r(Te(i.transactionUuid))}</span></td>
    </tr>
  `).join("")}</tbody>
    </table>
  `;o.innerHTML=a,s&&(s.innerHTML=`<div class="table-wrap compact-table">${a}</div>`)}function Te(e){const t=String(e||"N/D");return t.length>14?`${t.slice(0,8)}...${t.slice(-4)}`:t}const O=e=>document.querySelector(e),Ae={summary:"Resumen del lote",detail:"Detalle del lote",charge:"Cargo del lote",receipt:"Comprobante del lote"},Ne={id:"Referencia",fileName:"Archivo",ruc:"RUC",status:"Estado",headerTotalRecords:"Registros",headerTotalAmount:"Monto total",totalAmount:"Monto total",amount:"Monto",chargeAmount:"Valor comision",commissionAmount:"Valor comision",feeAmount:"Valor comision",totalChargeAmount:"Valor comision",chargeStatus:"Respuesta del proceso",commissionStatus:"Estado comision",chargeDate:"Fecha de cobro",receivedAt:"Recibido",createdAt:"Creado",processedAt:"Procesado",updatedAt:"Actualizado",validationResult:"Validacion",batchStatus:"Estado del lote",accountNumber:"Cuenta",description:"Descripcion",message:"Mensaje",notificationStatus:"Estado notif.",rejectionReason:"Motivo rechazo",lineNumber:"Linea",beneficiaryName:"Beneficiario",identification:"Identificacion",identificationNumber:"Identificacion",executedAt:"Ejecutado"},De=["fileName","ruc","status","validationResult","batchStatus","headerTotalRecords","totalRecords","processedRecords","successfulRecords","failedRecords","headerTotalAmount","totalAmount","amount","chargeAmount","receivedAt","processedAt","createdAt","message"],R=["chargeAmount","commissionAmount","feeAmount","amount","totalChargeAmount"],Re=["chargeStatus","commissionStatus","status","result"],Le=["lineNumber","accountNumber","beneficiaryName","identification","identificationNumber","amount","status","validationResult","notificationStatus","rejectionReason","message","description","executedAt","createdAt","processedAt"],Ee=new Set(["id","batchId","customerId","userId","createdBy","updatedBy","deletedBy","version","trace","stack","rawPayload","payload"]);function L(e,t){return!(t==null||t===""||Array.isArray(t)||typeof t=="object"||Ee.has(e)||e.startsWith("_"))}function P(e){return Ne[e]||e.replace(/([A-Z])/g," $1").replace(/^./,t=>t.toUpperCase())}function _(e,t){if(t==null||t==="")return"N/D";const s=e.toLowerCase();return s.includes("amount")||s.includes("monto")||s.includes("balance")?f(t):s.includes("date")||s.includes("at")||s.includes("fecha")?y(t):String(t)}function Ie(e){return String(e||"").trim().toUpperCase()}function N(e){return String((e==null?void 0:e.id)||(e==null?void 0:e.batchId)||(e==null?void 0:e.reference)||"")}function F(){var e,t;return((t=(e=O("#batchSelector"))==null?void 0:e.value)==null?void 0:t.trim())||""}function x(){const e=F();return c().batches.find(t=>N(t)===e)||null}function T(e,t){if(!e||typeof e!="object")return;const s=t.find(o=>e[o]!==void 0&&e[o]!==null&&e[o]!=="");return s?e[s]:void 0}function Oe(e,t){return!e||typeof e!="object"?!1:[e.batchId,e.paymentBatchId,e.loteId,e.idLote,e.reference].filter(s=>s!=null).some(s=>String(s)===String(t))}function Me(e,t){const s=c().charges.find(o=>Oe(o,e));return s||(Array.isArray(t)?t.find(o=>T(o,R)):t&&typeof t=="object"&&T(t,R)?t:null)}function Be(e,t){const s=Me(e,t),o=Ie(T(t,Re)),n=T(s,R)??T(t,R),a=Number(n||0)>0,i=["REJECTED","RECHAZADO","FAILED","ERROR"].some(Z=>o.includes(Z));if(!s&&!a&&!o)return"";const g=s||a?"Comision registrada":"Sin cargo confirmado",S=s||a?"is-success":"is-neutral",X=i&&(s||a)?"La respuesta del proceso vino rechazada, pero existe evidencia de comision registrada. No se interpreta como comision pendiente.":"Validado con la informacion operativa disponible para el lote.";return`
    <div class="charge-reconciliation">
      <div>
        <span>Estado operativo del cobro</span>
        <strong class="badge ${S}">${r(g)}</strong>
      </div>
      <div>
        <span>Valor comision</span>
        <strong>${r(f(n||0))}</strong>
      </div>
      <p>${r(X)}</p>
    </div>
  `}function K(e){return`<span class="badge ${C(e)}">${r(e||"N/D")}</span>`}function Ue(e,t){return t&&typeof t=="object"&&!Array.isArray(t)?t.status||t.batchStatus||t.validationResult||(e==null?void 0:e.status)||"Generado":(e==null?void 0:e.status)||"Generado"}function je(e,t,s,o){const a=c().session||{},i=new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(new Date),g=Ue(s,o),S=Ae[e]||"Reporte del lote";return`
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
          <h3>${r(S)}</h3>
          <p>${r((s==null?void 0:s.fileName)||`Referencia de lote ${t}`)}</p>
        </div>
        <div class="bank-report-status">
          ${K(g)}
          <small>Emitido ${r(i)}</small>
        </div>
      </header>

      <dl class="bank-report-context">
        <div>
          <dt>Cliente</dt>
          <dd>${r(a.customerName||"Cliente juridico")}</dd>
        </div>
        <div>
          <dt>Identificacion</dt>
          <dd>${r(`${a.identificationType||"RUC"} ${a.identification||(s==null?void 0:s.ruc)||"N/D"}`.trim())}</dd>
        </div>
        <div>
          <dt>Lote consultado</dt>
          <dd>${r((s==null?void 0:s.fileName)||`Lote ${t}`)}</dd>
        </div>
        <div>
          <dt>Fecha de recepcion</dt>
          <dd>${r(y(s==null?void 0:s.receivedAt))}</dd>
        </div>
      </dl>

      ${e==="charge"?Be(t,o):""}

      <section class="bank-report-body">
        <div class="bank-report-section-title">
          <span>Contenido del informe</span>
          <strong>${r(S)}</strong>
        </div>
        ${Fe(o)}
      </section>

      <footer class="bank-report-footer">
        <span>Documento informativo generado desde Banca Web BanQuito.</span>
        <strong>Grupo 1 - Switch de pagos</strong>
      </footer>
    </article>
  `}function W(e){const t=O("#selectedBatchPreview");if(t){if(!e){t.className="selected-batch empty-state",t.innerHTML="Carga los lotes disponibles para elegir una operacion.";return}t.className="selected-batch",t.innerHTML=`
    <div>
      <span>Archivo</span>
      <strong>${r(e.fileName||"Archivo CSV")}</strong>
    </div>
    <div>
      <span>RUC</span>
      <strong>${r(e.ruc||"N/D")}</strong>
    </div>
    <div>
      <span>Estado</span>
      ${K(e.status)}
    </div>
    <div>
      <span>Monto</span>
      <strong>${f(e.headerTotalAmount)}</strong>
    </div>
    <div>
      <span>Recibido</span>
      <strong>${r(y(e.receivedAt))}</strong>
    </div>
  `}}function H(){const e=O("#batchSelector");if(!e)return;const t=c(),s=e.value,o=t.batches.slice().sort((n,a)=>Number(a.id||a.batchId||0)-Number(n.id||n.batchId||0));e.innerHTML=['<option value="">Selecciona por archivo, RUC o fecha</option>',...o.map(n=>{const a=N(n),i=[n.fileName||"Archivo CSV",n.ruc?`RUC ${n.ruc}`:"RUC N/D",n.status||"Estado N/D",f(n.headerTotalAmount),y(n.receivedAt)].join(" - ");return`<option value="${r(a)}">${r(i)}</option>`})].join(""),s&&o.some(n=>N(n)===s)?e.value=s:o.length&&(e.value=N(o[0])),W(x())}function Pe(e){const t=De.filter(n=>Object.prototype.hasOwnProperty.call(e,n)).filter(n=>L(n,e[n])),s=Object.keys(e).filter(n=>!t.includes(n)).filter(n=>L(n,e[n])).slice(0,10-t.length),o=[...t,...s].map(n=>[n,e[n]]);return o.length?`
    <dl class="report-ledger">
      ${o.map(([n,a])=>`
        <div>
          <dt>${r(P(n))}</dt>
          <dd>${r(_(n,a))}</dd>
        </div>
      `).join("")}
    </dl>
  `:""}function V(e){if(!e.length)return'<div class="empty-state">Sin registros para mostrar.</div>';const t=Le.filter(n=>e.some(a=>L(n,a==null?void 0:a[n]))),s=Array.from(e.reduce((n,a)=>(Object.keys(a||{}).forEach(i=>{!t.includes(i)&&L(i,a[i])&&n.add(i)}),n),new Set)).slice(0,Math.max(0,10-t.length)),o=[...t,...s];return o.length?`
    <div class="table-wrap report-table">
      <table>
        <thead>
          <tr>${o.map(n=>`<th>${r(P(n))}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${e.map(n=>`
            <tr>
              ${o.map(a=>`<td>${r(_(a,n==null?void 0:n[a]))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:'<div class="empty-state">El reporte no contiene campos operativos para mostrar.</div>'}function Fe(e){if(Array.isArray(e))return V(e);if(!e||typeof e!="object")return`<div class="report-note">${r(e||"Sin datos.")}</div>`;const t=Object.entries(e).filter(([,s])=>Array.isArray(s)).map(([s,o])=>`
      <section class="report-section">
        <h3>${r(P(s))}</h3>
        ${V(o)}
      </section>
    `).join("");return`${Pe(e)}${t||'<div class="report-note">Sin movimientos o novedades relevantes para mostrar.</div>'}`}function v(e,t=""){const s=O("#reportOutput");s.classList.remove("is-error","is-success","is-info"),t&&s.classList.add(`is-${t}`),s.innerHTML=e}async function xe(e){const t=F();if(!t){v('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de consultar.</span></div>',"error");return}try{v('<div class="report-empty"><strong>Consultando reporte...</strong><span>Estamos preparando la informacion del lote seleccionado.</span></div>');const s=await ue(e,t),o=x();v(je(e,t,o,s))}catch(s){const o=s.message||"";if(o.includes("No service charge found")||o.includes("No hay cargo")){v(`
        <div class="report-empty">
          <strong>Lote en espera de procesamiento</strong>
          <span>Este lote se encuentra en estado ENCOLADO o PROGRAMADO. El reporte estará disponible automáticamente una vez que el banco procese la operación (en el siguiente corte o día hábil).</span>
        </div>
      `,"info");return}v(`<div class="report-empty"><strong>No se pudo consultar el reporte.</strong><span>${r(s.message)}</span></div>`,"error")}}async function He(e){const t=F();if(!t){v('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de descargar.</span></div>',"error");return}try{v('<div class="report-empty"><strong>Preparando descarga...</strong><span>El archivo se generara con la referencia interna del lote seleccionado.</span></div>');const s=await pe(e,t);v(`
      <div class="download-card">
        <span>Descarga generada</span>
        <strong>${r(s)}</strong>
        <small>Operacion completada para el lote seleccionado.</small>
      </div>
    `,"success")}catch(s){const o=s.message||"";if(o.includes("No service charge found")||o.includes("No hay cargo")){v(`
        <div class="report-empty">
          <strong>Comprobante aún no generado</strong>
          <span>El lote aún no ha sido procesado por el sistema contable del banco. Podrás descargar el comprobante PDF una vez que el lote pase a estado EXITOSO.</span>
        </div>
      `,"info");return}v(`<div class="report-empty"><strong>No se pudo generar la descarga.</strong><span>${r(s.message)}</span></div>`,"error")}}const h=e=>document.querySelector(e);function q(){var s;const e=c(),t=e.accounts.find(o=>o.isFavorite);return(t==null?void 0:t.accountNumber)||((s=e.accounts[0])==null?void 0:s.accountNumber)||null}async function B(){if(c().customerType!=="JURIDICO")return;try{const s=await z();p({batches:s})}catch(s){p({batches:[]}),h("#batchesTable").innerHTML=`<div class="empty-state">${r(s.message)}</div>`}Je();const t=document.getElementById("batchesTable");t&&t.scrollIntoView({behavior:"smooth",block:"start"})}async function Ve(){if(c().customerType!=="JURIDICO")return;try{const s=await re();p({charges:s})}catch{p({charges:[]})}const t=h("#chargesMetric");t&&(t.textContent=c().charges.length)}async function qe(){if(c().customerType!=="JURIDICO")return;try{const n=await ie();p({companyAccount:n})}catch{p({companyAccount:q()})}c().companyAccount||p({companyAccount:q()});const s=fe(c().companyAccount),o=h("#companyAccountMetric");o&&(o.textContent=s),h("#companyAccountHero").textContent=s}function Je(){const e=c(),t=h("#batchesMetric");t&&(t.textContent=e.batches.length);const s=h("#batchesTable"),o=h("#recentBatches");if(!e.batches.length){const i='<div class="empty-state">Sin lotes cargados todavia.</div>';s.innerHTML=i,o&&(o.innerHTML=i);return}const a=`
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
      <tbody>${e.batches.slice().sort((i,g)=>(g.id||0)-(i.id||0)).map(i=>`
      <tr>
        <td>${r(i.id||"N/D")}</td>
        <td>${r(i.fileName||"Archivo CSV")}</td>
        <td>${r(i.ruc||"N/D")}</td>
        <td><span class="badge ${C(i.status)}">${r(i.status||"N/D")}</span></td>
        <td>${r(i.headerTotalRecords||0)}</td>
        <td>${f(i.headerTotalAmount)}</td>
        <td>${y(i.receivedAt)}</td>
        
      </tr>
    `).join("")}</tbody>
    </table>
  `;s.innerHTML=a,o&&(o.innerHTML=`<div class="table-wrap compact-table">${a}</div>`),H()}async function ke(e){e.preventDefault();const t=h("#uploadMessage");if(c().customerType!=="JURIDICO"){l(t,"Solo clientes juridicos pueden enviar pagos masivos.","error");return}const o=h("#csvFile").files[0];if(!o){l(t,"Selecciona un archivo CSV.","error");return}l(t,"Procesando archivo de pagos...");try{const n=await ce(o);l(t,`Resultado: ${n.validationResult||"procesado"} | Estado: ${n.batchStatus||"N/D"}`,"success"),await M()}catch(n){l(t,n.message||"No se pudo cargar el CSV.","error")}}async function ze(e){if(c().customerType==="JURIDICO")try{const s=await le(e);h("#reportOutput").textContent=typeof s=="string"?s:JSON.stringify(s,null,2),await M()}catch(s){h("#reportOutput").textContent=s.message}}async function M(){c().customerType==="JURIDICO"&&await Promise.all([B(),Ve(),qe()])}function Ge(e){const t=e.trim().toLowerCase();document.querySelectorAll("tbody tr, .account-card").forEach(s=>{const o=!t||s.textContent.toLowerCase().includes(t);s.classList.toggle("is-filtered",!o)})}const b=e=>document.querySelector(e);async function E(){var t;const e=c();if(e.customerType==="JURIDICO"){try{const s=await z(),o=(t=e.session)==null?void 0:t.identification,n=s.filter(a=>!o||a.ruc===o);p({sftpBatches:n})}catch(s){p({sftpBatches:[]});const o=b("#sftpBatchesTable");o&&(o.innerHTML=`<div class="empty-state">${r(s.message)}</div>`)}Qe()}}function Qe(){const t=c().sftpBatches||[],s=b("#sftpBatchesTable");if(!s)return;if(!t.length){s.innerHTML='<div class="empty-state">No se encontraron lotes del buzón SFTP.</div>';return}const o=t.slice().sort((n,a)=>(a.id||0)-(n.id||0)).map(n=>`
      <tr>
        <td>${r(n.id||"N/D")}</td>
        <td>${r(n.fileName||"Archivo CSV")}</td>
        <td>${r(n.ruc||"N/D")}</td>
        <td><span class="badge ${C(n.status)}">${r(n.status||"N/D")}</span></td>
        <td>${r(n.headerTotalRecords||0)}</td>
        <td>${f(n.headerTotalAmount)}</td>
        <td>${y(n.receivedAt)}</td>
        <td>${n.scheduledDate?y(n.scheduledDate):'<span class="text-muted">Inmediato</span>'}</td>
      </tr>
    `).join("");s.innerHTML=`
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
          <th>Ejecución Programada</th>
        </tr>
      </thead>
      <tbody>${o}</tbody>
    </table>
  `}async function _e(e){e.preventDefault();const t=b("#sftpUploadMessage");if(c().customerType!=="JURIDICO"){l(t,"Solo clientes jurídicos pueden programar pagos masivos.","error");return}const o=b("#sftpCsvFile").files[0];if(!o){l(t,"Selecciona un archivo CSV.","error");return}const n=b("#sftpScheduledDate").value;if(!n){l(t,"Selecciona una fecha y hora de efectivización.","error");return}l(t,"Subiendo y programando archivo...");try{const a=await de(o,n);l(t,`Archivo programado exitosamente. ID: ${a.id||"N/D"} | Estado: ${a.status||"PROGRAMADO"}`,"success"),b("#sftpCsvFile").value="",b("#sftpFileName").textContent="Seleccionar CSV",b("#sftpScheduledDate").value="",await E()}catch(a){l(t,a.message||"No se pudo subir o programar el archivo.","error")}}const u=e=>document.querySelector(e),J=e=>Array.from(document.querySelectorAll(e));"scrollRestoration"in history&&(history.scrollRestoration="manual");async function Ke(){const{coreUserId:e,coreStatus:t}=await ee();p({coreUserId:e}),u("#coreStatus").textContent=t;const s=u("#portalCoreStatus");s&&(s.textContent=t);const o=await te();u("#switchStatus").textContent=o}async function k(e){j(e),e==="transactions"&&await Q(),(e==="payments"||e==="reports")&&(await M(),e==="reports"&&H()),e==="sftp"&&await E()}function We(){me()&&(U(),I())}function Xe(){u("#loginForm").addEventListener("submit",be),u("#logoutButton").addEventListener("click",Se),u("#refreshButton").addEventListener("click",async()=>{var t;await I();const e=(t=u(".nav-item.is-active"))==null?void 0:t.dataset.section;e==="transactions"&&await Q(),(e==="payments"||e==="reports")&&(await M(),e==="reports"&&H()),e==="sftp"&&await E()}),u("#globalSearch").addEventListener("input",e=>Ge(e.target.value)),u("#uploadForm").addEventListener("submit",ke),u("#loadBatchesButton").addEventListener("click",B),u("#batchSelector").addEventListener("change",()=>W(x())),u("#csvFile").addEventListener("change",e=>{var t;u("#fileName").textContent=((t=e.target.files[0])==null?void 0:t.name)||"Seleccionar CSV"}),u("#sftpUploadForm").addEventListener("submit",_e),u("#loadSftpBatchesButton").addEventListener("click",E),u("#sftpCsvFile").addEventListener("change",e=>{var t;u("#sftpFileName").textContent=((t=e.target.files[0])==null?void 0:t.name)||"Seleccionar CSV"}),J(".nav-item").forEach(e=>{e.addEventListener("click",()=>k(e.dataset.section))}),J("[data-section-shortcut]").forEach(e=>{e.addEventListener("click",()=>k(e.dataset.sectionShortcut))}),document.addEventListener("click",e=>{const t=e.target.closest("[data-process]");t&&ze(t.dataset.process);const s=e.target.closest("[data-report]");s&&xe(s.dataset.report);const o=e.target.closest("[data-download]");o&&He(o.dataset.download),e.target.closest("[data-refresh-reports]")&&B(),e.target.closest("[data-feature-coming-soon]")&&alert("Estamos trabajando para tu futuro")})}Xe();Ke();We();
