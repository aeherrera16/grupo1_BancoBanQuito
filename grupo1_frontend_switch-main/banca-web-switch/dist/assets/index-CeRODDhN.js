(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}})();const $={session:null,customerType:"NATURAL",coreUserId:null,accounts:[],transactions:[],batches:[],paymentBatches:[],sftpBatches:[],charges:[],companyAccount:null};function d(){return $}function h(e){Object.assign($,e)}function W(){$.session&&localStorage.setItem("banquitoSession",JSON.stringify({session:$.session,customerType:$.customerType}))}function ie(){var t;const e=localStorage.getItem("banquitoSession");if(!e)return!1;try{const s=JSON.parse(e);return $.session=s.session,$.customerType=s.customerType||((t=s.session)==null?void 0:t.customerType)||"NATURAL",!0}catch{return localStorage.removeItem("banquitoSession"),!1}}async function g(e,t={}){const s=await fetch(e,t),a=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){const c=typeof a=="object"?a.error||a.detail||a.message:a;throw new Error(c||`Error HTTP ${s.status}`)}return a}async function ce(e,t){const s=await fetch(e);if(!s.ok){const c=await s.text();throw new Error(c||`Error HTTP ${s.status}`)}const o=await s.blob(),n=URL.createObjectURL(o),a=document.createElement("a");a.href=n,a.download=t,document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(n)}async function de(){try{return await g("/api/core/v1/health"),{coreUserId:1,coreStatus:"Banca disponible",switchStatus:null}}catch{return{coreUserId:1,coreStatus:"Banca no disponible",switchStatus:null}}}async function le(){try{return await g("/api/switch/v1/switch/health"),"Pagos disponibles"}catch{return"Pagos no disponibles"}}async function ue(e,t){return g("/api/core/v1/auth/customers/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:t})})}async function pe(e,t,s){return g("/api/core/v1/auth/customers/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,currentPassword:t,newPassword:s})})}async function me(e,t){return g(`/api/core/v1/accounts/customer/${e}`,{headers:{"X-Core-User-Id":String(t)}})}async function fe(e,t){return g(`/api/core/v1/accounts/customer/${e}/transactions`,{headers:{"X-Core-User-Id":String(t)}})}async function he(){var o;const t=(o=d().session)==null?void 0:o.identification,s=t?`/api/switch/v1/payment-batch?ruc=${encodeURIComponent(t)}`:"/api/switch/v1/payment-batch";return g(s)}async function ge(){return(await g("/api/switch/v1/billing/charges")).cargos||[]}async function ve(){return(await g("/api/switch/v1/billing/empresa-account")).cuentaEmpresa||null}async function ye(e){const t=new FormData;t.append("file",e),t.append("channel","PORTAL");const o=d().session;return o&&o.identification&&t.append("ruc",o.identification),g("/api/switch/v1/payment-batch/upload-csv",{method:"POST",body:t})}async function Se(e){return g(`/api/switch/v1/payment-batch/${e}/process`,{method:"POST"})}async function Ce(e,t){const s={summary:`/api/switch/v1/billing/batches/${t}/summary`,detail:`/api/switch/v1/billing/batches/${t}/detail`,history:`/api/switch/v1/billing/batches/${t}/history`,charge:`/api/switch/v1/billing/batches/${t}/charge`,receipt:`/api/switch/v1/billing/batches/${t}/receipt`};return g(s[e])}async function $e(e,t){const s={"receipt-pdf":`/api/switch/v1/payment-batch/${t}/receipt`,"billing-novelties":`/api/switch/v1/billing/batches/${t}/novelties`},o={"receipt-pdf":`recibo_lote_${t}.pdf`,"billing-novelties":`novedades_${t}.csv`};return await ce(s[e],o[e]),o[e]}async function Ae(e){var n;const s=((n=d().session)==null?void 0:n.identification)||"",o=e.includes(":")&&e.split(":").length===2?e+":00":e;return g(`/api/switch/v1/payment-batch/schedule-queued?scheduledDate=${encodeURIComponent(o)}&ruc=${encodeURIComponent(s)}`,{method:"POST"})}function v(e){const t=Number(e||0);return new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD"}).format(t)}function S(e){if(!e)return"Sin fecha";const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(t)}function b(e){const t=String(e||"").toUpperCase();return["ACTIVO","COMPLETADA","SUCCESS","PROCESADO","APROBADO"].some(s=>t.includes(s))?"is-success":["ERROR","RECHAZ","REJECT","FALL","BLOQUEADO","INACTIVO"].some(s=>t.includes(s))?"is-danger":"is-neutral"}function be(e){const t=String(e||"N/D");return t.length>4?`**** ${t.slice(-4)}`:t}function Te(e){return String(e||"").toUpperCase().includes("CREDITO")?"is-credit":"is-debit"}function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function p(e,t,s=""){e.textContent=t||"",e.classList.toggle("is-error",s==="error"),e.classList.toggle("is-success",s==="success")}const T=e=>document.querySelector(e);async function we(){var t;const e=d();if((t=e.session)!=null&&t.customerId){try{const s=await me(e.session.customerId,e.coreUserId||1);h({accounts:s})}catch(s){h({accounts:[]}),T("#accountsTable").innerHTML=`<div class="empty-state">${i(s.message)}</div>`}De()}}function De(){const e=d();T("#accountsMetric").textContent=e.accounts.length;const t=e.accounts.reduce((n,a)=>n+Number(a.availableBalance||0),0);T("#balanceMetric").textContent=v(t),Ee();const s=T("#accountsTable");if(!s)return;if(!e.accounts.length){s.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}const o=e.accounts.map(n=>`
      <tr>
        <td><strong>${i(n.accountNumber||"Sin numero")}</strong></td>
        <td>${i(n.accountSubtypeDescription||"Cuenta")}</td>
        <td>${v(n.accountingBalance)}</td>
        <td><strong class="amount-highlight" style="color: #02745c; font-size: 15px;">${v(n.availableBalance)}</strong></td>
        <td><span class="badge ${b(n.status)}">${i(n.status||"N/D")}</span></td>
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
  `}function Ee(){const e=d(),t=T("#dashboardAccounts");if(t){if(!e.accounts.length){t.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}t.innerHTML=e.accounts.slice(0,3).map(s=>`
      <article class="dashboard-account-card">
        <span>${i(s.accountSubtypeDescription||"Cuenta")}</span>
        <strong>${i(s.accountNumber||"Sin numero")}</strong>
        <div>
          <small>Disponible</small>
          <b>${v(s.availableBalance)}</b>
        </div>
        <em class="badge ${b(s.status)}">${i(s.status||"N/D")}</em>
      </article>
    `).join("")}}const m=e=>document.querySelector(e),O=e=>Array.from(document.querySelectorAll(e));async function Re(e){e.preventDefault();const t=m("#loginMessage");p(t,"Validando credenciales...");const s=new FormData(e.currentTarget),o=s.get("username"),n=s.get("password");try{const a=await ue(o,n);if(a.passwordChangeRequired){p(t,"Cambio de contraseña requerido.","success"),Ne(o,n);return}const c=a.customerType;if(!c)throw new Error("No se pudo identificar el tipo de cliente. Intenta nuevamente en unos minutos.");h({session:a,customerType:c}),W(),p(t,"Ingreso correcto.","success"),z(),await P()}catch(a){p(t,a.message||"No se pudo iniciar sesion.","error")}}function Ne(e,t){m('[data-view="login"]').classList.add("is-hidden"),m('[data-view="password-change"]').classList.remove("is-hidden");const s=m("#passwordChangeForm");m("#currentPassword").value=t,s.onsubmit=async o=>{o.preventDefault();const n=m("#passwordChangeMessage"),a=m("#newPassword").value,c=m("#confirmPassword").value;if(a!==c){p(n,"Las contraseñas no coinciden.","error");return}if(a===t){p(n,"La nueva contraseña debe ser diferente a la actual.","error");return}p(n,"Actualizando contraseña...");try{const r=await pe(e,t,a),u=r.customerType;h({session:r,customerType:u}),W(),p(n,"Contraseña actualizada con éxito.","success"),m('[data-view="password-change"]').classList.add("is-hidden"),z(),await P()}catch(r){p(n,r.message||"Error al cambiar la contraseña.","error")}}}function z(){var s,o,n,a;m('[data-view="login"]').classList.add("is-hidden"),m('[data-view="password-change"]').classList.add("is-hidden"),m('[data-view="dashboard"]').classList.remove("is-hidden");const e=d(),t=e.customerType==="JURIDICO";m("#sessionType").textContent=t?"Cliente juridico":"Cliente natural",m("#sessionName").textContent=((s=e.session)==null?void 0:s.customerName)||((o=e.session)==null?void 0:o.username)||"Panel principal",m("#sessionMeta").textContent=`${((n=e.session)==null?void 0:n.identificationType)||"ID"} ${((a=e.session)==null?void 0:a.identification)||""}`.trim(),m("#sidebarType").textContent=t?"Perfil juridico":"Perfil natural",O(".company-only").forEach(c=>c.classList.toggle("is-hidden",!t)),O(".natural-only").forEach(c=>c.classList.toggle("is-hidden",t)),k("overview"),window.scrollTo({top:0,left:0,behavior:"auto"}),X()}function Le(){const e=d();e.session=null,e.accounts=[],e.transactions=[],e.batches=[],e.charges=[],localStorage.removeItem("banquitoSession"),m("#loginForm").reset(),k("overview"),m('[data-view="dashboard"]').classList.add("is-hidden"),m('[data-view="login"]').classList.remove("is-hidden")}function k(e){!(d().customerType==="JURIDICO")&&["payments","reports","sftp"].includes(e)&&(e="overview"),O(".nav-item").forEach(o=>o.classList.toggle("is-active",o.dataset.section===e)),O("[data-section-panel]").forEach(o=>{o.classList.toggle("is-hidden",o.dataset.sectionPanel!==e)})}function X(){var A;const e=d();if(!e.session)return;const t=e.session,s=e.customerType==="JURIDICO",o=t.customerName||"Informacion del cliente",n=`${t.identificationType||"ID"} ${t.identification||""}`.trim(),a=["SUSPENDIDO","BLOQUEADO","INACTIVO","ACTIVO"],c=e.accounts||[],r=a.find(H=>c.some(x=>x.status===H))||((A=c[0])==null?void 0:A.status)||t.status||"N/D",u=r,l=r==="ACTIVO"?"is-success":r==="SUSPENDIDO"||r==="BLOQUEADO"?"is-danger":"is-neutral";m("#profileName").textContent=t.customerName||"Informacion del cliente",m("#profileDetails").innerHTML=`
    <section class="client-identity-card">
      <div class="client-avatar">${s?"CO":"CL"}</div>
      <div>
        <span>${s?"Cliente juridico":"Cliente natural"}</span>
        <strong>${i(o)}</strong>
        <small>${i(n||"Identificacion no disponible")}</small>
      </div>
      <em class="badge ${l}">${i(u)}</em>
    </section>

    <section class="bank-reference-card">
      <span>Referencia bancaria</span>
      <strong>BanQuito</strong>
      <p>Cliente verificado para consultas digitales, productos bancarios y servicios empresariales habilitados.</p>
    </section>

    <section class="profile-info-grid">
      ${[["Usuario digital",t.username],["Correo registrado",t.email],["Telefono de contacto",t.mobilePhone],["Ultimo ingreso",S(t.lastLogin)]].map(([H,x])=>`
          <div>
            <dt>${i(H)}</dt>
            <dd>${i(x||"N/D")}</dd>
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
  `}async function P(){await we(),X()}const N=e=>document.querySelector(e);async function Y(){var t;const e=d();if((t=e.session)!=null&&t.customerId){try{const s=await fe(e.session.customerId,e.coreUserId||1);h({transactions:s})}catch(s){h({transactions:[]}),N("#transactionsTable").innerHTML=`<div class="empty-state">${i(s.message)}</div>`}Ie()}}function Ie(){const e=d(),t=N("#transactionsMetric");t&&(t.textContent=e.transactions.length);const s=N("#recentTransactions"),o=N("#transactionsTable");if(!e.transactions.length){const r='<div class="empty-state">Sin transacciones registradas.</div>';s&&(s.innerHTML=r),o.innerHTML=r;return}const n=r=>{const u=(r||"").toUpperCase();return u==="COMPLETADA"?"Exitoso":u==="RECHAZADA"?"Rechazado":r||"N/D"},c=`
    <table>
      <thead>
        <tr>
          <th>Cuenta Origen</th>
          <th>Cuenta Destino</th>
          <th>Movimiento</th>
          <th>Monto</th>
          <th>Saldo resultante</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Descripcion</th>
        </tr>
      </thead>
      <tbody>${e.transactions.map(r=>{const u=(r.movementType||"").toUpperCase()==="DEBITO",l=r.counterpartAccountNumber||"—";return`
      <tr>
        <td>${i(u?r.accountNumber||"N/D":l)}</td>
        <td>${i(u?l:r.accountNumber||"N/D")}</td>
        <td><span class="badge ${Te(r.movementType)}">${i(r.movementType||"N/D")}</span></td>
        <td>${v(r.amount)}</td>
        <td>${v(r.resultingBalance)}</td>
        <td><span class="badge ${b(r.status)}">${i(n(r.status))}</span></td>
        <td>${S(r.transactionDate)}</td>
        <td>${i(r.message||"N/D")}</td>
      </tr>
    `}).join("")}</tbody>
    </table>
  `;o.innerHTML=c,s&&(s.innerHTML=`<div class="table-wrap compact-table">${c}</div>`)}const M=e=>document.querySelector(e),Oe={summary:"Resumen del lote",detail:"Detalle del lote",charge:"Cargo del lote",receipt:"Comprobante del lote"},Be={id:"Referencia",fileName:"Archivo",ruc:"RUC",status:"Estado",headerTotalRecords:"Registros",headerTotalAmount:"Monto total",totalAmount:"Monto total",amount:"Monto",chargeAmount:"Valor comision",commissionAmount:"Valor comision",feeAmount:"Valor comision",totalChargeAmount:"Valor comision",chargeStatus:"Respuesta del proceso",commissionStatus:"Estado comision",chargeDate:"Fecha de cobro",receivedAt:"Recibido",createdAt:"Creado",processedAt:"Procesado",updatedAt:"Actualizado",validationResult:"Validacion",batchStatus:"Estado del lote",accountNumber:"Cuenta",description:"Descripcion",message:"Mensaje",notificationStatus:"Estado notif.",rejectionReason:"Motivo rechazo",lineNumber:"Linea",beneficiaryName:"Beneficiario",identification:"Identificacion",identificationNumber:"Identificacion",executedAt:"Ejecutado"},Ue=["fileName","ruc","status","validationResult","batchStatus","headerTotalRecords","totalRecords","processedRecords","successfulRecords","failedRecords","headerTotalAmount","totalAmount","amount","chargeAmount","receivedAt","processedAt","createdAt","message"],B=["chargeAmount","commissionAmount","feeAmount","amount","totalChargeAmount"],Pe=["chargeStatus","commissionStatus","status","result"],Me=["lineNumber","accountNumber","beneficiaryName","identification","identificationNumber","amount","status","validationResult","notificationStatus","rejectionReason","message","description","executedAt","createdAt","processedAt"],je=new Set(["id","batchId","customerId","userId","createdBy","updatedBy","deletedBy","version","trace","stack","rawPayload","payload"]);function U(e,t){return!(t==null||t===""||Array.isArray(t)||typeof t=="object"||je.has(e)||e.startsWith("_"))}function J(e){return Be[e]||e.replace(/([A-Z])/g," $1").replace(/^./,t=>t.toUpperCase())}function ee(e,t){if(t==null||t==="")return"N/D";const s=e.toLowerCase();return s.includes("amount")||s.includes("monto")||s.includes("balance")?v(t):s.includes("date")||s.includes("at")||s.includes("fecha")?S(t):String(t)}function He(e){return String(e||"").trim().toUpperCase()}function L(e){return String((e==null?void 0:e.id)||(e==null?void 0:e.batchId)||(e==null?void 0:e.reference)||"")}function q(){var e,t;return((t=(e=M("#batchSelector"))==null?void 0:e.value)==null?void 0:t.trim())||""}function j(){const e=q();return d().batches.find(t=>L(t)===e)||null}function w(e,t){if(!e||typeof e!="object")return;const s=t.find(o=>e[o]!==void 0&&e[o]!==null&&e[o]!=="");return s?e[s]:void 0}function xe(e,t){return!e||typeof e!="object"?!1:[e.batchId,e.paymentBatchId,e.loteId,e.idLote,e.reference].filter(s=>s!=null).some(s=>String(s)===String(t))}function Fe(e,t){const s=d().charges.find(o=>xe(o,e));return s||(Array.isArray(t)?t.find(o=>w(o,B)):t&&typeof t=="object"&&w(t,B)?t:null)}function Ve(e,t){const s=Fe(e,t),o=He(w(t,Pe)),n=w(s,B)??w(t,B),a=Number(n||0)>0,c=["REJECTED","RECHAZADO","FAILED","ERROR"].some(A=>o.includes(A));if(!s&&!a&&!o)return"";const r=s||a?"Comision registrada":"Sin cargo confirmado",u=s||a?"is-success":"is-neutral",l=c&&(s||a)?"La respuesta del proceso vino rechazada, pero existe evidencia de comision registrada. No se interpreta como comision pendiente.":"Validado con la informacion operativa disponible para el lote.";return`
    <div class="charge-reconciliation">
      <div>
        <span>Estado operativo del cobro</span>
        <strong class="badge ${u}">${i(r)}</strong>
      </div>
      <div>
        <span>Valor comision</span>
        <strong>${i(v(n||0))}</strong>
      </div>
      <p>${i(l)}</p>
    </div>
  `}function te(e){return`<span class="badge ${b(e)}">${i(e||"N/D")}</span>`}function ze(e,t){return t&&typeof t=="object"&&!Array.isArray(t)?t.status||t.batchStatus||t.validationResult||(e==null?void 0:e.status)||"Generado":(e==null?void 0:e.status)||"Generado"}function F(e,t,s,o){const a=d().session||{},c=new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(new Date),r=ze(s,o),u=Oe[e]||"Reporte del lote";return`
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
          <h3>${i(u)}</h3>
          <p>${i((s==null?void 0:s.fileName)||`Referencia de lote ${t}`)}</p>
        </div>
        <div class="bank-report-status">
          ${te(r)}
          <small>Emitido ${i(c)}</small>
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
          <dd>${i(S(s==null?void 0:s.receivedAt))}</dd>
        </div>
      </dl>

      ${e==="charge"?Ve(t,o):""}

      <section class="bank-report-body">
        <div class="bank-report-section-title">
          <span>Contenido del informe</span>
          <strong>${i(u)}</strong>
        </div>
        ${Je(o)}
      </section>

      <footer class="bank-report-footer">
        <span>Documento informativo generado desde Banca Web BanQuito.</span>
        <strong>Grupo 1 - Switch de pagos</strong>
      </footer>
    </article>
  `}function se(e){const t=M("#selectedBatchPreview");if(t){if(!e){t.className="selected-batch empty-state",t.innerHTML="Carga los lotes disponibles para elegir una operacion.";return}t.className="selected-batch",t.innerHTML=`
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
      ${te(e.status)}
    </div>
    <div>
      <span>Monto</span>
      <strong>${v(e.headerTotalAmount)}</strong>
    </div>
    <div>
      <span>Recibido</span>
      <strong>${i(S(e.receivedAt))}</strong>
    </div>
  `}}function G(){const e=M("#batchSelector");if(!e)return;const t=d(),s=e.value,o=t.batches.slice().sort((n,a)=>Number(a.id||a.batchId||0)-Number(n.id||n.batchId||0));e.innerHTML=['<option value="">Selecciona por archivo, RUC o fecha</option>',...o.map(n=>{const a=L(n),c=[n.fileName||"Archivo CSV",n.ruc?`RUC ${n.ruc}`:"RUC N/D",n.status||"Estado N/D",v(n.headerTotalAmount),S(n.receivedAt)].join(" - ");return`<option value="${i(a)}">${i(c)}</option>`})].join(""),s&&o.some(n=>L(n)===s)?e.value=s:o.length&&(e.value=L(o[0])),se(j())}function ke(e){const t=Ue.filter(n=>Object.prototype.hasOwnProperty.call(e,n)).filter(n=>U(n,e[n])),s=Object.keys(e).filter(n=>!t.includes(n)).filter(n=>U(n,e[n])).slice(0,10-t.length),o=[...t,...s].map(n=>[n,e[n]]);return o.length?`
    <dl class="report-ledger">
      ${o.map(([n,a])=>`
        <div>
          <dt>${i(J(n))}</dt>
          <dd>${i(ee(n,a))}</dd>
        </div>
      `).join("")}
    </dl>
  `:""}function Q(e){if(!e.length)return'<div class="empty-state">Sin registros para mostrar.</div>';const t=Me.filter(n=>e.some(a=>U(n,a==null?void 0:a[n]))),s=Array.from(e.reduce((n,a)=>(Object.keys(a||{}).forEach(c=>{!t.includes(c)&&U(c,a[c])&&n.add(c)}),n),new Set)).slice(0,Math.max(0,10-t.length)),o=[...t,...s];return o.length?`
    <div class="table-wrap report-table">
      <table>
        <thead>
          <tr>${o.map(n=>`<th>${i(J(n))}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${e.map(n=>`
            <tr>
              ${o.map(a=>`<td>${i(ee(a,n==null?void 0:n[a]))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:'<div class="empty-state">El reporte no contiene campos operativos para mostrar.</div>'}function Je(e){if(Array.isArray(e))return Q(e);if(!e||typeof e!="object")return`<div class="report-note">${i(e||"Sin datos.")}</div>`;const t=Object.entries(e).filter(([,s])=>Array.isArray(s)).map(([s,o])=>`
      <section class="report-section">
        <h3>${i(J(s))}</h3>
        ${Q(o)}
      </section>
    `).join("");return`${ke(e)}${t||'<div class="report-note">Sin movimientos o novedades relevantes para mostrar.</div>'}`}function C(e,t=""){const s=M("#reportOutput");s.classList.remove("is-error","is-success","is-info"),t&&s.classList.add(`is-${t}`),s.innerHTML=e}function ne(e,t){const s={fileName:e==null?void 0:e.fileName,ruc:e==null?void 0:e.ruc,status:e==null?void 0:e.status,totalRecords:e==null?void 0:e.headerTotalRecords,totalAmount:e==null?void 0:e.headerTotalAmount,successfulRecords:e==null?void 0:e.successfulRecords,rejectedRecords:e==null?void 0:e.rejectedRecords,receivedAt:e==null?void 0:e.receivedAt};return(t==="charge"||t==="receipt")&&(s.commissionSubtotal=0,s.vatAmount=0,s.totalCharge=0,s.chargeStatus="SIN_CARGO"),s}async function qe(e){const t=q();if(!t){C('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de consultar.</span></div>',"error");return}C('<div class="report-empty"><strong>Consultando reporte...</strong><span>Estamos preparando la informacion del lote seleccionado.</span></div>');const s=j();try{const o=await Ce(e,t);C(F(e,t,s,o))}catch{C(F(e,t,s,ne(s,e)))}}async function Ge(e){const t=q();if(!t){C('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de descargar.</span></div>',"error");return}C('<div class="report-empty"><strong>Preparando descarga...</strong><span>El archivo se generara con la referencia interna del lote seleccionado.</span></div>');try{const s=await $e(e,t);C(`
      <div class="download-card">
        <span>Descarga generada</span>
        <strong>${i(s)}</strong>
        <small>Operacion completada para el lote seleccionado.</small>
      </div>
    `,"success")}catch{const s=j();C(F(e==="receipt-pdf"?"receipt":"summary",t,s,ne(s,"receipt")))}}const y=e=>document.querySelector(e);function _(){var s;const e=d(),t=e.accounts.find(o=>o.isFavorite);return(t==null?void 0:t.accountNumber)||((s=e.accounts[0])==null?void 0:s.accountNumber)||null}async function V(){var s;const e=d();if(e.customerType!=="JURIDICO")return;try{const o=await he(),n=(s=e.session)==null?void 0:s.identification,a=o.filter(c=>!n||c.ruc===n);h({batches:a,paymentBatches:a})}catch(o){h({batches:[],paymentBatches:[]}),y("#batchesTable").innerHTML=`<div class="empty-state">${i(o.message)}</div>`}Ze();const t=document.getElementById("batchesTable");t&&t.scrollIntoView({behavior:"smooth",block:"start"})}async function Qe(){if(d().customerType!=="JURIDICO")return;try{const s=await ge();h({charges:s})}catch{h({charges:[]})}const t=y("#chargesMetric");t&&(t.textContent=d().charges.length)}async function _e(){if(d().customerType!=="JURIDICO")return;try{const n=await ve();h({companyAccount:n})}catch{h({companyAccount:_()})}d().companyAccount||h({companyAccount:_()});const s=be(d().companyAccount),o=y("#companyAccountMetric");o&&(o.textContent=s),y("#companyAccountHero").textContent=s}function Ze(){var u;const e=d(),t=y("#batchesMetric"),s=e.paymentBatches||[];t&&(t.textContent=s.length);const o=y("#batchesTable"),n=y("#recentBatches");if(!s.length){const l='<div class="empty-state">Sin lotes cargados todavia.</div>';o.innerHTML=l,n&&(n.innerHTML=l);return}const a=(u=e.session)==null?void 0:u.identification,r=`
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
      <tbody>${s.slice().filter(l=>!l.channel||!(l.channel+"").toLowerCase().includes("sftp")).filter(l=>!a||l.ruc===a).filter(l=>!["PROGRAMADO","SCHEDULED"].includes((l.status||"").toUpperCase())).sort((l,A)=>(A.id||0)-(l.id||0)).map(l=>`
      <tr>
        <td>${i(l.id||"N/D")}</td>
        <td>${i(l.fileName||"Archivo CSV")}</td>
        <td>${i(l.ruc||"N/D")}</td>
        <td><span class="badge ${b(l.status)}">${i(l.status||"N/D")}</span></td>
        <td>${i(l.headerTotalRecords||0)}</td>
        <td>${v(l.headerTotalAmount)}</td>
        <td>${S(l.receivedAt)}</td>

      </tr>
    `).join("")}</tbody>
    </table>
  `;o.innerHTML=r,n&&(n.innerHTML=`<div class="table-wrap compact-table">${r}</div>`),G()}const oe=["PROCESADO","PROCESSED","REJECTED","RECHAZADO"];function Ke(e,t){let s=0;const o=setInterval(async()=>{s++;try{await R();const n=d().batches.find(c=>Number(c.id)===t),a=((n==null?void 0:n.status)||"").toUpperCase();if(n&&oe.includes(a)){clearInterval(o);const c=["PROCESADO","PROCESSED"].includes(a);p(e,`Procesamiento completado. Estado final: ${n.status}`,c?"success":"error");return}}catch{}s>=40&&(clearInterval(o),p(e,"El procesamiento está tomando más tiempo del esperado. Actualiza la lista manualmente.","error"))},2e3)}async function We(e){e.preventDefault();const t=y("#uploadMessage");if(d().customerType!=="JURIDICO"){p(t,"Solo clientes juridicos pueden enviar pagos masivos.","error");return}const o=y("#csvFile").files[0];if(!o){p(t,"Selecciona un archivo CSV.","error");return}p(t,"Enviando archivo de pagos...");try{const n=await ye(o);await R();const a=Number(n.batchId),c=(n.batchStatus||"").toUpperCase();if(oe.includes(c)){const r=["PROCESADO","PROCESSED"].includes(c);p(t,`Resultado: ${n.validationResult||"procesado"} | Estado: ${n.batchStatus}`,r?"success":"error")}else p(t,"Lote recibido. Procesando pagos automáticamente... ⏳"),Ke(t,a)}catch(n){p(t,n.message||"No se pudo cargar el CSV.","error")}}async function Xe(e){if(d().customerType==="JURIDICO")try{const s=await Se(e);y("#reportOutput").textContent=typeof s=="string"?s:JSON.stringify(s,null,2),await R()}catch(s){y("#reportOutput").textContent=s.message}}async function R(){d().customerType==="JURIDICO"&&await Promise.all([V(),Qe(),_e()])}function Ye(e){const t=e.trim().toLowerCase();document.querySelectorAll("tbody tr, .account-card").forEach(s=>{const o=!t||s.textContent.toLowerCase().includes(t);s.classList.toggle("is-filtered",!o)})}const D=e=>document.querySelector(e);async function E(e=!1){if(d().customerType!=="JURIDICO")return;const s=e?null:document.getElementById("loadSftpBatchesButton");s&&(s.disabled=!0,s.innerHTML='<span class="btn-spinner">⟳</span> Actualizando...');try{const n=(await g("/api/switch/v1/payment-batch")).filter(a=>(a.channel+"").toLowerCase().includes("sftp"));h({sftpBatches:n}),et(),ae()}catch(o){if(h({sftpBatches:[]}),!e){const n=D("#sftpBatchesTable");n&&(n.innerHTML=`<div class="empty-state">${i(o.message)}</div>`)}}finally{s&&(s.disabled=!1,s.innerHTML="⟳ Actualizar")}}function et(){const t=d().sftpBatches||[],s=D("#sftpBatchesTable");if(!s)return;if(!t.length){s.innerHTML=`
      <div class="empty-state">
        <strong>No hay archivos en el buzón.</strong>
        <br><small>Cuando subas un CSV via SFTP o programes un lote, aparecerá aquí con su estado.</small>
      </div>`;return}const o=t.filter(r=>["PROGRAMADO","PENDIENTE","SCHEDULED","PENDING","RECIBIDO"].includes((r.status||"").toUpperCase())),n=t.filter(r=>!["PROGRAMADO","PENDIENTE","SCHEDULED","PENDING","RECIBIDO"].includes((r.status||"").toUpperCase())),c=[...o.sort((r,u)=>new Date(r.scheduledDate||r.receivedAt).getTime()-new Date(u.scheduledDate||u.receivedAt).getTime()),...n.sort((r,u)=>(u.id||0)-(r.id||0))].map(r=>`
        <tr${["PROGRAMADO","PENDIENTE","SCHEDULED","PENDING","RECIBIDO"].includes((r.status||"").toUpperCase())?' class="row-pending"':""}>
          <td>${i(String(r.id||"N/D"))}</td>
          <td>${i(r.fileName||"archivo.csv")}</td>
          <td><span class="badge ${b(r.status)}">${i(r.status||"N/D")}</span></td>
          <td>${i(String(r.headerTotalRecords||0))}</td>
          <td>${v(r.headerTotalAmount)}</td>
          <td>${S(r.receivedAt)}</td>
          <td>
            ${r.scheduledDate?`<span class="badge badge-info">📅 ${S(r.scheduledDate)}</span>`:'<span class="text-muted">Inmediato</span>'}
          </td>
        </tr>
      `).join("");s.innerHTML=`
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Archivo</th>
          <th>Estado</th>
          <th>Registros</th>
          <th>Monto</th>
          <th>Recibido</th>
          <th>Ejecución Programada</th>
        </tr>
      </thead>
      <tbody>${c}</tbody>
    </table>
  `}function ae(){const e=document.getElementById("sftpScheduleSummary");if(!e)return;const o=(d().sftpBatches||[]).filter(r=>["ENCOLADO","PENDIENTE","PENDING"].includes((r.status||"").toUpperCase()));if(o.length===0){e.style.display="none";return}const n=document.getElementById("sftpScheduledDate"),a=n==null?void 0:n.value;let c;if(a){const r=new Date(a),u=r.toLocaleDateString("es-EC",{day:"numeric",month:"short",year:"numeric"}),l=r.toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});c=`📋 ${o.length} ${o.length===1?"archivo":"archivos"} en el buzón ${o.length===1?"será programado":"serán programados"} para el <strong>${u}, ${l}</strong>`}else c=`📋 ${o.length} ${o.length===1?"archivo encolado":"archivos encolados"} en el buzón. Selecciona una fecha y hora para programarlos.`;e.innerHTML=c,e.style.display="block"}async function tt(e){e.preventDefault();const t=D("#sftpUploadMessage");if(d().customerType!=="JURIDICO"){p(t,"Solo clientes jurídicos pueden programar pagos masivos.","error");return}const o=D("#sftpScheduledDate").value;if(!o){p(t,"Selecciona una fecha y hora de efectivización.","error");return}p(t,"⏳ Aplicando regla de efectivización...");try{const n=await Ae(o);p(t,`✅ Regla de efectivización aplicada. ${n.count||0} lotes del buzón programados para el ${o.replace("T"," ")}`,"success"),D("#sftpScheduledDate").value="",await E()}catch(n){p(t,n.message||"No se pudo aplicar la regla.","error")}}const f=e=>document.querySelector(e),Z=e=>Array.from(document.querySelectorAll(e));"scrollRestoration"in history&&(history.scrollRestoration="manual");let I=null;function st(){re(),I=setInterval(()=>E(!0),3e3)}function re(){I!==null&&(clearInterval(I),I=null)}async function nt(){const{coreUserId:e,coreStatus:t}=await de();h({coreUserId:e}),f("#coreStatus").textContent=t;const s=f("#portalCoreStatus");s&&(s.textContent=t);const o=await le();f("#switchStatus").textContent=o}async function K(e){re(),k(e),e==="transactions"&&await Y(),(e==="payments"||e==="reports")&&(await R(),e==="reports"&&G()),e==="sftp"&&(await E(),st())}function ot(){ie()&&(z(),P())}function at(){f("#loginForm").addEventListener("submit",Re),f("#logoutButton").addEventListener("click",Le),f("#refreshButton").addEventListener("click",async()=>{var t;await P();const e=(t=f(".nav-item.is-active"))==null?void 0:t.dataset.section;e==="transactions"&&await Y(),(e==="payments"||e==="reports")&&(await R(),e==="reports"&&G()),e==="sftp"&&await E()}),f("#globalSearch").addEventListener("input",e=>Ye(e.target.value)),f("#uploadForm").addEventListener("submit",We),f("#loadBatchesButton").addEventListener("click",V),f("#batchSelector").addEventListener("change",()=>se(j())),f("#csvFile").addEventListener("change",e=>{var t;f("#fileName").textContent=((t=e.target.files[0])==null?void 0:t.name)||"Seleccionar CSV"}),f("#sftpUploadForm").addEventListener("submit",tt),f("#loadSftpBatchesButton").addEventListener("click",E),f("#sftpScheduledDate").addEventListener("input",ae),Z(".nav-item").forEach(e=>{e.addEventListener("click",()=>K(e.dataset.section))}),Z("[data-section-shortcut]").forEach(e=>{e.addEventListener("click",()=>K(e.dataset.sectionShortcut))}),document.addEventListener("click",e=>{const t=e.target.closest("[data-process]");t&&Xe(t.dataset.process);const s=e.target.closest("[data-report]");s&&qe(s.dataset.report);const o=e.target.closest("[data-download]");o&&Ge(o.dataset.download),e.target.closest("[data-refresh-reports]")&&V(),e.target.closest("[data-feature-coming-soon]")&&alert("Estamos trabajando para tu futuro")})}at();nt();ot();
