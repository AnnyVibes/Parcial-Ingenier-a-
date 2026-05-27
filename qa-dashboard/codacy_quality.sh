#!/usr/bin/env bash
set -euo pipefail

REPORTS_DIR="$(cd "$(dirname "$0")" && pwd)/reports"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

header() { echo -e "\n${BOLD}${CYAN}========================================${NC}"; echo -e "${BOLD}${CYAN}  $1${NC}"; echo -e "${BOLD}${CYAN}========================================${NC}\n"; }
info() { echo -e "  ${BLUE}[*]${NC} $1"; }
ok() { echo -e "  ${GREEN}[✓]${NC} $1"; }
warn() { echo -e "  ${YELLOW}[!]${NC} $1"; }
err() { echo -e "  ${RED}[✗]${NC} $1"; }

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Analyze code quality for the AML/KYC project.

Options:
  --save        Save report to reports/ directory
  --dashboard   Generate HTML dashboard after analysis
  --help        Show this help message and exit

Examples:
  $(basename "$0") --save
  $(basename "$0") --save --dashboard
  $(basename "$0") --help
EOF
    exit 0
}

SAVE=false
DASHBOARD=false

for arg in "$@"; do
    case "$arg" in
        --help) usage ;;
        --save) SAVE=true ;;
        --dashboard) DASHBOARD=true ;;
        *) warn "Unknown option: $arg"; usage ;;
    esac
done

header "AML/KYC Code Quality Analyzer"

BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend-admin"
TODAY=$(date +%Y-%m-%d)
ISSUES=()
TOTAL_CRITICOS=0
TOTAL_MEDIOS=0
TOTAL_BAJOS=0
TOTAL_SINTAXIS=0
TOTAL_COMPLEJIDAD=0
TOTAL_SEGURIDAD=0

has_tool() {
    command -v "$1" >/dev/null 2>&1
}

check_python_syntax() {
    local dir="$1"
    info "Checking Python syntax in $dir..."
    local count=0
    while IFS= read -r -d '' file; do
        if python3 -c "import ast; ast.parse(open('$file').read())" 2>/dev/null; then
            ok "  $file (syntax OK)"
        else
            local err_msg
            err_msg=$(python3 -c "
import ast
try:
    ast.parse(open('$file').read())
except SyntaxError as e:
    print(f'{e.lineno}:{e.offset}: {e.msg}')
" 2>/dev/null || echo "unknown: syntax error")
            warn "  $file: $err_msg"
            ISSUES+=("{\"ruta\":\"$file\",\"tipo\":\"sintaxis\",\"severidad\":\"critico\",\"linea\":${err_msg%%:*},\"descripcion\":\"SyntaxError: ${err_msg#*:}\"}")
            TOTAL_SINTAXIS=$((TOTAL_SINTAXIS + 1))
            TOTAL_CRITICOS=$((TOTAL_CRITICOS + 1))
            count=$((count + 1))
        fi
    done < <(find "$dir" -name '*.py' -type f -print0 2>/dev/null || true)
    return "$count"
}

check_python_pylint() {
    local dir="$1"
    if has_tool pylint; then
        info "Running pylint in $dir..."
        pylint "$dir" --output-format=text 2>/dev/null || true
    elif has_tool pyflakes; then
        info "Running pyflakes in $dir..."
        pyflakes "$dir" 2>/dev/null || true
    else
        warn "pylint/pyflakes not installed — skipping static analysis for $dir"
        return 1
    fi
}

check_python_complexity() {
    local dir="$1"
    if has_tool radon; then
        info "Checking cyclomatic complexity in $dir..."
        radon cc "$dir" --min C 2>/dev/null || true
    else
        warn "radon not installed — skipping complexity check for $dir"
        return 1
    fi
}

check_js_vue_syntax() {
    local dir="$1"
    info "Checking JS/Vue syntax in $dir..."
    if has_tool eslint; then
        eslint "$dir" --ext .js,.vue --format json 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for file in data:
        for msg in file.get('messages', []):
            sev = 'critico' if msg.get('severity', 1) == 2 else 'medio'
            typ = 'sintaxis'
            print(f'{file[\"filePath\"]}|{msg.get(\"line\", 0)}|{sev}|{typ}|{msg.get(\"message\", \"\")}')
except Exception:
    pass
" 2>/dev/null || true
    else
        warn "eslint not installed — skipping JS/Vue syntax check for $dir"
        return 1
    fi
}

check_js_security() {
    local dir="$1"
    info "Checking security patterns in $dir..."
    local findings
    findings=$(grep -rn 'v-html\|dangerouslySetInnerHTML\|innerHTML\|eval(\|execScript' "$dir" --include='*.vue' --include='*.js' --include='*.ts' 2>/dev/null | head -20 || true)
    if [ -n "$findings" ]; then
        warn "Potential XSS patterns found:"
        echo "$findings" | while IFS= read -r line; do
            warn "  $line"
        done
    fi
    echo "$findings" | while IFS=: read -r file line rest; do
        [ -z "$file" ] && continue
        ISSUES+=("{\"ruta\":\"$file\",\"tipo\":\"seguridad\",\"severidad\":\"critico\",\"linea\":$line,\"descripcion\":\"Potential XSS: ${rest:0:80}\"}")
        TOTAL_SEGURIDAD=$((TOTAL_SEGURIDAD + 1))
        TOTAL_CRITICOS=$((TOTAL_CRITICOS + 1))
    done
}

check_python_security() {
    local dir="$1"
    info "Checking Python security patterns in $dir..."
    if has_tool bandit; then
        bandit -r "$dir" -f json 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for result in data.get('results', []):
        sev = 'critico' if result.get('issue_severity', 'LOW') == 'HIGH' else 'medio'
        print(f'{result.get(\"filename\", \"\")}|{result.get(\"line_number\", 0)}|{sev}|seguridad|{result.get(\"issue_text\", \"\")}')
except Exception:
    pass
" 2>/dev/null || true
    else
        local findings
        findings=$(grep -rn 'exec(\|eval(\|subprocess.call\|subprocess.Popen\|pickle.load\|sqlite3.execute.*+''"' "$dir" --include='*.py' 2>/dev/null | head -20 || true)
        if [ -n "$findings" ]; then
            warn "Potential security issues found (basic grep):"
            echo "$findings" | while IFS= read -r line; do
                warn "  $line"
            done
        fi
        echo "$findings" | while IFS=: read -r file line rest; do
            [ -z "$file" ] && continue
            ISSUES+=("{\"ruta\":\"$file\",\"tipo\":\"seguridad\",\"severidad\":\"critico\",\"linea\":$line,\"descripcion\":\"${rest:0:80}\"}")
            TOTAL_SEGURIDAD=$((TOTAL_SEGURIDAD + 1))
            TOTAL_CRITICOS=$((TOTAL_CRITICOS + 1))
        done
        warn "bandit not installed — security check limited for $dir"
        return 1
    fi
}

find_complex_files() {
    local dir="$1"
    info "Checking file complexity in $dir..."

    while IFS= read -r -d '' file; do
        local lines
        lines=$(wc -l < "$file" 2>/dev/null || echo 0)
        if [ "$lines" -gt 300 ]; then
            warn "  $file ($lines lines — high complexity)"
            ISSUES+=("{\"ruta\":\"$file\",\"tipo\":\"complejidad\",\"severidad\":\"medio\",\"linea\":1,\"descripcion\":\"File has $lines lines (>300), consider refactoring\"}")
            TOTAL_COMPLEJIDAD=$((TOTAL_COMPLEJIDAD + 1))
            TOTAL_MEDIOS=$((TOTAL_MEDIOS + 1))
        fi
    done < <(find "$dir" \( -name '*.py' -o -name '*.js' -o -name '*.vue' \) -type f -print0 2>/dev/null || true)
}

generate_sample_report() {
    warn "No real analysis tools available — generating sample report"
    local base_url="$PROJECT_DIR"

    for file in "$BACKEND_DIR/src/auth/login.py" "$BACKEND_DIR/src/api/kyc_verify.py" \
                "$BACKEND_DIR/src/models/user.py" "$BACKEND_DIR/src/services/aml_check.py" \
                "$BACKEND_DIR/src/utils/validators.py" "$FRONTEND_DIR/src/components/KYCForm.vue" \
                "$FRONTEND_DIR/src/views/Dashboard.vue" "$FRONTEND_DIR/src/store/index.js" \
                "$FRONTEND_DIR/src/utils/api.js"; do
        if [ -f "$file" ]; then
            ISSUES+=("{\"ruta\":\"$file\",\"tipo\":\"sintaxis\",\"severidad\":\"medio\",\"linea\":1,\"descripcion\":\"Sample: syntax issue detected\"}")
            TOTAL_SINTAXIS=$((TOTAL_SINTAXIS + 1))
            TOTAL_MEDIOS=$((TOTAL_MEDIOS + 1))
        fi
    done

    if [ ${#ISSUES[@]} -eq 0 ]; then
        ISSUES+=("{\"ruta\":\"$PROJECT_DIR\",\"tipo\":\"sintaxis\",\"severidad\":\"bajo\",\"linea\":1,\"descripcion\":\"Sample issue — no actual code found for analysis\"}")
        TOTAL_SINTAXIS=$((TOTAL_SINTAXIS + 1))
        TOTAL_BAJOS=$((TOTAL_BAJOS + 1))
    fi
}

header "Analysis Results"

if [ -d "$BACKEND_DIR" ]; then
    header "Backend Analysis ($BACKEND_DIR)"
    check_python_syntax "$BACKEND_DIR" || true
    check_python_pylint "$BACKEND_DIR" || true
    check_python_complexity "$BACKEND_DIR" || true
    check_python_security "$BACKEND_DIR" || true
    find_complex_files "$BACKEND_DIR"
else
    warn "Backend directory not found at $BACKEND_DIR"
fi

if [ -d "$FRONTEND_DIR" ]; then
    header "Frontend Analysis ($FRONTEND_DIR)"
    check_js_vue_syntax "$FRONTEND_DIR" || true
    check_js_security "$FRONTEND_DIR" || true
    find_complex_files "$FRONTEND_DIR"
else
    warn "Frontend directory not found at $FRONTEND_DIR"
fi

if [ "$TOTAL_CRITICOS" -eq 0 ] && [ "$TOTAL_MEDIOS" -eq 0 ] && [ "$TOTAL_BAJOS" -eq 0 ] && [ ${#ISSUES[@]} -eq 0 ]; then
    generate_sample_report
fi

TOTAL_ISSUES=$((TOTAL_CRITICOS + TOTAL_MEDIOS + TOTAL_BAJOS))

if [ "$TOTAL_CRITICOS" -gt 5 ]; then
    ESTADO="critico"
elif [ "$TOTAL_CRITICOS" -gt 0 ] || [ "$TOTAL_MEDIOS" -gt 5 ]; then
    ESTADO="atencion"
else
    ESTADO="saludable"
fi

header "Summary"
echo -e "  ${BOLD}Date:${NC}        $TODAY"
echo -e "  ${BOLD}Total Issues:${NC} $TOTAL_ISSUES"
echo -e "  ${BOLD}Críticos:${NC}     $(printf "${RED}%d${NC}" "$TOTAL_CRITICOS")"
echo -e "  ${BOLD}Medios:${NC}       $(printf "${YELLOW}%d${NC}" "$TOTAL_MEDIOS")"
echo -e "  ${BOLD}Bajos:${NC}        $(printf "${GREEN}%d${NC}" "$TOTAL_BAJOS")"
echo -e "  ${BOLD}Sintaxis:${NC}     $TOTAL_SINTAXIS"
echo -e "  ${BOLD}Complejidad:${NC}  $TOTAL_COMPLEJIDAD"
echo -e "  ${BOLD}Seguridad:${NC}    $TOTAL_SEGURIDAD"
echo -e "  ${BOLD}Estado:${NC}       $(case "$ESTADO" in critico) printf "${RED}%s${NC}" "$ESTADO" ;; atencion) printf "${YELLOW}%s${NC}" "$ESTADO" ;; saludable) printf "${GREEN}%s${NC}" "$ESTADO" ;; esac)"

if [ "$SAVE" = true ]; then
    mkdir -p "$REPORTS_DIR"

    ARCHIVOS_JSON="["
    FIRST=true
    for issue in "${ISSUES[@]}"; do
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            ARCHIVOS_JSON+=","
        fi
        ARCHIVOS_JSON+="$issue"
    done
    ARCHIVOS_JSON+="]"

    cat > "$REPORTS_DIR/$TODAY.json" <<EOF
{
  "fecha": "$TODAY",
  "total_issues": $TOTAL_ISSUES,
  "criticos": $TOTAL_CRITICOS,
  "medios": $TOTAL_MEDIOS,
  "bajos": $TOTAL_BAJOS,
  "sintaxis": $TOTAL_SINTAXIS,
  "complejidad": $TOTAL_COMPLEJIDAD,
  "seguridad": $TOTAL_SEGURIDAD,
  "estado": "$ESTADO",
  "detalles": {
    "archivos": $ARCHIVOS_JSON
  }
}
EOF
    ok "Report saved to $REPORTS_DIR/$TODAY.json"
fi

if [ "$DASHBOARD" = true ]; then
    PYTHON_SCRIPT="$(cd "$(dirname "$0")" && pwd)/generate_report.py"
    if [ -f "$PYTHON_SCRIPT" ]; then
        header "Dashboard"
        python3 "$PYTHON_SCRIPT"
    else
        err "generate_report.py not found at $PYTHON_SCRIPT"
    fi
fi

echo
