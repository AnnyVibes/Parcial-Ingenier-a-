#!/usr/bin/env python3
import json
import os
import sys
import glob
from datetime import datetime


REPORTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")


def load_reports():
    reports = []
    pattern = os.path.join(REPORTS_DIR, "*.json")
    for path in sorted(glob.glob(pattern)):
        try:
            with open(path) as f:
                data = json.load(f)
            if "fecha" in data and "total_issues" in data:
                reports.append(data)
        except (json.JSONDecodeError, IOError):
            pass
    return sorted(reports, key=lambda r: r.get("fecha", ""))


def state_color(state):
    return {"saludable": "success", "atencion": "warning", "critico": "danger"}.get(state, "secondary")


def state_label(state):
    return {"saludable": "Saludable", "atencion": "Atención", "critico": "Crítico"}.get(state, state)


def severity_badge(sev):
    colors = {"critico": "danger", "medio": "warning", "bajo": "success"}
    labels = {"critico": "Crítico", "medio": "Medio", "bajo": "Bajo"}
    c = colors.get(sev, "secondary")
    l = labels.get(sev, sev.capitalize())
    return f'<span class="badge badge-{c}">{l}</span>'


def delta_html(curr, prev):
    diff = curr - prev
    if diff > 0:
        return f'<span class="delta delta-up">▲ {diff}</span>'
    elif diff < 0:
        return f'<span class="delta delta-down">▼ {abs(diff)}</span>'
    return '<span class="delta delta-neutral">— 0</span>'


def generate_html(reports):
    if not reports:
        return "<html><body><h1>No se encontraron reportes</h1></body></html>"

    latest = reports[-1]
    prev = reports[-2] if len(reports) >= 2 else None

    last_date = latest.get("fecha", "—")
    current_state = latest.get("estado", "—")
    total = latest.get("total_issues", 0)
    latest_criticos = latest.get("criticos", 0)
    latest_medios = latest.get("medios", 0)
    latest_bajos = latest.get("bajos", 0)

    dates_json = json.dumps([r.get("fecha") for r in reports])
    criticos_json = json.dumps([r.get("criticos", 0) for r in reports])
    medios_json = json.dumps([r.get("medios", 0) for r in reports])
    bajos_json = json.dumps([r.get("bajos", 0) for r in reports])

    if prev:
        delta_total = delta_html(total, prev.get("total_issues", 0))
        delta_crit = delta_html(latest_criticos, prev.get("criticos", 0))
        delta_med = delta_html(latest_medios, prev.get("medios", 0))
        delta_low = delta_html(latest_bajos, prev.get("bajos", 0))
    else:
        delta_total = delta_crit = delta_med = delta_low = ""

    table_rows = ""
    for r in reversed(reports):
        st = r.get("estado", "")
        sc = state_color(st)
        sl = state_label(st)
        table_rows += f"""
            <tr>
                <td>{r.get("fecha", "")}</td>
                <td>{r.get("total_issues", 0)}</td>
                <td style="color:#dc3545;font-weight:600">{r.get("criticos", 0)}</td>
                <td style="color:#e67e22;font-weight:600">{r.get("medios", 0)}</td>
                <td style="color:#28a745;font-weight:600">{r.get("bajos", 0)}</td>
                <td><span class="badge badge-{sc}">{sl}</span></td>
            </tr>"""

    detalles = latest.get("detalles", {}).get("archivos", [])
    detail_rows = ""
    for issue in detalles:
        ruta = issue.get("ruta", "")
        filename = os.path.basename(ruta) if ruta else "—"
        tipo = issue.get("tipo", "").capitalize()
        sev = issue.get("severidad", "")
        linea = issue.get("linea", "—")
        desc = issue.get("descripcion", "—")
        detail_rows += f"""
            <tr>
                <td title="{ruta}" class="file-cell">{filename}</td>
                <td>{tipo}</td>
                <td>{severity_badge(sev)}</td>
                <td class="line-cell">{linea}</td>
                <td class="desc-cell">{desc}</td>
            </tr>"""

    if not detail_rows:
        detail_rows = '<tr><td colspan="5" class="empty-cell">Sin issues detectados</td></tr>'

    sint = latest.get("sintaxis", 0)
    comp = latest.get("complejidad", 0)
    seg = latest.get("seguridad", 0)
    pie_has_data = (sint + comp + seg) > 0

    if pie_has_data:
        pie_canvas = '<div style="position:relative;height:210px"><canvas id="pieChart"></canvas></div>'
        pie_script = f"""
const last = {json.dumps(latest)};
new Chart(document.getElementById('pieChart'), {{
    type: 'doughnut',
    data: {{
        labels: ['Sintaxis', 'Complejidad', 'Seguridad'],
        datasets: [{{
            data: [last.sintaxis || 0, last.complejidad || 0, last.seguridad || 0],
            backgroundColor: ['#17a2b8', '#ffc107', '#dc3545'],
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
}});"""
    else:
        pie_canvas = '<div class="pie-empty">Sin issues detectados</div>'
        pie_script = ""

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QA Dashboard — AML/KYC</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #333; }}
.header {{ background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; padding: 28px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }}
.header h1 {{ font-size: 24px; font-weight: 600; }}
.header p {{ font-size: 13px; opacity: 0.7; margin-top: 4px; }}
.header-state {{ background: rgba(255,255,255,0.13); border-radius: 8px; padding: 8px 18px; font-size: 13px; white-space: nowrap; }}
.container {{ max-width: 1280px; margin: 0 auto; padding: 30px 20px; }}
.section-title {{ font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; padding-left: 2px; }}
.cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 16px; margin-bottom: 28px; }}
.card {{ background: #fff; border-radius: 12px; padding: 20px 22px 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); border-top: 3px solid #e0e0e0; position: relative; }}
.card-total {{ border-top-color: #6c757d; }}
.card-estado {{ border-top-color: #0f3460; }}
.card-fecha {{ border-top-color: #17a2b8; }}
.card-critico {{ border-top-color: #dc3545; }}
.card-medio {{ border-top-color: #e67e22; }}
.card-bajo {{ border-top-color: #28a745; }}
.card .label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #aaa; font-weight: 600; }}
.card .value {{ font-size: 30px; font-weight: 700; margin-top: 6px; }}
.delta {{ font-size: 11px; font-weight: 600; position: absolute; top: 12px; right: 14px; }}
.delta-up {{ color: #dc3545; }}
.delta-down {{ color: #28a745; }}
.delta-neutral {{ color: #ccc; }}
.charts {{ display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 28px; }}
.chart-box {{ background: #fff; border-radius: 12px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }}
.chart-box h3 {{ font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; }}
.pie-empty {{ display: flex; align-items: center; justify-content: center; height: 180px; color: #ccc; font-size: 14px; }}
.table-box {{ background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); margin-bottom: 28px; }}
table {{ width: 100%; border-collapse: collapse; }}
th {{ background: #f8f9fa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eee; }}
td {{ padding: 11px 16px; border-top: 1px solid #f2f2f2; font-size: 13px; }}
tr:hover td {{ background: #fafbfc; }}
.badge {{ display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }}
.badge-success {{ background: #d4f4dd; color: #0a5c27; }}
.badge-warning {{ background: #fff3cd; color: #856404; }}
.badge-danger {{ background: #fde8ea; color: #9b1c2a; }}
.file-cell {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #444; }}
.line-cell {{ font-family: 'SFMono-Regular', Consolas, monospace; color: #aaa; font-size: 12px; text-align: center; }}
.desc-cell {{ color: #555; max-width: 380px; }}
.empty-cell {{ text-align: center; color: #ccc; padding: 28px; font-size: 13px; }}
.footer {{ text-align: center; padding: 28px; font-size: 12px; color: #ccc; }}
@media (max-width: 768px) {{ .charts {{ grid-template-columns: 1fr; }} .header {{ padding: 20px; }} .desc-cell {{ max-width: 140px; }} }}
</style>
</head>
<body>

<div class="header">
    <div>
        <h1>QA Dashboard — AML/KYC</h1>
        <p>Monitoreo de calidad de código &bull; Análisis estático y seguridad</p>
    </div>
    <div class="header-state">
        Estado: <strong>{state_label(current_state)}</strong> &bull; {last_date}
    </div>
</div>

<div class="container">

<p class="section-title">Resumen del último análisis</p>
<div class="cards">
    <div class="card card-total">
        <div class="label">Total Issues</div>
        <div class="value">{total}</div>
        {delta_total}
    </div>
    <div class="card card-estado">
        <div class="label">Estado Actual</div>
        <div class="value"><span class="badge badge-{state_color(current_state)}" style="font-size:16px;padding:5px 14px">{state_label(current_state)}</span></div>
    </div>
    <div class="card card-fecha">
        <div class="label">Última Revisión</div>
        <div class="value" style="font-size:17px;padding-top:5px">{last_date}</div>
    </div>
    <div class="card card-critico">
        <div class="label">Críticos</div>
        <div class="value" style="color:#dc3545">{latest_criticos}</div>
        {delta_crit}
    </div>
    <div class="card card-medio">
        <div class="label">Medios</div>
        <div class="value" style="color:#e67e22">{latest_medios}</div>
        {delta_med}
    </div>
    <div class="card card-bajo">
        <div class="label">Bajos</div>
        <div class="value" style="color:#28a745">{latest_bajos}</div>
        {delta_low}
    </div>
</div>

<div class="charts">
    <div class="chart-box">
        <h3>Tendencia de Issues por Severidad</h3>
        <div style="position:relative;height:210px"><canvas id="lineChart"></canvas></div>
    </div>
    <div class="chart-box">
        <h3>Distribución por Categoría</h3>
        {pie_canvas}
    </div>
</div>

<p class="section-title">Detalle de issues detectados</p>
<div class="table-box">
    <table>
        <thead>
            <tr>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Severidad</th>
                <th style="text-align:center">Línea</th>
                <th>Descripción</th>
            </tr>
        </thead>
        <tbody>
            {detail_rows}
        </tbody>
    </table>
</div>

<p class="section-title">Historial de revisiones</p>
<div class="table-box">
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Total</th>
                <th>Críticos</th>
                <th>Medios</th>
                <th>Bajos</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            {table_rows}
        </tbody>
    </table>
</div>

</div>

<div class="footer">
    Última generación: {now} &mdash; QA Dashboard AML/KYC
</div>

<script>
const dates = {dates_json};
const criticos = {criticos_json};
const medios = {medios_json};
const bajos = {bajos_json};

new Chart(document.getElementById('lineChart'), {{
    type: 'line',
    data: {{
        labels: dates,
        datasets: [
            {{ label: 'Críticos', data: criticos, borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.07)', tension: 0.3, fill: true, pointRadius: 5, pointHoverRadius: 7 }},
            {{ label: 'Medios', data: medios, borderColor: '#e67e22', backgroundColor: 'rgba(230,126,34,0.07)', tension: 0.3, fill: true, pointRadius: 5, pointHoverRadius: 7 }},
            {{ label: 'Bajos', data: bajos, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.07)', tension: 0.3, fill: true, pointRadius: 5, pointHoverRadius: 7 }}
        ]
    }},
    options: {{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {{ legend: {{ position: 'bottom', labels: {{ boxWidth: 12, font: {{ size: 12 }} }} }} }},
        scales: {{ y: {{ beginAtZero: true, ticks: {{ precision: 0, stepSize: 1 }} }} }}
    }}
}});
{pie_script}
</script>

</body>
</html>"""
    return html


def main():
    reports = load_reports()
    if not reports:
        print("No se encontraron reportes en reports/")
        sys.exit(1)

    html = generate_html(reports)
    out_path = os.path.join(REPORTS_DIR, "..", "dashboard.html")
    with open(out_path, "w") as f:
        f.write(html)
    print(f"Dashboard generado: {os.path.abspath(out_path)}")

    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        port = 8080
        print(f"Sirviendo en http://localhost:{port}")
        os.chdir(os.path.dirname(out_path))
        import subprocess
        try:
            subprocess.run(["python3", "-m", "http.server", str(port)], check=True)
        except KeyboardInterrupt:
            print("\nServidor detenido.")


if __name__ == "__main__":
    main()
