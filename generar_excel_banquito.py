#!/usr/bin/env python3
"""
BancoBanQuito - Generador de Catálogo de Clientes y Cuentas
Simula la misma lógica del DataInitializer de Java (con ordenamiento por cédula/RUC)
para producir un Excel con todos los clientes y sus cuentas.
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ──────────────────────────────────────────────
# CONFIGURACIÓN BASE
# ──────────────────────────────────────────────
BRANCHES = [
    {"code": "001", "name": "Norte"},
    {"code": "002", "name": "Sur"},
    {"code": "003", "name": "Centro"},
    {"code": "004", "name": "Valles"},
    {"code": "005", "name": "Digital"},
]

NOMBRES = ["Juan","Maria","Carlos","Ana","Luis","Gabriela","Pedro","Daniela",
           "Jorge","Paola","Andres","Camila","Diego","Valeria","Fernando",
           "Sofia","Mateo","Carolina","Ricardo","Isabel","Sebastian","Diana",
           "Esteban","Fernanda","Cristian","Andrea","Mauricio","Karla"]

APELLIDOS = ["Perez","Garcia","Morales","Vera","Cevallos","Mendoza","Castro",
             "Zambrano","Rojas","Sanchez","Ortiz","Torres","Salazar","Guerrero",
             "Navarrete","Paredes","Espinoza","Romero","Alvarez","Delgado",
             "Molina","Quintero","Benitez","Cabrera","Vargas","Acosta"]

COMPANY_NAMES = [
    "Inversiones Andinas del Ecuador S.A.",
    "Comercializadora Pichincha Cía. Ltda.",
    "Grupo Empresarial Pacífico S.A.",
    "Importadora Continental Cía. Ltda.",
    "Distribuciones Sierra Verde S.A.",
    "Tecnologías Innovación Ecuador S.A.",
    "Construcciones Metropolitanas S.A.",
    "Agroindustrial Cóndor Cía. Ltda.",
    "Transportes Nacionales Unidos S.A.",
    "Soluciones Corporativas Andes S.A.",
    "Industrias Alimenticias del Norte Cía. Ltda.",
    "Grupo Logístico Manabí S.A.",
    "Servicios Financieros Austral Cía. Ltda.",
    "Exportadora Amazónica S.A.",
    "Consultora Empresarial Cuenca Cía. Ltda.",
    "Manufactura Especializada Guayas S.A.",
    "Telecomunicaciones Nacionales S.A.",
    "Inmobiliaria Capital Norte Cía. Ltda.",
    "Seguridad Integral Ecuatoriana S.A.",
    "Farmacéutica Andina Cía. Ltda.",
    "Energía Renovable del Ecuador S.A.",
    "Textiles del Oriente Cía. Ltda.",
    "Automotriz Nacional S.A.",
    "Hotelería y Turismo Galápagos Cía. Ltda.",
    "Alimentos Procesados del Sur S.A.",
    "Ingeniería Civil y Arquitectura Cía. Ltda.",
    "Servicios de Salud Integral S.A.",
    "Tecnología Agropecuaria Nacional Cía. Ltda.",
    "Retail y Comercio Especializado S.A.",
    "Grupo Empresarial Tungurahua Cía. Ltda.",
    "Distribuciones Comerciales Loja S.A.",
    "Petroquímica Ecuatoriana Cía. Ltda.",
    "Ganadería y Producción Agropecuaria S.A.",
    "Centro Comercial Metropolitano Cía. Ltda.",
    "Producción Audiovisual Nacional S.A.",
    "Gestión Ambiental Sostenible Cía. Ltda.",
    "Industria Plástica Especializada S.A.",
    "Operaciones Mineras del Norte Cía. Ltda.",
    "Desarrollo Inmobiliario Moderno S.A.",
    "Servicios Informáticos Avanzados Cía. Ltda.",
    "Exportaciones Marítimas Ecuatorianas S.A.",
    "Procesadora de Alimentos Nativos Cía. Ltda.",
    "Construcciones Viales Nacionales S.A.",
    "Servicios Educativos Superiores Cía. Ltda.",
    "Distribución Eléctrica Nacional S.A.",
    "Laboratorios del Austro Cía. Ltda.",
    "Corporación Manufacturera del Pacífico S.A.",
    "Recursos Naturales Amazónicos Cía. Ltda.",
    "Innovación Biotecnológica Ecuador S.A.",
    "Servicios Portuarios Nacionales Cía. Ltda.",
]

# ──────────────────────────────────────────────
# ALGORITMOS (misma lógica que Java)
# ──────────────────────────────────────────────
def generate_cedula(index):
    province = (index % 24) + 1
    province_code = f"{province:02d}"
    sequence = 100000 + index
    seq_str = f"{sequence:06d}"[:6]
    base = province_code + seq_str + "0"
    coefficients = [2,1,2,1,2,1,2,1,2]
    total = 0
    for i in range(9):
        value = int(base[i]) * coefficients[i]
        if value >= 10:
            value -= 9
        total += value
    verifier = 0 if total % 10 == 0 else 10 - (total % 10)
    return base + str(verifier)

def generate_ruc(index):
    return f"179{index:07d}001"

def acc(branch_code, seq):
    return branch_code + f"{seq:07d}"

# ──────────────────────────────────────────────
# DATOS FIJOS (demo)
# ──────────────────────────────────────────────
DEMO_NATURALS = [
    {"cedula":"1750285577","nombre":"Anahy Herrera Morales",       "email":"anahyherrera09082002@gmail.com",     "tel":"0992832595"},
    {"cedula":"1724356789","nombre":"Carlos Mendoza Rios",         "email":"carlos.mendoza@banquito.fin.ec",     "tel":"0987123456"},
    {"cedula":"1712034567","nombre":"Maria Salazar Vega",          "email":"maria.salazar@banquito.fin.ec",      "tel":"0998234567"},
    {"cedula":"1738901234","nombre":"Luis Ortega Caicedo",         "email":"luis.ortega@banquito.fin.ec",        "tel":"0976345678"},
    {"cedula":"1745678901","nombre":"Gabriela Torres Espinoza",    "email":"gabriela.torres@banquito.fin.ec",    "tel":"0969456789"},
    {"cedula":"1752345678","nombre":"Diego Castro Paredes",        "email":"diego.castro@banquito.fin.ec",       "tel":"0995567890"},
    {"cedula":"1761234567","nombre":"Valeria Guerrero Acosta",     "email":"valeria.guerrero@banquito.fin.ec",   "tel":"0982678901"},
    {"cedula":"1768901234","nombre":"Sebastian Navarrete Ruiz",    "email":"sebastian.navarrete@banquito.fin.ec","tel":"0991789012"},
]

DEMO_COMPANIES = [
    {"ruc":"1757158215001","nombre":"TechSolutions Ecuador S.A.",    "email":"info@techsolutions.ec"},
    {"ruc":"1791234567001","nombre":"Importadora Andina Cía. Ltda.", "email":"contacto@importandina.ec"},
    {"ruc":"1791765432001","nombre":"Distribuidora El Comercio S.A.","email":"gerencia@distcomercio.ec"},
]

# ──────────────────────────────────────────────
# GENERAR CLIENTES MASIVOS
# ──────────────────────────────────────────────
naturals_map = {c["cedula"]: c for c in DEMO_NATURALS}
idx = 1
while len(naturals_map) < 500:
    cedula = generate_cedula(idx)
    if cedula not in naturals_map:
        nom = NOMBRES[idx % len(NOMBRES)]
        ap1 = APELLIDOS[idx % len(APELLIDOS)]
        ap2 = APELLIDOS[(idx + 9) % len(APELLIDOS)]
        naturals_map[cedula] = {
            "cedula": cedula,
            "nombre": f"{nom} {ap1} {ap2}",
            "email": f"{nom.lower()}.{ap1.lower()}{idx}@banquito.com",
            "tel": f"09{idx:08d}"
        }
    idx += 1

companies_map = {c["ruc"]: c for c in DEMO_COMPANIES}
cidx = 1
while len(companies_map) < 50:
    ruc = generate_ruc(cidx)
    if ruc not in companies_map:
        companies_map[ruc] = {
            "ruc": ruc,
            "nombre": COMPANY_NAMES[(cidx - 1) % len(COMPANY_NAMES)],
            "email": f"empresa{cidx}@banquito.com"
        }
    cidx += 1

sorted_naturals  = sorted(naturals_map.values(),  key=lambda x: x["cedula"])
sorted_companies = sorted(companies_map.values(), key=lambda x: x["ruc"])

# ──────────────────────────────────────────────
# ASIGNAR CUENTAS (misma lógica que initMassiveAccounts)
# ──────────────────────────────────────────────
seq = 1

# 1. Cada natural → 1 cuenta Ahorros
for i, nat in enumerate(sorted_naturals):
    b = BRANCHES[i % 5]
    nat["cta_ahorros"]      = acc(b["code"], seq); seq += 1
    nat["suc_ahorros"]      = b["name"]
    nat["cta_corriente"]    = None
    nat["suc_corriente"]    = None

# 2. Primeros 100 naturales (20%) → también cuenta Corriente
for i in range(100):
    b = BRANCHES[i % 5]
    nat = sorted_naturals[i]
    nat["cta_corriente"]  = acc(b["code"], seq); seq += 1
    nat["suc_corriente"]  = b["name"]

# 3. Cada empresa → Operativa (CTE), Nómina (NOM), Impuestos (AHO)
for i, comp in enumerate(sorted_companies):
    b = BRANCHES[i % 5]
    comp["cta_operativa"]  = acc(b["code"], seq); seq += 1
    comp["suc_operativa"]  = b["name"]
    comp["cta_nomina"]     = acc(b["code"], seq); seq += 1
    comp["suc_nomina"]     = b["name"]
    comp["cta_impuestos"]  = acc(b["code"], seq); seq += 1
    comp["suc_impuestos"]  = b["name"]

# ──────────────────────────────────────────────
# ESTILOS
# ──────────────────────────────────────────────
HDR_FILL_NAT  = PatternFill("solid", fgColor="1a3c6e")
HDR_FILL_CORP = PatternFill("solid", fgColor="0d5c3a")
HDR_FONT      = Font(color="FFFFFF", bold=True, size=10)
DEMO_FILL     = PatternFill("solid", fgColor="fff3cd")
EVEN_FILL     = PatternFill("solid", fgColor="f4f8ff")
ODD_FILL      = PatternFill("solid", fgColor="FFFFFF")
CORP_EVEN     = PatternFill("solid", fgColor="f0fff4")
CORP_ODD      = PatternFill("solid", fgColor="FFFFFF")
TITLE_FONT    = Font(bold=True, size=14, color="1a3c6e")
SUBHDR_FONT   = Font(bold=True, size=10)

thin = Side(style="thin", color="d0d7e4")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)

CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)
LEFT   = Alignment(horizontal="left",   vertical="center", wrap_text=True)

DEMO_CEDULAS = {c["cedula"] for c in DEMO_NATURALS}
DEMO_RUCS    = {c["ruc"]    for c in DEMO_COMPANIES}

def style_row(ws, row_num, cells, fill, bold=False):
    for c in cells:
        cell = ws.cell(row=row_num, column=c)
        cell.fill  = fill
        cell.border = BORDER
        cell.alignment = LEFT
        if bold:
            cell.font = Font(bold=True, size=9)
        else:
            cell.font = Font(size=9)

def write_header(ws, row, cols, fill):
    for ci, title in enumerate(cols, 1):
        cell = ws.cell(row=row, column=ci, value=title)
        cell.fill  = fill
        cell.font  = HDR_FONT
        cell.border = BORDER
        cell.alignment = CENTER

# ──────────────────────────────────────────────
# HOJA 1: CLIENTES NATURALES
# ──────────────────────────────────────────────
wb = openpyxl.Workbook()
ws_nat = wb.active
ws_nat.title = "Clientes Naturales"
ws_nat.freeze_panes = "A5"

ws_nat.merge_cells("A1:L1")
t = ws_nat["A1"]
t.value = "BancoBanQuito — Catálogo de Clientes Naturales"
t.font  = TITLE_FONT
t.alignment = CENTER

ws_nat.merge_cells("A2:L2")
s = ws_nat["A2"]
s.value = f"Total: {len(sorted_naturals)} clientes | 20% con 2 cuentas (primeros 100) | Saldo inicial: $1,000.00 cada cuenta"
s.font  = SUBHDR_FONT
s.alignment = CENTER

HDR_NAT = ["#","Cédula","Nombre Completo","Email","Teléfono",
           "Sucursal","N° Cuenta Ahorros","Sucursal Ahorros",
           "N° Cuenta Corriente","Sucursal Corriente",
           "Saldo Inicial","Nota"]
write_header(ws_nat, 4, HDR_NAT, HDR_FILL_NAT)

DEMO_LABEL = "★ Demo"
for row_i, nat in enumerate(sorted_naturals, 1):
    r = row_i + 4
    is_demo  = nat["cedula"] in DEMO_CEDULAS
    has_two  = nat["cta_corriente"] is not None
    fill     = DEMO_FILL if is_demo else (EVEN_FILL if row_i % 2 == 0 else ODD_FILL)
    nota     = DEMO_LABEL if is_demo else ("2 cuentas" if has_two else "")

    vals = [
        row_i, nat["cedula"], nat["nombre"], nat["email"], nat["tel"],
        nat.get("suc_ahorros",""),
        nat["cta_ahorros"],
        nat.get("suc_ahorros",""),
        nat["cta_corriente"] or "—",
        nat.get("suc_corriente","") or "—",
        "$1,000.00",
        nota
    ]
    for ci, v in enumerate(vals, 1):
        cell = ws_nat.cell(row=r, column=ci, value=v)
        cell.fill   = fill
        cell.border = BORDER
        cell.font   = Font(size=9, bold=is_demo)
        cell.alignment = CENTER if ci in (1,11) else LEFT

ws_nat.column_dimensions["A"].width = 5
ws_nat.column_dimensions["B"].width = 14
ws_nat.column_dimensions["C"].width = 28
ws_nat.column_dimensions["D"].width = 35
ws_nat.column_dimensions["E"].width = 14
ws_nat.column_dimensions["F"].width = 12
ws_nat.column_dimensions["G"].width = 16
ws_nat.column_dimensions["H"].width = 12
ws_nat.column_dimensions["I"].width = 16
ws_nat.column_dimensions["J"].width = 12
ws_nat.column_dimensions["K"].width = 13
ws_nat.column_dimensions["L"].width = 10
ws_nat.row_dimensions[1].height = 28
ws_nat.row_dimensions[4].height = 30

# ──────────────────────────────────────────────
# HOJA 2: EMPRESAS
# ──────────────────────────────────────────────
ws_corp = wb.create_sheet("Empresas Corporativas")
ws_corp.freeze_panes = "A5"

ws_corp.merge_cells("A1:K1")
t2 = ws_corp["A1"]
t2.value = "BancoBanQuito — Catálogo de Clientes Corporativos"
t2.font  = Font(bold=True, size=14, color="0d5c3a")
t2.alignment = CENTER

ws_corp.merge_cells("A2:K2")
s2 = ws_corp["A2"]
s2.value = f"Total: {len(sorted_companies)} empresas | Cada empresa tiene 3 cuentas: Operativa, Nómina e Impuestos | Saldo inicial: $1,000.00"
s2.font  = SUBHDR_FONT
s2.alignment = CENTER

HDR_CORP = ["#","RUC","Razón Social","Email",
            "N° Cuenta Operativa","Suc. Operativa",
            "N° Cuenta Nómina","Suc. Nómina",
            "N° Cuenta Impuestos","Suc. Impuestos",
            "Nota"]
write_header(ws_corp, 4, HDR_CORP, HDR_FILL_CORP)

for row_i, comp in enumerate(sorted_companies, 1):
    r = row_i + 4
    is_demo = comp["ruc"] in DEMO_RUCS
    fill    = DEMO_FILL if is_demo else (CORP_EVEN if row_i % 2 == 0 else CORP_ODD)
    nota    = DEMO_LABEL if is_demo else "Pagos Masivos"

    vals = [
        row_i, comp["ruc"], comp["nombre"], comp["email"],
        comp["cta_operativa"],  comp["suc_operativa"],
        comp["cta_nomina"],     comp["suc_nomina"],
        comp["cta_impuestos"],  comp["suc_impuestos"],
        nota
    ]
    for ci, v in enumerate(vals, 1):
        cell = ws_corp.cell(row=r, column=ci, value=v)
        cell.fill   = fill
        cell.border = BORDER
        cell.font   = Font(size=9, bold=is_demo)
        cell.alignment = CENTER if ci == 1 else LEFT

ws_corp.column_dimensions["A"].width = 5
ws_corp.column_dimensions["B"].width = 16
ws_corp.column_dimensions["C"].width = 40
ws_corp.column_dimensions["D"].width = 32
ws_corp.column_dimensions["E"].width = 18
ws_corp.column_dimensions["F"].width = 12
ws_corp.column_dimensions["G"].width = 18
ws_corp.column_dimensions["H"].width = 12
ws_corp.column_dimensions["I"].width = 18
ws_corp.column_dimensions["J"].width = 12
ws_corp.column_dimensions["K"].width = 13
ws_corp.row_dimensions[1].height = 28
ws_corp.row_dimensions[4].height = 30

# ──────────────────────────────────────────────
# HOJA 3: RESUMEN
# ──────────────────────────────────────────────
ws_res = wb.create_sheet("Resumen")

resumen = [
    ("BancoBanQuito — Resumen de Volumetría", ""),
    ("",""),
    ("Categoría","Valor"),
    ("Clientes Naturales (Individuales)", len(sorted_naturals)),
    ("  - Con 1 cuenta (Ahorros)", 400),
    ("  - Con 2 cuentas (Ahorros + Corriente, 20%)", 100),
    ("Clientes Corporativos (Empresas)", len(sorted_companies)),
    ("  - Cuenta Operativa (Corriente)", len(sorted_companies)),
    ("  - Cuenta Nómina", len(sorted_companies)),
    ("  - Cuenta Impuestos/Reservas (Ahorros)", len(sorted_companies)),
    ("",""),
    ("Total cuentas naturales", 500 + 100),
    ("Total cuentas corporativas (mínimo 3 c/u)", len(sorted_companies)*3),
    ("Total cuentas base (natural + corp)", 600 + len(sorted_companies)*3),
    ("Cuentas adicionales corp. para llegar a 1,500", 1500 - 600 - len(sorted_companies)*3),
    ("TOTAL CUENTAS ACTIVAS", 1500),
    ("",""),
    ("Sucursales",""),
    ("001 - Sucursal Norte","Quito Norte"),
    ("002 - Sucursal Sur","Quito Sur"),
    ("003 - Sucursal Centro","Quito Centro"),
    ("004 - Sucursal Valles","Los Valles"),
    ("005 - Sucursal Digital","Digital / Online"),
    ("",""),
    ("Tipos de cuenta","Código"),
    ("Ahorros","AHO"),
    ("Corriente","CTE"),
    ("Nómina","NOM"),
    ("",""),
    ("Saldo inicial de apertura","$1,000.00 USD"),
    ("Formato número de cuenta","SUCURSAL(3) + SECUENCIAL(7) = 10 dígitos"),
]

for ri, (k, v) in enumerate(resumen, 1):
    ws_res.cell(row=ri, column=1, value=k).font = Font(bold=(ri in (1,3,12,13,14,15,16,18,24,28,29)), size=10)
    ws_res.cell(row=ri, column=2, value=v).font = Font(size=10)

ws_res.column_dimensions["A"].width = 50
ws_res.column_dimensions["B"].width = 20
ws_res["A1"].font = Font(bold=True, size=14, color="1a3c6e")

# ──────────────────────────────────────────────
# GUARDAR
# ──────────────────────────────────────────────
out = "/Users/anahy/Desktop/Arquitectura/grupo1_BancoBanQuito/BancoBanQuito_Clientes_Cuentas.xlsx"
wb.save(out)
print(f"✅ Excel generado: {out}")
print(f"   Hoja 1: {len(sorted_naturals)} clientes naturales")
print(f"   Hoja 2: {len(sorted_companies)} empresas corporativas")
print(f"   Hoja 3: Resumen de volumetría")
