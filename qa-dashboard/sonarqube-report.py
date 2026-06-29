#!/usr/bin/env python3
import json
import os
import sys
import re
import argparse
import urllib.request
import urllib.error
import base64
from datetime import datetime


BASE_URL = "http://localhost:9000"


# ── Traducciones de mensajes de reglas de SonarQube ─────────────────

RULE_TRANSLATIONS = {
    # ── Vulnerabilidades ──
    "typescript:S2068": (
        r"Review this potentially hard-coded password\.",
        "Revise esta posible contraseña hardcodeada."
    ),
    "Web:S5725": (
        r"Make sure not using resource integrity feature is safe here\.",
        "Asegúrese de que no usar integridad de recursos sea seguro aquí."
    ),
    # ── Bugs ──
    "typescript:S1082": (
        r"Visible, non-interactive elements with click handlers must have at least one keyboard listener\.",
        "Elementos visibles no interactivos con click deben tener un listener de teclado."
    ),
    # ── Code Smells - Críticos ──
    "typescript:S3776": (
        r"Refactor this function to reduce its Cognitive Complexity from (\d+) to the (\d+) allowed\.",
        r"Refactorice esta función para reducir su Complejidad Cognitiva de \1 a \2."
    ),
    "typescript:S3735": (
        r"Remove this use of the \"void\" operator\.",
        "Elimine este uso del operador \"void\"."
    ),
    "python:S1845": (
        r"Rename field \"([^\"]+)\" to prevent any misunderstanding/clash with field \"([^\"]+)\" defined on line (\d+)",
        r"Renombre el campo \"\1\" para evitar conflicto con \"\2\" definido en línea \3."
    ),
    # ── Code Smells - Comunes ──
    "typescript:S1128": (
        r"Remove this unused import of '([^']+)'\.",
        r"Elimine este import no utilizado de '\1'."
    ),
    "typescript:S6848": (
        r"Avoid non-native interactive elements\. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element\.",
        "Evite elementos interactivos no nativos. Si no es posible usar HTML nativo, agregue un rol apropiado y soporte para tabulación, mouse, teclado y táctil."
    ),
    "typescript:S6582": (
        r"Prefer using an optional chain expression instead, as it's more concise and easier to read\.",
        "Prefiera usar una expresión optional chain, es más concisa y fácil de leer."
    ),
    "typescript:S6479": (
        r"Do not use Array index in keys",
        "No use índices de Array como keys"
    ),
    "typescript:S3358": (
        r"Extract this nested ternary operation into an independent statement\.",
        "Extraiga esta operación ternaria anidada a una declaración independiente."
    ),
    "typescript:S6759": (
        r"Mark the props of the component as read-only\.",
        "Marque las props del componente como read-only."
    ),
    "typescript:S7773": (
        "Prefer `(Number\\.\\w+)` over `(\\w+)`.",
        "Prefiera `\\1` en lugar de `\\2`."
    ),
    "typescript:S7776": (
        r"`([^`]+)` should be a `Set`, and use `([^`]+)` to check existence or non-existence\.",
        '`\\1` deber\u00eda ser un `Set`, use `\\2` para verificar existencia.'
    ),
    "typescript:S7721": (
        r"Move function '([^']+)' to the outer scope\.",
        "Mueva la funci\u00f3n '\\1' al \u00e1mbito superior."
    ),
    "typescript:S7764": (
        "Prefer `globalThis\\.?\\w*` over `window`.",
        "Prefiera `globalThis` en lugar de `window`."
    ),
    "typescript:S4325": (
        r"This assertion is unnecessary since the receiver accepts the original type of the expression\.",
        "Esta aserci\u00f3n es innecesaria, el receptor ya acepta el tipo original."
    ),
    "typescript:S6478": (
        r"Move this component definition out of the parent component and pass data as props\.",
        "Mueva esta definici\u00f3n de componente fuera del componente padre y pase datos como props."
    ),
    "typescript:S7744": (
        r"The empty object is useless\.",
        "El objeto vac\u00edo es in\u00fatil."
    ),
    "typescript:S6551": (
        "'([^']+)' will use Object's default stringification format \\('([^']+)'\\) when stringified\\.",
        "'\\1' usar\u00e1 formato de stringificaci\u00f3n por defecto ('\\2')."
    ),
    "typescript:S6847": (
        r"Non-interactive elements should not be assigned mouse or keyboard event listeners\.",
        "Elementos no interactivos no deber\u00edan tener listeners de mouse o teclado."
    ),
    "typescript:S6754": (
        r"useState call is not destructured into value \+ setter pair",
        "La llamada a useState no est\u00e1 desestructurada en par valor + setter"
    ),
    "typescript:S6481": (
        r"The object passed as the value prop to the Context provider changes every render\. To fix this consider wrapping it in a useMemo hook\.",
        "El objeto pasado como prop value al Context provider cambia en cada render. Considere usar useMemo."
    ),
    "typescript:S6819": (
        r"Use <progress> instead of the \"progressbar\" role to ensure accessibility across all devices\.",
        "Utilice <progress> en lugar del rol \"progressbar\" para asegurar accesibilidad."
    ),
    "typescript:S6850": (
        r"Headings must have content and the content must be accessible by a screen reader\.",
        "Los encabezados deben tener contenido accesible por lector de pantalla."
    ),
    "css:S7924": (
        r"Text does not meet the minimal contrast requirement with its background\.",
        "El texto no cumple con el contraste mínimo con su fondo."
    ),
    # ── Hotspots ──
    "typescript:S5852": (
        r"Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service\.",
        "Asegúrese de que la regex usada aquí, vulnerable a tiempo de ejecución super-lineal por backtracking, no pueda causar denegación de servicio."
    ),
    "typescript:S2245": (
        r"Make sure that using this pseudorandom number generator is safe here\.",
        "Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí."
    ),
}


def translate_message(rule_key, message):
    if rule_key in RULE_TRANSLATIONS:
        pattern, replacement = RULE_TRANSLATIONS[rule_key]
        return re.sub(pattern, replacement, message)
    return message
PROJECT_KEY = "parcial-ingenieria"


def api_get(endpoint, auth_header):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", auth_header)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Error {e.code} en {endpoint}: {body}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"No se pudo conectar a {url}: {e.reason}")
        print("¿Está SonarQube corriendo en localhost:9000?")
        sys.exit(1)


def get_auth_header(args):
    if args.token:
        encoded = base64.b64encode(f"{args.token}:".encode()).decode()
        return f"Basic {encoded}"
    encoded = base64.b64encode(f"{args.user}:{args.password}".encode()).decode()
    return f"Basic {encoded}"


def fetch_measures(auth):
    metrics = "ncloc,bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_rating,reliability_rating,sqale_rating,alert_status"
    data = api_get(f"/api/measures/component?component={PROJECT_KEY}&metricKeys={metrics}", auth)
    return {m["metric"]: m.get("value", "0") for m in data.get("component", {}).get("measures", [])}


def fetch_quality_gate(auth):
    data = api_get(f"/api/qualitygates/project_status?projectKey={PROJECT_KEY}", auth)
    return data.get("projectStatus", {})


def fetch_issues(auth, page=1, page_size=500):
    data = api_get(
        f"/api/issues/search?componentKeys={PROJECT_KEY}&ps={page_size}&p={page}&facets=severities,types",
        auth,
    )
    return data


def fetch_all_issues(auth):
    first = fetch_issues(auth, page=1, page_size=500)
    total = first.get("total", 0)
    all_issues = first.get("issues", [])
    ps = first.get("ps", 500)
    pages = (total + ps - 1) // ps
    for p in range(2, pages + 1):
        all_issues.extend(fetch_issues(auth, page=p, page_size=ps).get("issues", []))
    return all_issues, first.get("facets", [])


def fetch_hotspots(auth):
    data = api_get(f"/api/hotspots/search?projectKey={PROJECT_KEY}&ps=500", auth)
    return data.get("hotspots", []), data.get("paging", {}).get("total", 0)


def rating_label(rating):
    labels = {"1.0": "A", "2.0": "B", "3.0": "C", "4.0": "D", "5.0": "E"}
    return labels.get(str(rating), rating)


def short_path(component):
    return component.split(":", 1)[-1] if ":" in component else component


# ── HTML generator ──────────────────────────────────────────────────

def severity_color(sev):
    return {"BLOCKER": "#dc3545", "CRITICAL": "#e67e22", "MAJOR": "#e6a817", "MINOR": "#17a2b8", "INFO": "#6c757d"}.get(sev.upper(), "#6c757d")


def severity_badge_html(sev):
    colors = {"BLOCKER": "danger", "CRITICAL": "warning", "MAJOR": "major", "MINOR": "info", "INFO": "secondary"}
    labels = {"BLOCKER": "Blocker", "CRITICAL": "Critical", "MAJOR": "Major", "MINOR": "Minor", "INFO": "Info"}
    c = colors.get(sev.upper(), "secondary")
    l = labels.get(sev.upper(), sev)
    return f'<span class="badge badge-{c}">{l}</span>'


def type_badge_html(t):
    colors = {"BUG": "danger", "VULNERABILITY": "warning", "CODE_SMELL": "info"}
    c = colors.get(t.upper(), "secondary")
    return f'<span class="badge badge-{c}">{t.replace("_", " ").title()}</span>'


def generate_html(measures, qg_status, issues, facets, hotspots):
    qg_level = qg_status.get("status", "OK")
    qg_ok = qg_level == "OK"
    qg_color = "success" if qg_ok else "danger"
    qg_text = "Pasó" if qg_ok else "No pasó"

    ncloc = measures.get("ncloc", "0")
    bugs = measures.get("bugs", "0")
    vulns = measures.get("vulnerabilities", "0")
    smells = measures.get("code_smells", "0")
    coverage = measures.get("coverage", "0")
    duplications = measures.get("duplicated_lines_density", "0")
    sec_rating = rating_label(measures.get("security_rating", "1.0"))
    rel_rating = rating_label(measures.get("reliability_rating", "1.0"))
    sqale_rating = rating_label(measures.get("sqale_rating", "1.0"))

    severity_facet = {}
    type_facet = {}
    for f in facets:
        if f["property"] == "severities":
            severity_facet = {v["val"]: v["count"] for v in f["values"]}
        elif f["property"] == "types":
            type_facet = {v["val"]: v["count"] for v in f["values"]}

    rows = ""
    for issue in issues:
        sev = issue.get("severity", "INFO")
        typ = issue.get("type", "CODE_SMELL")
        component = issue.get("component", "")
        sp = short_path(component)
        line = issue.get("line", "")
        msg = translate_message(issue.get("rule", ""), issue.get("message", ""))
        rows += f"""
            <tr>
                <td class="file-cell" title="{sp}">{os.path.basename(sp)}</td>
                <td>{type_badge_html(typ)}</td>
                <td>{severity_badge_html(sev)}</td>
                <td class="line-cell">{line}</td>
                <td class="desc-cell">{msg}</td>
                <td class="path-cell">{sp}</td>
            </tr>"""

    if not rows:
        rows = '<tr><td colspan="6" class="empty-cell">Sin issues detectados</td></tr>'

    hotspot_rows = ""
    for h in hotspots:
        sp = short_path(h.get("component", ""))
        line = h.get("line", "")
        cat = h.get("securityCategory", "").replace("-", " ").title()
        msg = translate_message(h.get("ruleKey", ""), h.get("message", ""))
        prob = h.get("vulnerabilityProbability", "")
        hotspot_rows += f"""
            <tr>
                <td class="file-cell" title="{sp}">{os.path.basename(sp)}</td>
                <td>{cat}</td>
                <td class="line-cell">{prob}</td>
                <td class="line-cell">{line}</td>
                <td class="desc-cell">{msg}</td>
            </tr>"""

    if not hotspot_rows:
        hotspot_rows = '<tr><td colspan="5" class="empty-cell">Sin hotspots detectados</td></tr>'

    severities_json = json.dumps(severity_facet)
    types_json = json.dumps(type_facet)

    total_issues = len(issues)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SonarQube Report — AML/KYC</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #333; }}
.header {{ background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; padding: 28px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }}
.header h1 {{ font-size: 22px; font-weight: 600; }}
.header p {{ font-size: 13px; opacity: 0.7; margin-top: 4px; }}
.header-right {{ display: flex; align-items: center; gap: 16px; }}
.qg-badge {{ padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }}
.qg-success {{ background: rgba(40,167,69,0.2); color: #5cde7a; border: 1px solid rgba(40,167,69,0.4); }}
.qg-danger {{ background: rgba(220,53,69,0.2); color: #ff6b7a; border: 1px solid rgba(220,53,69,0.4); }}
.container {{ max-width: 1320px; margin: 0 auto; padding: 30px 20px; }}
.section-title {{ font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; padding-left: 2px; }}
.cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 14px; margin-bottom: 28px; }}
.card {{ background: #fff; border-radius: 12px; padding: 18px 20px 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); border-top: 3px solid #e0e0e0; position: relative; }}
.card .label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #aaa; font-weight: 600; }}
.card .value {{ font-size: 28px; font-weight: 700; margin-top: 4px; }}
.card-ncloc {{ border-top-color: #6c757d; }}
.card-bugs {{ border-top-color: #dc3545; }}
.card-vulns {{ border-top-color: #e67e22; }}
.card-smells {{ border-top-color: #e6a817; }}
.card-coverage {{ border-top-color: #28a745; }}
.card-duplications {{ border-top-color: #17a2b8; }}
.card-sec {{ border-top-color: #dc3545; }}
.card-rel {{ border-top-color: #e67e22; }}
.card-sqale {{ border-top-color: #28a745; }}
.charts {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }}
.chart-box {{ background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }}
.chart-box h3 {{ font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; }}
.table-box {{ background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); margin-bottom: 28px; }}
table {{ width: 100%; border-collapse: collapse; }}
th {{ background: #f8f9fa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eee; }}
td {{ padding: 10px 16px; border-top: 1px solid #f2f2f2; font-size: 13px; vertical-align: top; }}
tr:hover td {{ background: #fafbfc; }}
.badge {{ display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }}
.badge-success {{ background: #d4f4dd; color: #0a5c27; }}
.badge-warning {{ background: #fff3cd; color: #856404; }}
.badge-danger {{ background: #fde8ea; color: #9b1c2a; }}
.badge-major {{ background: #fef7e0; color: #8a6d02; }}
.badge-info {{ background: #d6edf5; color: #0a5a75; }}
.badge-secondary {{ background: #e9ecef; color: #495057; }}
.file-cell {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #444; }}
.line-cell {{ font-family: 'SFMono-Regular', Consolas, monospace; color: #aaa; font-size: 12px; text-align: center; }}
.desc-cell {{ color: #555; max-width: 350px; font-size: 12px; }}
.path-cell {{ font-size: 11px; color: #999; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
.empty-cell {{ text-align: center; color: #ccc; padding: 28px; font-size: 13px; }}
.footer {{ text-align: center; padding: 28px; font-size: 12px; color: #ccc; }}
.rating-badge {{ display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; font-weight: 700; font-size: 14px; color: #fff; }}
.rating-A {{ background: #28a745; }}
.rating-B {{ background: #e6a817; }}
.rating-C {{ background: #e67e22; }}
.rating-D {{ background: #dc3545; }}
.rating-E {{ background: #6c1f1f; }}
.summary-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 28px; }}
.summary-item {{ background: #fff; border-radius: 12px; padding: 18px 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); display: flex; justify-content: space-between; align-items: center; }}
.summary-item .label {{ font-size: 12px; color: #888; }}
.summary-item .value {{ font-size: 20px; font-weight: 700; }}
@media (max-width: 768px) {{ .charts {{ grid-template-columns: 1fr; }} .header {{ padding: 20px; }} .desc-cell {{ max-width: 140px; }} .path-cell {{ display: none; }} }}
</style>
</head>
<body>

<div class="header">
    <div>
        <h1>SonarQube Report — AML/KYC</h1>
        <p>{PROJECT_KEY} &bull; Generado el {now}</p>
    </div>
    <div class="header-right">
        <span class="qg-badge qg-{qg_color}">Quality Gate: {qg_text}</span>
    </div>
</div>

<div class="container">

<p class="section-title">Métricas del proyecto ({ncloc} líneas de código)</p>
<div class="cards">
    <div class="card card-bugs">
        <div class="label">Bugs</div>
        <div class="value" style="color:#dc3545">{bugs}</div>
    </div>
    <div class="card card-vulns">
        <div class="label">Vulnerabilidades</div>
        <div class="value" style="color:#e67e22">{vulns}</div>
    </div>
    <div class="card card-smells">
        <div class="label">Code Smells</div>
        <div class="value" style="color:#e6a817">{smells}</div>
    </div>
    <div class="card card-coverage">
        <div class="label">Cobertura</div>
        <div class="value" style="color:#28a745">{coverage}%</div>
    </div>
    <div class="card card-duplications">
        <div class="label">Duplicación</div>
        <div class="value" style="color:#17a2b8">{duplications}%</div>
    </div>
</div>

<p class="section-title">Ratings</p>
<div class="cards">
    <div class="card card-sec">
        <div class="label">Seguridad</div>
        <div class="value"><span class="rating-badge rating-{sec_rating}">{sec_rating}</span></div>
    </div>
    <div class="card card-rel">
        <div class="label">Confiabilidad</div>
        <div class="value"><span class="rating-badge rating-{rel_rating}">{rel_rating}</span></div>
    </div>
    <div class="card card-sqale">
        <div class="label">Mantenibilidad</div>
        <div class="value"><span class="rating-badge rating-{sqale_rating}">{sqale_rating}</span></div>
    </div>
</div>

<div class="charts">
    <div class="chart-box">
        <h3>Distribución por Severidad</h3>
        <div style="position:relative;height:240px"><canvas id="severityChart"></canvas></div>
    </div>
    <div class="chart-box">
        <h3>Distribución por Tipo</h3>
        <div style="position:relative;height:240px"><canvas id="typeChart"></canvas></div>
    </div>
</div>

<p class="section-title">Security Hotspots ({len(hotspots)})</p>
<div class="table-box" style="margin-bottom:28px">
    <table>
        <thead>
            <tr>
                <th>Archivo</th>
                <th>Categoría</th>
                <th style="text-align:center">Probabilidad</th>
                <th style="text-align:center">Línea</th>
                <th>Descripción</th>
            </tr>
        </thead>
        <tbody>
            {hotspot_rows}
        </tbody>
    </table>
</div>

<p class="section-title">Issues detectados ({total_issues})</p>
<div class="table-box">
    <table>
        <thead>
            <tr>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Severidad</th>
                <th style="text-align:center">Línea</th>
                <th>Descripción</th>
                <th>Ruta</th>
            </tr>
        </thead>
        <tbody>
            {rows}
        </tbody>
    </table>
</div>

</div>

<div class="footer">
    Generado por SonarQube Report Script &bull; {now}
</div>

<script>
const severityData = {severities_json};
new Chart(document.getElementById('severityChart'), {{
    type: 'bar',
    data: {{
        labels: Object.keys(severityData),
        datasets: [{{
            label: 'Issues',
            data: Object.values(severityData),
            backgroundColor: ['#dc3545', '#e67e22', '#e6a817', '#17a2b8', '#6c757d'],
            borderRadius: 4
        }}]
    }},
    options: {{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {{ legend: {{ display: false }} }},
        scales: {{ y: {{ beginAtZero: true, ticks: {{ precision: 0 }} }} }}
    }}
}});

const typeData = {types_json};
new Chart(document.getElementById('typeChart'), {{
    type: 'doughnut',
    data: {{
        labels: Object.keys(typeData),
        datasets: [{{
            data: Object.values(typeData),
            backgroundColor: ['#dc3545', '#e67e22', '#17a2b8'],
            borderWidth: 2,
            borderColor: '#fff'
        }}]
    }},
    options: {{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {{ legend: {{ position: 'bottom', labels: {{ boxWidth: 12, font: {{ size: 12 }} }} }} }}
    }}
}});
</script>

</body>
</html>"""
    return html


# ── Markdown generator ──────────────────────────────────────────────

def severity_badge_md(sev):
    labels = {"BLOCKER": "🔴 Blocker", "CRITICAL": "🟠 Critical", "MAJOR": "🟡 Major", "MINOR": "🔵 Minor", "INFO": "⚪ Info"}
    return labels.get(sev.upper(), sev)


def type_badge_md(t):
    icons = {"BUG": "🐛", "VULNERABILITY": "🔓", "CODE_SMELL": "🧹"}
    labels = {"BUG": "Bug", "VULNERABILITY": "Vulnerabilidad", "CODE_SMELL": "Code Smell"}
    return f"{icons.get(t.upper(), '❓')} {labels.get(t.upper(), t.replace('_', ' ').title())}"


def generate_markdown(measures, qg_status, issues, facets, hotspots):
    qg_level = qg_status.get("status", "OK")
    qg_ok = qg_level == "OK"
    qg_icon = "✅" if qg_ok else "❌"
    qg_text = "Pasó" if qg_ok else "No pasó"

    ncloc = measures.get("ncloc", "0")
    bugs = measures.get("bugs", "0")
    vulns = measures.get("vulnerabilities", "0")
    smells = measures.get("code_smells", "0")
    coverage = measures.get("coverage", "0")
    duplications = measures.get("duplicated_lines_density", "0")
    sec_rating = rating_label(measures.get("security_rating", "1.0"))
    rel_rating = rating_label(measures.get("reliability_rating", "1.0"))
    sqale_rating = rating_label(measures.get("sqale_rating", "1.0"))

    severity_facet = {}
    type_facet = {}
    for f in facets:
        if f["property"] == "severities":
            severity_facet = {v["val"]: v["count"] for v in f["values"]}
        elif f["property"] == "types":
            type_facet = {v["val"]: v["count"] for v in f["values"]}

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines = []
    lines.append(f"# SonarQube Report — AML/KYC")
    lines.append(f"")
    lines.append(f"> Generado el {now} | Proyecto: `{PROJECT_KEY}`")
    lines.append(f"")

    # ── Resumen ──
    lines.append(f"## Resumen")
    lines.append(f"")
    lines.append(f"| Métrica | Valor |")
    lines.append(f"|---------|-------|")
    lines.append(f"| **Quality Gate** | {qg_icon} {qg_text} |")
    lines.append(f"| **Líneas de código** | {ncloc} |")
    lines.append(f"| **Bugs** | {bugs} |")
    lines.append(f"| **Vulnerabilidades** | {vulns} |")
    lines.append(f"| **Code Smells** | {smells} |")
    lines.append(f"| **Cobertura** | {coverage}% |")
    lines.append(f"| **Duplicación** | {duplications}% |")
    lines.append(f"| **Rating Seguridad** | {sec_rating} |")
    lines.append(f"| **Rating Confiabilidad** | {rel_rating} |")
    lines.append(f"| **Rating Mantenibilidad** | {sqale_rating} |")
    lines.append(f"")

    # Distribución por severidad
    lines.append(f"### Distribución por Severidad")
    lines.append(f"")
    lines.append(f"| Severidad | Cantidad |")
    lines.append(f"|-----------|----------|")
    sev_order = ["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "INFO"]
    for s in sev_order:
        c = severity_facet.get(s, 0)
        if c > 0:
            lines.append(f"| {severity_badge_md(s)} | {c} |")
    lines.append(f"")

    # Distribución por tipo
    lines.append(f"### Distribución por Tipo")
    lines.append(f"")
    lines.append(f"| Tipo | Cantidad |")
    lines.append(f"|------|----------|")
    for t, c in type_facet.items():
        lines.append(f"| {type_badge_md(t)} | {c} |")
    lines.append(f"")

    # ── Security Hotspots ──
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Hotspots de Seguridad ({len(hotspots)})")
    lines.append(f"")
    if hotspots:
        lines.append(f"| Archivo | Línea | Categoría | Probabilidad | Descripción |")
        lines.append(f"|---------|:-----:|-----------|:------------:|-------------|")
        for h in hotspots:
            sp = short_path(h.get("component", ""))
            line = h.get("line", "")
            cat = h.get("securityCategory", "").replace("-", " ").title()
            cat_es = {"Dos": "DoS (Denegación de Servicio)", "Weak Cryptography": "Criptografía Débil"}.get(cat, cat)
            msg = translate_message(h.get("ruleKey", ""), h.get("message", ""))
            prob = h.get("vulnerabilityProbability", "")
            lines.append(f"| `{sp}` | {line} | {cat_es} | {prob} | {msg} |")
    else:
        lines.append(f"_No se detectaron hotspots de seguridad._")
    lines.append(f"")

    # ── Vulnerabilidades ──
    vuln_issues = [i for i in issues if i.get("type") == "VULNERABILITY"]
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Vulnerabilidades ({len(vuln_issues)})")
    lines.append(f"")
    if vuln_issues:
        lines.append(f"| Severidad | Archivo | Línea | Regla | Descripción |")
        lines.append(f"|-----------|---------|:-----:|-------|-------------|")
        for i in vuln_issues:
            sev = i.get("severity", "")
            sp = short_path(i.get("component", ""))
            line = i.get("line", "")
            rule = i.get("rule", "")
            msg = translate_message(rule, i.get("message", ""))
            lines.append(f"| {severity_badge_md(sev)} | `{sp}` | {line} | `{rule}` | {msg} |")
    else:
        lines.append(f"_No se detectaron vulnerabilidades._")
    lines.append(f"")

    # ── Bugs ──
    bug_issues = [i for i in issues if i.get("type") == "BUG"]
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Bugs ({len(bug_issues)})")
    lines.append(f"")
    if bug_issues:
        lines.append(f"| Severidad | Archivo | Línea | Regla | Descripción |")
        lines.append(f"|-----------|---------|:-----:|-------|-------------|")
        for i in bug_issues:
            sev = i.get("severity", "")
            sp = short_path(i.get("component", ""))
            line = i.get("line", "")
            rule = i.get("rule", "")
            msg = translate_message(rule, i.get("message", ""))
            lines.append(f"| {severity_badge_md(sev)} | `{sp}` | {line} | `{rule}` | {msg} |")
    else:
        lines.append(f"_No se detectaron bugs._")
    lines.append(f"")

    # ── Code Smells ──
    smell_issues = [i for i in issues if i.get("type") == "CODE_SMELL"]
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Code Smells ({len(smell_issues)})")
    lines.append(f"")
    if smell_issues:
        lines.append(f"| Severidad | Archivo | Línea | Regla | Descripción |")
        lines.append(f"|-----------|---------|:-----:|-------|-------------|")
        for i in smell_issues:
            sev = i.get("severity", "")
            sp = short_path(i.get("component", ""))
            line = i.get("line", "")
            rule = i.get("rule", "")
            msg = translate_message(rule, i.get("message", ""))
            lines.append(f"| {severity_badge_md(sev)} | `{sp}` | {line} | `{rule}` | {msg} |")
    else:
        lines.append(f"_No se detectaron code smells._")
    lines.append(f"")

    # ── Recomendaciones ──
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Recomendaciones")
    lines.append(f"")
    blocker = severity_facet.get("BLOCKER", 0)
    critical = severity_facet.get("CRITICAL", 0)
    if blocker > 0:
        lines.append(f"- **🔴 Prioridad crítica:** {blocker} issue(s) Blocker — corregir inmediatamente.")
    if critical > 0:
        lines.append(f"- **🟠 Prioridad alta:** {critical} issue(s) Critical — corregir pronto.")
    if vuln_issues:
        lines.append(f"- **🔓 Revisar vulnerabilidades:** {len(vuln_issues)} vulnerabilidad(es) de seguridad.")
    if hotspots:
        lines.append(f"- **⚠️ Revisar hotspots:** {len(hotspots)} hotspot(s) de seguridad pendientes de revisión.")
    lines.append(f"- **🧪 Mejorar cobertura:** La cobertura de tests está en {coverage}% — se recomienda al menos 50%.")
    lines.append(f"")

    return "\n".join(lines)


# ── CLI ─────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(description="Genera reporte desde SonarQube (HTML o Markdown)")
    auth = parser.add_mutually_exclusive_group(required=True)
    auth.add_argument("--token", help="Token de SonarQube")
    auth.add_argument("--password", help="Contraseña (usuario: admin)")
    parser.add_argument("--user", default="admin", help="Usuario de SonarQube (default: admin)")
    parser.add_argument("--format", choices=["html", "md"], default="html", help="Formato del reporte (default: html)")
    parser.add_argument("--output", default=None, help="Ruta del archivo generado")
    return parser.parse_args()


def main():
    args = parse_args()
    if args.password:
        args.token = None
    auth = get_auth_header(args)

    print("Conectando a SonarQube...")
    measures = fetch_measures(auth)
    qg_status = fetch_quality_gate(auth)
    issues, facets = fetch_all_issues(auth)
    hotspots, hotspot_total = fetch_hotspots(auth)

    print(f"  Proyecto: {PROJECT_KEY}")
    print(f"  Issues: {len(issues)}")
    print(f"  Security Hotspots: {hotspot_total}")
    print(f"  Quality Gate: {qg_status.get('status', '?')}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    ext = "html" if args.format == "html" else "md"
    default_name = f"sonar-report.{ext}"
    out_path = args.output or os.path.join(script_dir, default_name)

    if args.format == "html":
        content = generate_html(measures, qg_status, issues, facets, hotspots)
    else:
        content = generate_markdown(measures, qg_status, issues, facets, hotspots)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\nReporte generado: {os.path.abspath(out_path)} ({ext.upper()})")


if __name__ == "__main__":
    main()
