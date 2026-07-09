(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const A={session:null,customerType:"NATURAL",coreUserId:null,accounts:[],transactions:[],batches:[],paymentBatches:[],sftpBatches:[],charges:[],companyAccount:null};function u(){return A}function h(t){Object.assign(A,t)}function it(){A.session&&localStorage.setItem("banquitoSession",JSON.stringify({session:A.session,customerType:A.customerType}))}function vt(){var e;const t=localStorage.getItem("banquitoSession");if(!t)return!1;try{const n=JSON.parse(t);return A.session=n.session,A.customerType=n.customerType||((e=n.session)==null?void 0:e.customerType)||"NATURAL",!0}catch{return localStorage.removeItem("banquitoSession"),!1}}async function v(t,e={}){const n=await fetch(t,e),a=(n.headers.get("content-type")||"").includes("application/json")?await n.json():await n.text();if(!n.ok){const c=typeof a=="object"?a.error||a.detail||a.message:a;throw new Error(c||`Error HTTP ${n.status}`)}return a}async function yt(t,e){const n=await fetch(t);if(!n.ok){const c=await n.text();throw new Error(c||`Error HTTP ${n.status}`)}const o=await n.blob(),s=URL.createObjectURL(o),a=document.createElement("a");a.href=s,a.download=e,document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(s)}async function St(){try{return await v("/api/core/v1/health"),{coreUserId:1,coreStatus:"Banca disponible",switchStatus:null}}catch{return{coreUserId:1,coreStatus:"Banca no disponible",switchStatus:null}}}async function $t(){try{return await v("/api/switch/v1/switch/health"),"Pagos disponibles"}catch{return"Pagos no disponibles"}}async function Ct(t,e){return v("/api/core/v1/auth/customers/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:e})})}async function bt(t,e,n){return v("/api/core/v1/auth/customers/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,currentPassword:e,newPassword:n})})}async function Tt(t,e){return v(`/api/core/v1/accounts/customer/${t}`,{headers:{"X-Core-User-Id":String(e)}})}async function Dt(t,e,n,o){return v(`/api/core/v1/accounts/customer/${t}/transactions/paged?page=${n}&size=${o}`,{headers:{"X-Core-User-Id":String(e)}})}async function wt(){var o;const e=(o=u().session)==null?void 0:o.identification,n=e?`/api/switch/v1/payment-batch?ruc=${encodeURIComponent(e)}`:"/api/switch/v1/payment-batch";return v(n)}async function At(){return(await v("/api/switch/v1/billing/charges")).cargos||[]}async function Et(t){return(await v(`/api/switch/v1/billing/batches/${t}/detail`)).detalles||[]}async function Rt(t){return(await v(`/api/switch/v1/billing/batches/${t}/history`)).historial||[]}async function Nt(){return(await v("/api/switch/v1/billing/empresa-account")).cuentaEmpresa||null}async function Lt(t){const e=new FormData;e.append("file",t),e.append("channel","PORTAL");const o=u().session;return o&&o.identification&&e.append("ruc",o.identification),v("/api/switch/v1/payment-batch/upload-csv",{method:"POST",body:e})}async function It(t){return v(`/api/switch/v1/payment-batch/${t}/process`,{method:"POST"})}async function Ot(t,e){const n={summary:`/api/switch/v1/billing/batches/${e}/summary`,detail:`/api/switch/v1/billing/batches/${e}/detail`,history:`/api/switch/v1/billing/batches/${e}/history`,charge:`/api/switch/v1/billing/batches/${e}/charge`,receipt:`/api/switch/v1/billing/batches/${e}/receipt`};return v(n[t])}async function Bt(t,e){const n={"receipt-pdf":`/api/switch/v1/payment-batch/${e}/receipt`,"billing-novelties":`/api/switch/v1/billing/batches/${e}/novelties`},o={"receipt-pdf":`recibo_lote_${e}.pdf`,"billing-novelties":`novedades_${e}.csv`};return await yt(n[t],o[t]),o[t]}async function Pt(t){var s;const n=((s=u().session)==null?void 0:s.identification)||"",o=t.includes(":")&&t.split(":").length===2?t+":00":t;return v(`/api/switch/v1/payment-batch/schedule-queued?scheduledDate=${encodeURIComponent(o)}&ruc=${encodeURIComponent(n)}`,{method:"POST"})}function S(t){const e=Number(t||0);return new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD"}).format(e)}function T(t){if(!t)return"Sin fecha";const e=new Date(t);return Number.isNaN(e.getTime())?t:new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(e)}function E(t){const e=String(t||"").toUpperCase();return["ACTIVO","COMPLETADA","SUCCESS","EXITO","PROCESADO","APROBADO"].some(n=>e.includes(n))?"is-success":["ERROR","RECHAZ","REJECT","FALL","BLOQUEADO","INACTIVO"].some(n=>e.includes(n))?"is-danger":"is-neutral"}function Mt(t){const e=String(t||"N/D");return e.length>4?`**** ${e.slice(-4)}`:e}function Ut(t){return String(t||"").toUpperCase().includes("CREDITO")?"is-credit":"is-debit"}function r(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function p(t,e,n=""){t.textContent=e||"",t.classList.toggle("is-error",n==="error"),t.classList.toggle("is-success",n==="success")}const I=t=>document.querySelector(t);async function jt(){var e;const t=u();if((e=t.session)!=null&&e.customerId){try{const n=await Tt(t.session.customerId,t.coreUserId||1);h({accounts:n})}catch(n){h({accounts:[]}),I("#accountsTable").innerHTML=`<div class="empty-state">${r(n.message)}</div>`}xt()}}function xt(){const t=u();I("#accountsMetric").textContent=t.accounts.length;const e=t.accounts.reduce((s,a)=>s+Number(a.availableBalance||0),0);I("#balanceMetric").textContent=S(e),Ht();const n=I("#accountsTable");if(!n)return;if(!t.accounts.length){n.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}const o=t.accounts.map(s=>`
      <tr>
        <td><strong>${r(s.accountNumber||"Sin numero")}</strong></td>
        <td>${r(s.accountSubtypeDescription||"Cuenta")}</td>
        <td>${S(s.accountingBalance)}</td>
        <td><strong class="amount-highlight" style="color: #02745c; font-size: 15px;">${S(s.availableBalance)}</strong></td>
        <td><span class="badge ${E(s.status)}">${r(s.status||"N/D")}</span></td>
        <td>${r(s.branchName||"N/D")}</td>
        <td>${s.openingDate?r(String(s.openingDate).split("T")[0]):"N/D"}</td>
      </tr>
    `).join("");n.innerHTML=`
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
  `}function Ht(){const t=u(),e=I("#dashboardAccounts");if(e){if(!t.accounts.length){e.innerHTML='<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';return}e.innerHTML=t.accounts.slice(0,3).map(n=>`
      <article class="dashboard-account-card">
        <span>${r(n.accountSubtypeDescription||"Cuenta")}</span>
        <strong>${r(n.accountNumber||"Sin numero")}</strong>
        <div>
          <small>Disponible</small>
          <b>${S(n.availableBalance)}</b>
        </div>
        <em class="badge ${E(n.status)}">${r(n.status||"N/D")}</em>
      </article>
    `).join("")}}const m=t=>document.querySelector(t),H=t=>Array.from(document.querySelectorAll(t));async function Ft(t){t.preventDefault();const e=m("#loginMessage");p(e,"Validando credenciales...");const n=new FormData(t.currentTarget),o=n.get("username"),s=n.get("password");try{const a=await Ct(o,s);if(a.passwordChangeRequired){p(e,"Cambio de contraseña requerido.","success"),zt(o,s);return}const c=a.customerType;if(!c)throw new Error("No se pudo identificar el tipo de cliente. Intenta nuevamente en unos minutos.");h({session:a,customerType:c}),it(),p(e,"Ingreso correcto.","success"),Z(),await V()}catch(a){p(e,a.message||"No se pudo iniciar sesion.","error")}}function zt(t,e){m('[data-view="login"]').classList.add("is-hidden"),m('[data-view="password-change"]').classList.remove("is-hidden");const n=m("#passwordChangeForm");m("#currentPassword").value=e,n.onsubmit=async o=>{o.preventDefault();const s=m("#passwordChangeMessage"),a=m("#newPassword").value,c=m("#confirmPassword").value;if(a!==c){p(s,"Las contraseñas no coinciden.","error");return}if(a===e){p(s,"La nueva contraseña debe ser diferente a la actual.","error");return}p(s,"Actualizando contraseña...");try{const i=await bt(t,e,a),d=i.customerType;h({session:i,customerType:d}),it(),p(s,"Contraseña actualizada con éxito.","success"),m('[data-view="password-change"]').classList.add("is-hidden"),Z(),await V()}catch(i){p(s,i.message||"Error al cambiar la contraseña.","error")}}}function Z(){var n,o,s,a;m('[data-view="login"]').classList.add("is-hidden"),m('[data-view="password-change"]').classList.add("is-hidden"),m('[data-view="dashboard"]').classList.remove("is-hidden");const t=u(),e=t.customerType==="JURIDICO";m("#sessionType").textContent=e?"Cliente juridico":"Cliente natural",m("#sessionName").textContent=((n=t.session)==null?void 0:n.customerName)||((o=t.session)==null?void 0:o.username)||"Panel principal",m("#sessionMeta").textContent=`${((s=t.session)==null?void 0:s.identificationType)||"ID"} ${((a=t.session)==null?void 0:a.identification)||""}`.trim(),m("#sidebarType").textContent=e?"Perfil juridico":"Perfil natural",H(".company-only").forEach(c=>c.classList.toggle("is-hidden",!e)),H(".natural-only").forEach(c=>c.classList.toggle("is-hidden",e)),X("overview"),window.scrollTo({top:0,left:0,behavior:"auto"}),ct()}function Vt(){const t=u();t.session=null,t.accounts=[],t.transactions=[],t.batches=[],t.charges=[],localStorage.removeItem("banquitoSession"),m("#loginForm").reset(),X("overview"),m('[data-view="dashboard"]').classList.add("is-hidden"),m('[data-view="login"]').classList.remove("is-hidden")}function X(t){!(u().customerType==="JURIDICO")&&["payments","reports","sftp"].includes(t)&&(t="overview"),H(".nav-item").forEach(o=>o.classList.toggle("is-active",o.dataset.section===t)),H("[data-section-panel]").forEach(o=>{o.classList.toggle("is-hidden",o.dataset.sectionPanel!==t)})}function ct(){var y;const t=u();if(!t.session)return;const e=t.session,n=t.customerType==="JURIDICO",o=e.customerName||"Informacion del cliente",s=`${e.identificationType||"ID"} ${e.identification||""}`.trim(),a=["SUSPENDIDO","BLOQUEADO","INACTIVO","ACTIVO"],c=t.accounts||[],i=a.find($=>c.some(L=>L.status===$))||((y=c[0])==null?void 0:y.status)||e.status||"N/D",d=i,l=i==="ACTIVO"?"is-success":i==="SUSPENDIDO"||i==="BLOQUEADO"?"is-danger":"is-neutral";m("#profileName").textContent=e.customerName||"Informacion del cliente",m("#profileDetails").innerHTML=`
    <section class="client-identity-card">
      <div class="client-avatar">${n?"CO":"CL"}</div>
      <div>
        <span>${n?"Cliente juridico":"Cliente natural"}</span>
        <strong>${r(o)}</strong>
        <small>${r(s||"Identificacion no disponible")}</small>
      </div>
      <em class="badge ${l}">${r(d)}</em>
    </section>

    <section class="bank-reference-card">
      <span>Referencia bancaria</span>
      <strong>BanQuito</strong>
      <p>Cliente verificado para consultas digitales, productos bancarios y servicios empresariales habilitados.</p>
    </section>

    <section class="profile-info-grid">
      ${[["Usuario digital",e.username],["Correo registrado",e.email],["Telefono de contacto",e.mobilePhone],["Ultimo ingreso",T(e.lastLogin)]].map(([$,L])=>`
          <div>
            <dt>${r($)}</dt>
            <dd>${r(L||"N/D")}</dd>
          </div>
        `).join("")}
    </section>

    <section class="profile-map-card">
      <div>
        <span>Ubicacion registrada</span>
        <strong>${r(e.address||"Direccion no disponible")}</strong>
      </div>
      <div class="map-lines" aria-hidden="true"></div>
    </section>
  `}async function V(){await jt(),ct()}const b=t=>document.querySelector(t);let D={from:null,to:null},C=0,O=10,R=0,N=0;function kt(){const t=b("#transactionsFromDate"),e=b("#transactionsToDate");D={from:(t==null?void 0:t.value)||null,to:(e==null?void 0:e.value)||null},K()}function Jt(){const t=b("#transactionsFromDate"),e=b("#transactionsToDate");t&&(t.value=""),e&&(e.value=""),D={from:null,to:null},K()}function qt(t){if(!D.from&&!D.to)return t;const e=D.from?new Date(`${D.from}T00:00:00`).getTime():null,n=D.to?new Date(`${D.to}T23:59:59.999`).getTime():null;return t.filter(o=>{const s=o.transactionDate;if(!s)return!1;const a=new Date(s).getTime();return!(Number.isNaN(a)||e!==null&&a<e||n!==null&&a>n)})}async function k(){var e;const t=u();if((e=t.session)!=null&&e.customerId){try{const n=await Dt(t.session.customerId,t.coreUserId||1,C,O),o=(n==null?void 0:n.content)||[];R=(n==null?void 0:n.totalElements)??o.length,N=(n==null?void 0:n.totalPages)??1,h({transactions:o})}catch(n){h({transactions:[]}),R=0,N=0,b("#transactionsTable").innerHTML=`<div class="empty-state">${r(n.message)}</div>`}K()}}function Gt(t){O=Number(t)||10,C=0,k()}function lt(t){t<0||N>0&&t>=N||(C=t,k())}function Qt(){lt(C+1)}function _t(){lt(C-1)}function Zt(){const t=b("#transactionsPaginationControls");if(!t)return;if(!R){t.innerHTML="";return}const e=C*O+1,n=Math.min(R,(C+1)*O);t.innerHTML=`
    <div class="pagination-bar">
      <label>
        Ver
        <select id="transactionsPageSize">
          ${[10,20,30,50,100].map(s=>`
            <option value="${s}" ${s===O?"selected":""}>${s}</option>
          `).join("")}
        </select>
        por página
      </label>
      <span class="pagination-info">${e}-${n} de ${R}</span>
      <div class="pagination-buttons">
        <button type="button" class="secondary-button" data-transactions-prev ${C===0?"disabled":""}>Anterior</button>
        <span class="pagination-page">Página ${C+1} de ${Math.max(N,1)}</span>
        <button type="button" class="secondary-button" data-transactions-next ${C+1>=N?"disabled":""}>Siguiente</button>
      </div>
    </div>
  `;const o=b("#transactionsPageSize");o&&o.addEventListener("change",s=>Gt(s.target.value))}function K(){const t=u(),e=qt(t.transactions||[]),n=b("#transactionsMetric");n&&(n.textContent=R);const o=b("#recentTransactions"),s=b("#transactionsTable");if(Zt(),!e.length){const d=(t.transactions||[]).length?'<div class="empty-state">Sin movimientos en el periodo seleccionado.</div>':'<div class="empty-state">Sin transacciones registradas.</div>';s.innerHTML=d,o&&!(t.transactions||[]).length&&(o.innerHTML=d);return}const a=d=>{const l=(d||"").toUpperCase();return l==="COMPLETADA"?"Exitoso":l==="RECHAZADA"?"Rechazado":d||"N/D"},i=`
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
      <tbody>${e.map(d=>{const l=(d.movementType||"").toUpperCase()==="DEBITO",y=d.counterpartAccountNumber||"—";return`
      <tr>
        <td>${r(l?d.accountNumber||"N/D":y)}</td>
        <td>${r(l?y:d.accountNumber||"N/D")}</td>
        <td><span class="badge ${Ut(d.movementType)}">${r(d.movementType||"N/D")}</span></td>
        <td>${S(d.amount)}</td>
        <td>${S(d.resultingBalance)}</td>
        <td><span class="badge ${E(d.status)}">${r(a(d.status))}</span></td>
        <td>${T(d.transactionDate)}</td>
        <td>${r(d.message||"N/D")}</td>
      </tr>
    `}).join("")}</tbody>
    </table>
  `;s.innerHTML=i,o&&(o.innerHTML=`<div class="table-wrap compact-table">${i}</div>`)}const J=t=>document.querySelector(t),Xt={summary:"Resumen del lote",detail:"Detalle del lote",charge:"Cargo del lote",receipt:"Comprobante del lote"},Kt={id:"Referencia",fileName:"Archivo",ruc:"RUC",status:"Estado",headerTotalRecords:"Registros",headerTotalAmount:"Monto total",totalAmount:"Monto total",amount:"Monto",chargeAmount:"Valor comision",commissionAmount:"Valor comision",feeAmount:"Valor comision",totalChargeAmount:"Valor comision",chargeStatus:"Respuesta del proceso",commissionStatus:"Estado comision",chargeDate:"Fecha de cobro",receivedAt:"Recibido",createdAt:"Creado",processedAt:"Procesado",updatedAt:"Actualizado",validationResult:"Validacion",batchStatus:"Estado del lote",accountNumber:"Cuenta",description:"Descripcion",message:"Mensaje",notificationStatus:"Estado notif.",rejectionReason:"Motivo rechazo",lineNumber:"Linea",beneficiaryName:"Beneficiario",identification:"Identificacion",identificationNumber:"Identificacion",executedAt:"Ejecutado"},Wt=["fileName","ruc","status","validationResult","batchStatus","headerTotalRecords","totalRecords","processedRecords","successfulRecords","failedRecords","headerTotalAmount","totalAmount","amount","chargeAmount","receivedAt","processedAt","createdAt","message"],F=["chargeAmount","commissionAmount","feeAmount","amount","totalChargeAmount"],Yt=["chargeStatus","commissionStatus","status","result"],te=["lineNumber","accountNumber","beneficiaryName","identification","identificationNumber","amount","status","validationResult","notificationStatus","rejectionReason","message","description","executedAt","createdAt","processedAt"],ee=new Set(["id","batchId","customerId","userId","createdBy","updatedBy","deletedBy","version","trace","stack","rawPayload","payload"]);function z(t,e){return!(e==null||e===""||Array.isArray(e)||typeof e=="object"||ee.has(t)||t.startsWith("_"))}function W(t){return Kt[t]||t.replace(/([A-Z])/g," $1").replace(/^./,e=>e.toUpperCase())}function dt(t,e){if(e==null||e==="")return"N/D";const n=t.toLowerCase();return n.includes("amount")||n.includes("monto")||n.includes("balance")?S(e):n.includes("date")||n.includes("at")||n.includes("fecha")?T(e):String(e)}function ne(t){return String(t||"").trim().toUpperCase()}function j(t){return String((t==null?void 0:t.id)||(t==null?void 0:t.batchId)||(t==null?void 0:t.reference)||"")}function Y(){var t,e;return((e=(t=J("#batchSelector"))==null?void 0:t.value)==null?void 0:e.trim())||""}function q(){const t=Y();return u().batches.find(e=>j(e)===t)||null}function B(t,e){if(!t||typeof t!="object")return;const n=e.find(o=>t[o]!==void 0&&t[o]!==null&&t[o]!=="");return n?t[n]:void 0}function se(t,e){return!t||typeof t!="object"?!1:[t.batchId,t.paymentBatchId,t.loteId,t.idLote,t.reference].filter(n=>n!=null).some(n=>String(n)===String(e))}function oe(t,e){const n=u().charges.find(o=>se(o,t));return n||(Array.isArray(e)?e.find(o=>B(o,F)):e&&typeof e=="object"&&B(e,F)?e:null)}function ae(t,e){const n=oe(t,e),o=ne(B(e,Yt)),s=B(n,F)??B(e,F),a=Number(s||0)>0,c=["REJECTED","RECHAZADO","FAILED","ERROR"].some(y=>o.includes(y));if(!n&&!a&&!o)return"";const i=n||a?"Comision registrada":"Sin cargo confirmado",d=n||a?"is-success":"is-neutral",l=c&&(n||a)?"La respuesta del proceso vino rechazada, pero existe evidencia de comision registrada. No se interpreta como comision pendiente.":"Validado con la informacion operativa disponible para el lote.";return`
    <div class="charge-reconciliation">
      <div>
        <span>Estado operativo del cobro</span>
        <strong class="badge ${d}">${r(i)}</strong>
      </div>
      <div>
        <span>Valor comision</span>
        <strong>${r(S(s||0))}</strong>
      </div>
      <p>${r(l)}</p>
    </div>
  `}function ut(t){return`<span class="badge ${E(t)}">${r(t||"N/D")}</span>`}function re(t,e){return e&&typeof e=="object"&&!Array.isArray(e)?e.status||e.batchStatus||e.validationResult||(t==null?void 0:t.status)||"Generado":(t==null?void 0:t.status)||"Generado"}function G(t,e,n,o){const a=u().session||{},c=new Intl.DateTimeFormat("es-EC",{dateStyle:"medium",timeStyle:"short"}).format(new Date),i=re(n,o),d=Xt[t]||"Reporte del lote";return`
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
          <h3>${r(d)}</h3>
          <p>${r((n==null?void 0:n.fileName)||`Referencia de lote ${e}`)}</p>
        </div>
        <div class="bank-report-status">
          ${ut(i)}
          <small>Emitido ${r(c)}</small>
        </div>
      </header>

      <dl class="bank-report-context">
        <div>
          <dt>Cliente</dt>
          <dd>${r(a.customerName||"Cliente juridico")}</dd>
        </div>
        <div>
          <dt>Identificacion</dt>
          <dd>${r(`${a.identificationType||"RUC"} ${a.identification||(n==null?void 0:n.ruc)||"N/D"}`.trim())}</dd>
        </div>
        <div>
          <dt>Lote consultado</dt>
          <dd>${r((n==null?void 0:n.fileName)||`Lote ${e}`)}</dd>
        </div>
        <div>
          <dt>Fecha de recepcion</dt>
          <dd>${r(T(n==null?void 0:n.receivedAt))}</dd>
        </div>
      </dl>

      ${t==="charge"?ae(e,o):""}

      <section class="bank-report-body">
        <div class="bank-report-section-title">
          <span>Contenido del informe</span>
          <strong>${r(d)}</strong>
        </div>
        ${ce(o)}
      </section>

      <footer class="bank-report-footer">
        <span>Documento informativo generado desde Banca Web BanQuito.</span>
        <strong>Grupo 1 - Switch de pagos</strong>
      </footer>
    </article>
  `}function pt(t){const e=J("#selectedBatchPreview");if(e){if(!t){e.className="selected-batch empty-state",e.innerHTML="Carga los lotes disponibles para elegir una operacion.";return}e.className="selected-batch",e.innerHTML=`
    <div>
      <span>Archivo</span>
      <strong>${r(t.fileName||"Archivo CSV")}</strong>
    </div>
    <div>
      <span>RUC</span>
      <strong>${r(t.ruc||"N/D")}</strong>
    </div>
    <div>
      <span>Estado</span>
      ${ut(t.status)}
    </div>
    <div>
      <span>Monto</span>
      <strong>${S(t.headerTotalAmount)}</strong>
    </div>
    <div>
      <span>Recibido</span>
      <strong>${r(T(t.receivedAt))}</strong>
    </div>
  `}}function tt(){const t=J("#batchSelector");if(!t)return;const e=u(),n=t.value,o=e.batches.slice().sort((s,a)=>Number(a.id||a.batchId||0)-Number(s.id||s.batchId||0));t.innerHTML=['<option value="">Selecciona por archivo, RUC o fecha</option>',...o.map(s=>{const a=j(s),c=[s.fileName||"Archivo CSV",s.ruc?`RUC ${s.ruc}`:"RUC N/D",s.status||"Estado N/D",S(s.headerTotalAmount),T(s.receivedAt)].join(" - ");return`<option value="${r(a)}">${r(c)}</option>`})].join(""),n&&o.some(s=>j(s)===n)?t.value=n:o.length&&(t.value=j(o[0])),pt(q())}function ie(t){const e=Wt.filter(s=>Object.prototype.hasOwnProperty.call(t,s)).filter(s=>z(s,t[s])),n=Object.keys(t).filter(s=>!e.includes(s)).filter(s=>z(s,t[s])).slice(0,10-e.length),o=[...e,...n].map(s=>[s,t[s]]);return o.length?`
    <dl class="report-ledger">
      ${o.map(([s,a])=>`
        <div>
          <dt>${r(W(s))}</dt>
          <dd>${r(dt(s,a))}</dd>
        </div>
      `).join("")}
    </dl>
  `:""}function et(t){if(!t.length)return'<div class="empty-state">Sin registros para mostrar.</div>';const e=te.filter(s=>t.some(a=>z(s,a==null?void 0:a[s]))),n=Array.from(t.reduce((s,a)=>(Object.keys(a||{}).forEach(c=>{!e.includes(c)&&z(c,a[c])&&s.add(c)}),s),new Set)).slice(0,Math.max(0,10-e.length)),o=[...e,...n];return o.length?`
    <div class="table-wrap report-table">
      <table>
        <thead>
          <tr>${o.map(s=>`<th>${r(W(s))}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${t.map(s=>`
            <tr>
              ${o.map(a=>`<td>${r(dt(a,s==null?void 0:s[a]))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:'<div class="empty-state">El reporte no contiene campos operativos para mostrar.</div>'}function ce(t){if(Array.isArray(t))return et(t);if(!t||typeof t!="object")return`<div class="report-note">${r(t||"Sin datos.")}</div>`;const e=Object.entries(t).filter(([,n])=>Array.isArray(n)).map(([n,o])=>`
      <section class="report-section">
        <h3>${r(W(n))}</h3>
        ${et(o)}
      </section>
    `).join("");return`${ie(t)}${e||'<div class="report-note">Sin movimientos o novedades relevantes para mostrar.</div>'}`}function w(t,e=""){const n=J("#reportOutput");n.classList.remove("is-error","is-success","is-info"),e&&n.classList.add(`is-${e}`),n.innerHTML=t}function mt(t,e){const n={fileName:t==null?void 0:t.fileName,ruc:t==null?void 0:t.ruc,status:t==null?void 0:t.status,totalRecords:t==null?void 0:t.headerTotalRecords,totalAmount:t==null?void 0:t.headerTotalAmount,successfulRecords:t==null?void 0:t.successfulRecords,rejectedRecords:t==null?void 0:t.rejectedRecords,receivedAt:t==null?void 0:t.receivedAt};return(e==="charge"||e==="receipt")&&(n.commissionSubtotal=0,n.vatAmount=0,n.totalCharge=0,n.chargeStatus="SIN_CARGO"),n}async function le(t){const e=Y();if(!e){w('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de consultar.</span></div>',"error");return}w('<div class="report-empty"><strong>Consultando reporte...</strong><span>Estamos preparando la informacion del lote seleccionado.</span></div>');const n=q();try{const o=await Ot(t,e);w(G(t,e,n,o))}catch{w(G(t,e,n,mt(n,t)))}}async function de(t){const e=Y();if(!e){w('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de descargar.</span></div>',"error");return}w('<div class="report-empty"><strong>Preparando descarga...</strong><span>El archivo se generara con la referencia interna del lote seleccionado.</span></div>');try{const n=await Bt(t,e);w(`
      <div class="download-card">
        <span>Descarga generada</span>
        <strong>${r(n)}</strong>
        <small>Operacion completada para el lote seleccionado.</small>
      </div>
    `,"success")}catch{const n=q();w(G(t==="receipt-pdf"?"receipt":"summary",e,n,mt(n,"receipt")))}}const f=t=>document.querySelector(t);function nt(){var n;const t=u(),e=t.accounts.find(o=>o.isFavorite);return(e==null?void 0:e.accountNumber)||((n=t.accounts[0])==null?void 0:n.accountNumber)||null}async function Q(){var e;const t=u();if(t.customerType==="JURIDICO"){try{const n=await wt(),o=(e=t.session)==null?void 0:e.identification,s=n.filter(a=>!o||a.ruc===o);h({batches:s,paymentBatches:s})}catch(n){h({batches:[],paymentBatches:[]}),f("#batchesTable").innerHTML=`<div class="empty-state">${r(n.message)}</div>`}me()}}async function ue(){if(u().customerType!=="JURIDICO")return;try{const n=await At();h({charges:n})}catch{h({charges:[]})}const e=f("#chargesMetric");e&&(e.textContent=u().charges.length)}async function pe(){if(u().customerType!=="JURIDICO")return;try{const s=await Nt();h({companyAccount:s})}catch{h({companyAccount:nt()})}u().companyAccount||h({companyAccount:nt()});const n=Mt(u().companyAccount),o=f("#companyAccountMetric");o&&(o.textContent=n),f("#companyAccountHero").textContent=n}function me(){var d;const t=u(),e=f("#batchesMetric"),n=t.paymentBatches||[];e&&(e.textContent=n.length);const o=f("#batchesTable"),s=f("#recentBatches");if(!n.length){const l='<div class="empty-state">Sin lotes cargados todavia.</div>';o.innerHTML=l,s&&(s.innerHTML=l);return}const a=(d=t.session)==null?void 0:d.identification,i=`
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
          <th>Tiempo de proceso</th>
        </tr>
      </thead>
      <tbody>${n.slice().filter(l=>!l.channel||!(l.channel+"").toLowerCase().includes("sftp")).filter(l=>!a||l.ruc===a).filter(l=>!["PROGRAMADO","SCHEDULED"].includes((l.status||"").toUpperCase())).sort((l,y)=>(y.id||0)-(l.id||0)).map(l=>`
      <tr>
        <td>${r(l.id||"N/D")}</td>
        <td>${r(l.fileName||"Archivo CSV")}</td>
        <td>${r(l.ruc||"N/D")}</td>
        <td><span class="badge ${E(l.status)}">${r(l.status||"N/D")}</span></td>
        <td>${r(l.headerTotalRecords||0)}</td>
        <td>${S(l.headerTotalAmount)}</td>
        <td>${T(l.receivedAt)}</td>
        <td>
          <button class="secondary-button" type="button" data-batch-duration="${l.id}">Ver tiempo</button>
          <div id="batchDuration-${l.id}" class="batch-duration-result"></div>
        </td>
      </tr>
    `).join("")}</tbody>
    </table>
  `;o.innerHTML=i,s&&(s.innerHTML=`<div class="table-wrap compact-table">${i}</div>`),tt()}const ft=["PROCESADO","PROCESSED","REJECTED","RECHAZADO"];function st(t){const e=(t||"").toString().toUpperCase();return e.includes("EXITO")||e==="SUCCESS"}function ot(t){const e=(t||"").toString().toUpperCase();return e.includes("RECHAZ")||e==="REJECTED"}async function fe(t){const e=f(`#batchDuration-${t}`);if(e){e.textContent="Consultando...";try{const n=await Rt(Number(t)),o=n.find(c=>(c.newStatus||"").toUpperCase()==="PROCESSING"),s=n.filter(c=>["PROCESSED","REJECTED"].includes((c.newStatus||"").toUpperCase())).sort((c,i)=>new Date(i.changedAt).getTime()-new Date(c.changedAt).getTime())[0];if(!o){e.textContent="Aun no ha comenzado a procesar";return}if(!s){e.textContent="Todavia esta procesando...";return}const a=new Date(s.changedAt).getTime()-new Date(o.changedAt).getTime();e.textContent=`${_(a)} (mm:ss)`}catch{e.textContent="No se pudo obtener el tiempo"}}}function _(t){const e=Math.floor(t/1e3),n=Math.floor(e/60).toString().padStart(2,"0"),o=(e%60).toString().padStart(2,"0");return`${n}:${o}`}function ge(t){const e=t.length,n=t.filter(l=>st(l.status)).length,o=t.filter(l=>ot(l.status)).length,s=n+o,a=f("#uploadCounts");a&&(a.textContent=`${s} / ${e} procesadas (${n} exitosas, ${o} rechazadas)`);const c=f("#uploadProgressBar");c&&(c.style.width=e?`${Math.round(s/e*100)}%`:"0%");const i=f("#uploadLiveRows");if(!i)return;const d=t.filter(l=>st(l.status)||ot(l.status)).slice(-15).reverse();if(!d.length){i.innerHTML='<div class="empty-state">Analizando líneas del archivo...</div>';return}i.innerHTML=`
    <table>
      <thead>
        <tr><th>Línea</th><th>Cuenta destino</th><th>Monto</th><th>Estado</th></tr>
      </thead>
      <tbody>
        ${d.map(l=>`
          <tr>
            <td>${r(l.lineNumber)}</td>
            <td>${r(l.destinationAccountNumber)}</td>
            <td>${S(l.amount)}</td>
            <td><span class="badge ${E(l.status)}">${r(l.status)}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `}function he(t,e){const n=f("#uploadProgressPanel"),o=f("#uploadTimer");n==null||n.classList.remove("is-hidden"),o&&(o.textContent="00:00");const s=Date.now(),a=setInterval(()=>{o&&(o.textContent=_(Date.now()-s))},1e3);let c=0;const i=setInterval(async()=>{c++;try{const[d]=await Promise.all([Et(e),U()]);ge(d);const l=u().batches.find($=>Number($.id)===e),y=((l==null?void 0:l.status)||"").toUpperCase();if(l&&ft.includes(y)){clearInterval(i),clearInterval(a);const $=_(Date.now()-s);o&&(o.textContent=$);const L=["PROCESADO","PROCESSED"].includes(y);p(t,`Procesamiento completado en ${$}. Estado final: ${l.status}`,L?"success":"error");return}}catch{}c>=600&&(clearInterval(i),clearInterval(a),p(t,"El procesamiento está tomando más tiempo del esperado. Actualiza la lista manualmente.","error"))},2e3)}async function ve(t){t.preventDefault();const e=f("#uploadMessage");if(u().customerType!=="JURIDICO"){p(e,"Solo clientes juridicos pueden enviar pagos masivos.","error");return}const o=f("#csvFile").files[0];if(!o){p(e,"Selecciona un archivo CSV.","error");return}const s=f("#uploadProgressPanel");s==null||s.classList.add("is-hidden");const a=f("#uploadLiveRows");a&&(a.innerHTML="");const c=f("#uploadCounts");c&&(c.textContent="0 / 0 procesadas");const i=f("#uploadProgressBar");i&&(i.style.width="0%"),p(e,"Enviando archivo de pagos...");try{const d=await Lt(o);await U();const l=Number(d.batchId),y=(d.batchStatus||"").toUpperCase();if(ft.includes(y)){const $=["PROCESADO","PROCESSED"].includes(y);p(e,`Resultado: ${d.validationResult||"procesado"} | Estado: ${d.batchStatus}`,$?"success":"error")}else p(e,"Lote recibido. Procesando pagos automáticamente... ⏳"),he(e,l)}catch(d){p(e,d.message||"No se pudo cargar el CSV.","error")}}async function ye(t){if(u().customerType==="JURIDICO")try{const n=await It(t);f("#reportOutput").textContent=typeof n=="string"?n:JSON.stringify(n,null,2),await U()}catch(n){f("#reportOutput").textContent=n.message}}async function U(){u().customerType==="JURIDICO"&&await Promise.all([Q(),ue(),pe()])}function Se(t){const e=t.trim().toLowerCase();document.querySelectorAll("tbody tr, .account-card").forEach(n=>{const o=!e||n.textContent.toLowerCase().includes(e);n.classList.toggle("is-filtered",!o)})}const P=t=>document.querySelector(t);async function M(t=!1){if(u().customerType!=="JURIDICO")return;const n=t?null:document.getElementById("loadSftpBatchesButton");n&&(n.disabled=!0,n.innerHTML='<span class="btn-spinner">⟳</span> Actualizando...');try{const s=(await v("/api/switch/v1/payment-batch")).filter(a=>(a.channel+"").toLowerCase().includes("sftp"));h({sftpBatches:s}),$e(),gt()}catch(o){if(h({sftpBatches:[]}),!t){const s=P("#sftpBatchesTable");s&&(s.innerHTML=`<div class="empty-state">${r(o.message)}</div>`)}}finally{n&&(n.disabled=!1,n.innerHTML="⟳ Actualizar")}}function $e(){const e=u().sftpBatches||[],n=P("#sftpBatchesTable");if(!n)return;if(!e.length){n.innerHTML=`
      <div class="empty-state">
        <strong>No hay archivos en el buzón.</strong>
        <br><small>Cuando subas un CSV via SFTP o programes un lote, aparecerá aquí con su estado.</small>
      </div>`;return}const o=e.filter(i=>["PROGRAMADO","PENDIENTE","SCHEDULED","PENDING","RECIBIDO"].includes((i.status||"").toUpperCase())),s=e.filter(i=>!["PROGRAMADO","PENDIENTE","SCHEDULED","PENDING","RECIBIDO"].includes((i.status||"").toUpperCase())),c=[...o.sort((i,d)=>new Date(i.scheduledDate||i.receivedAt).getTime()-new Date(d.scheduledDate||d.receivedAt).getTime()),...s.sort((i,d)=>(d.id||0)-(i.id||0))].map(i=>`
        <tr${["PROGRAMADO","PENDIENTE","SCHEDULED","PENDING","RECIBIDO"].includes((i.status||"").toUpperCase())?' class="row-pending"':""}>
          <td>${r(String(i.id||"N/D"))}</td>
          <td>${r(i.fileName||"archivo.csv")}</td>
          <td><span class="badge ${E(i.status)}">${r(i.status||"N/D")}</span></td>
          <td>${r(String(i.headerTotalRecords||0))}</td>
          <td>${S(i.headerTotalAmount)}</td>
          <td>${T(i.receivedAt)}</td>
          <td>
            ${i.scheduledDate?`<span class="badge badge-info">📅 ${T(i.scheduledDate)}</span>`:'<span class="text-muted">Inmediato</span>'}
          </td>
        </tr>
      `).join("");n.innerHTML=`
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
  `}function gt(){const t=document.getElementById("sftpScheduleSummary");if(!t)return;const o=(u().sftpBatches||[]).filter(i=>["ENCOLADO","PENDIENTE","PENDING"].includes((i.status||"").toUpperCase()));if(o.length===0){t.style.display="none";return}const s=document.getElementById("sftpScheduledDate"),a=s==null?void 0:s.value;let c;if(a){const i=new Date(a),d=i.toLocaleDateString("es-EC",{day:"numeric",month:"short",year:"numeric"}),l=i.toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});c=`📋 ${o.length} ${o.length===1?"archivo":"archivos"} en el buzón ${o.length===1?"será programado":"serán programados"} para el <strong>${d}, ${l}</strong>`}else c=`📋 ${o.length} ${o.length===1?"archivo encolado":"archivos encolados"} en el buzón. Selecciona una fecha y hora para programarlos.`;t.innerHTML=c,t.style.display="block"}async function Ce(t){t.preventDefault();const e=P("#sftpUploadMessage");if(u().customerType!=="JURIDICO"){p(e,"Solo clientes jurídicos pueden programar pagos masivos.","error");return}const o=P("#sftpScheduledDate").value;if(!o){p(e,"Selecciona una fecha y hora de efectivización.","error");return}p(e,"⏳ Aplicando regla de efectivización...");try{const s=await Pt(o);p(e,`✅ Regla de efectivización aplicada. ${s.count||0} lotes del buzón programados para el ${o.replace("T"," ")}`,"success"),P("#sftpScheduledDate").value="",await M()}catch(s){p(e,s.message||"No se pudo aplicar la regla.","error")}}const g=t=>document.querySelector(t),at=t=>Array.from(document.querySelectorAll(t));"scrollRestoration"in history&&(history.scrollRestoration="manual");let x=null;function be(){ht(),x=setInterval(()=>M(!0),3e3)}function ht(){x!==null&&(clearInterval(x),x=null)}async function Te(){const{coreUserId:t,coreStatus:e}=await St();h({coreUserId:t}),g("#coreStatus").textContent=e;const n=g("#portalCoreStatus");n&&(n.textContent=e);const o=await $t();g("#switchStatus").textContent=o}async function rt(t){ht(),X(t),t==="transactions"&&await k(),(t==="payments"||t==="reports")&&(await U(),t==="reports"&&tt()),t==="sftp"&&(await M(),be())}function De(){vt()&&(Z(),V())}function we(){g("#loginForm").addEventListener("submit",Ft),g("#logoutButton").addEventListener("click",Vt),g("#refreshButton").addEventListener("click",async()=>{var e;await V();const t=(e=g(".nav-item.is-active"))==null?void 0:e.dataset.section;t==="transactions"&&await k(),(t==="payments"||t==="reports")&&(await U(),t==="reports"&&tt()),t==="sftp"&&await M()}),g("#globalSearch").addEventListener("input",t=>Se(t.target.value)),g("#applyTransactionsFilterButton").addEventListener("click",kt),g("#clearTransactionsFilterButton").addEventListener("click",Jt),g("#uploadForm").addEventListener("submit",ve),g("#loadBatchesButton").addEventListener("click",Q),g("#batchSelector").addEventListener("change",()=>pt(q())),g("#csvFile").addEventListener("change",t=>{var e;g("#fileName").textContent=((e=t.target.files[0])==null?void 0:e.name)||"Seleccionar CSV"}),g("#sftpUploadForm").addEventListener("submit",Ce),g("#loadSftpBatchesButton").addEventListener("click",M),g("#sftpScheduledDate").addEventListener("input",gt),at(".nav-item").forEach(t=>{t.addEventListener("click",()=>rt(t.dataset.section))}),at("[data-section-shortcut]").forEach(t=>{t.addEventListener("click",()=>rt(t.dataset.sectionShortcut))}),document.addEventListener("click",t=>{const e=t.target.closest("[data-process]");e&&ye(e.dataset.process);const n=t.target.closest("[data-report]");n&&le(n.dataset.report);const o=t.target.closest("[data-download]");o&&de(o.dataset.download),t.target.closest("[data-refresh-reports]")&&Q(),t.target.closest("[data-feature-coming-soon]")&&alert("Estamos trabajando para tu futuro");const c=t.target.closest("[data-batch-duration]");c&&fe(c.dataset.batchDuration);const i=t.target.closest("[data-transactions-prev]");i&&!i.disabled&&_t();const d=t.target.closest("[data-transactions-next]");d&&!d.disabled&&Qt()})}we();Te();De();
