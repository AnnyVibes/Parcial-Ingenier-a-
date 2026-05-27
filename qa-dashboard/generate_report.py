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


def generate_html(reports):
    if not reports:
        return "<html><body><h1>No reports found</h1></body></html>"

    latest = reports[-1]
    last_date = latest.get("fecha", "—")
    current_state = latest.get("estado", "—")
    total = latest.get("total_issues", 0)

    dates_json = json.dumps([r.get("fecha") for r in reports])
    criticos_json = json.dumps([r.get("criticos", 0) for r in reports])
    medios_json = json.dumps([r.get("medios", 0) for r in reports])
    bajos_json = json.dumps([r.get("bajos", 0) for r in reports])

    latest_criticos = latest.get("criticos", 0)
    latest_medios = latest.get("medios", 0)
    latest_bajos = latest.get("bajos", 0)

    table_rows = ""
    for r in reversed(reports):
        st = r.get("estado", "")
        sc = state_color(st)
        sl = state_label(st)
        table_rows += f"""
            <tr>
                <td>{r.get("fecha", "")}</td>
                <td>{r.get("total_issues", 0)}</td>
                <td>{r.get("criticos", 0)}</td>
                <td>{r.get("medios", 0)}</td>
                <td>{r.get("bajos", 0)}</td>
                <td><span class="badge badge-{sc}">{sl}</span></td>
            </tr>"""

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QA Dashboard — AML/KYC</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #333; }}
.header {{ background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; padding: 28px 40px; }}
.header h1 {{ font-size: 24px; font-weight: 600; }}
.header p {{ font-size: 13px; opacity: 0.7; margin-top: 4px; }}
.container {{ max-width: 1200px; margin: 0 auto; padding: 30px 20px; }}
.cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }}
.card {{ background: #fff; border-radius: 10px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }}
.card .label {{ font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; }}
.card .value {{ font-size: 32px; font-weight: 700; margin-top: 6px; }}
.charts {{ display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px; }}
.chart-box {{ background: #fff; border-radius: 10px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }}
.chart-box h3 {{ font-size: 14px; color: #555; margin-bottom: 14px; }}
table {{ width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }}
th {{ background: #f8f9fa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; padding: 14px 16px; text-align: left; }}
td {{ padding: 12px 16px; border-top: 1px solid #eee; font-size: 14px; }}
tr:hover {{ background: #fafbfc; }}
.badge {{ display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }}
.badge-success {{ background: #d4edda; color: #155724; }}
.badge-warning {{ background: #fff3cd; color: #856404; }}
.badge-danger {{ background: #f8d7da; color: #721c24; }}
.footer {{ text-align: center; padding: 24px; font-size: 12px; color: #999; }}
@media (max-width: 768px) {{ .charts {{ grid-template-columns: 1fr; }} }}
</style>
</head>
<body>

<div class="header">
    <h1>QA Dashboard — AML/KYC</h1>
    <p>Monitoreo de calidad de código • Análisis estático y seguridad</p>
</div>

<div class="container">

<div class="cards">
    <div class="card">
        <div class="label">Total Issues</div>
        <div class="value">{total}</div>
    </div>
    <div class="card">
        <div class="label">Estado Actual</div>
        <div class="value"><span class="badge badge-{state_color(current_state)}" style="font-size:20px">{state_label(current_state)}</span></div>
    </div>
    <div class="card">
        <div class="label">Última Revisión</div>
        <div class="value" style="font-size:20px">{last_date}</div>
    </div>
    <div class="card">
        <div class="label">Críticos</div>
        <div class="value" style="color:#dc3545">{latest_criticos}</div>
    </div>
    <div class="card">
        <div class="label">Medios</div>
        <div class="value" style="color:#e67e22">{latest_medios}</div>
    </div>
    <div class="card">
        <div class="label">Bajos</div>
        <div class="value" style="color:#28a745">{latest_bajos}</div>
    </div>
</div>

<div class="charts">
    <div class="chart-box">
        <h3>Tendencia de Issues por Severidad</h3>
        <canvas id="lineChart" height="220"></canvas>
    </div>
    <div class="chart-box">
        <h3>Distribución Actual por Categoría</h3>
        <canvas id="pieChart" height="220"></canvas>
    </div>
</div>

<div class="chart-box" style="padding:0;overflow:hidden">
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
            {{ label: 'Críticos', data: criticos, borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.05)', tension: 0.3, fill: true, pointRadius: 4 }},
            {{ label: 'Medios', data: medios, borderColor: '#e67e22', backgroundColor: 'rgba(230,126,34,0.05)', tension: 0.3, fill: true, pointRadius: 4 }},
            {{ label: 'Bajos', data: bajos, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.05)', tension: 0.3, fill: true, pointRadius: 4 }}
        ]
    }},
    options: {{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {{ legend: {{ position: 'bottom' }} }},
        scales: {{ y: {{ beginAtZero: true }} }}
    }}
}});

const last = {json.dumps(latest)};
new Chart(document.getElementById('pieChart'), {{
    type: 'pie',
    data: {{
        labels: ['Sintaxis', 'Complejidad', 'Seguridad'],
        datasets: [{{
            data: [last.sintaxis || 0, last.complejidad || 0, last.seguridad || 0],
            backgroundColor: ['#17a2b8', '#ffc107', '#dc3545'],
            borderWidth: 0
        }}]
    }},
    options: {{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {{ legend: {{ position: 'bottom' }} }}
    }}
}});
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
        with os.popen(f"python3 -m http.server {port} 2>/dev/null") as proc:
            pass


if __name__ == "__main__":
    main()
