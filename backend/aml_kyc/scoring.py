"""
Motor de scoring de riesgo AML/KYC basado en Ley 23 e ISO 37001.
Cada factor tiene un peso; el puntaje final (0-100) determina el nivel.
"""

PAISES_ALTO_RIESGO = {
    'AF', 'IR', 'KP', 'MM', 'SY', 'YE', 'SD', 'SO', 'LY', 'VE',
}

SECTORES_ALTO_RIESGO = {
    'casino', 'criptomonedas', 'cambio de divisas', 'inmobiliaria',
    'joyeria', 'arte', 'armas', 'mineria',
}

FACTORES = {
    'pais_alto_riesgo':        {'peso': 30, 'descripcion': 'País de registro en lista de alto riesgo'},
    'es_pep':                  {'peso': 25, 'descripcion': 'Persona Políticamente Expuesta'},
    'lista_restrictiva':       {'peso': 35, 'descripcion': 'Aparece en lista restrictiva (OFAC/ONU/UE)'},
    'sector_alto_riesgo':      {'peso': 15, 'descripcion': 'Sector de actividad de alto riesgo'},
    'alto_volumen':            {'peso': 10, 'descripcion': 'Volumen de transacciones inusualmente alto'},
    'estructura_compleja':     {'peso': 10, 'descripcion': 'Estructura societaria compleja u opaca'},
    'historial_sanciones':     {'peso': 20, 'descripcion': 'Historial previo de sanciones o alertas'},
}


def calcular_score(cliente, expediente=None):
    """
    Retorna un dict con: score (0-100), nivel, factores_activados, recomendaciones.
    """
    from pep_lists.models import PEP, ListaRestrictiva

    score = 0
    factores_activados = []

    pais = getattr(cliente, 'nacionalidad', '').upper()[:2]
    if pais in PAISES_ALTO_RIESGO:
        score += FACTORES['pais_alto_riesgo']['peso']
        factores_activados.append(FACTORES['pais_alto_riesgo']['descripcion'])

    es_pep = PEP.objects.filter(
        nombre_completo__icontains=cliente.nombre_completo, activo=True
    ).exists()
    if es_pep:
        score += FACTORES['es_pep']['peso']
        factores_activados.append(FACTORES['es_pep']['descripcion'])

    en_lista = ListaRestrictiva.objects.filter(
        nombre__icontains=cliente.nombre_completo
    ).exists()
    if en_lista:
        score += FACTORES['lista_restrictiva']['peso']
        factores_activados.append(FACTORES['lista_restrictiva']['descripcion'])

    sector = getattr(cliente, 'occupation', '').lower()
    if any(s in sector for s in SECTORES_ALTO_RIESGO):
        score += FACTORES['sector_alto_riesgo']['peso']
        factores_activados.append(FACTORES['sector_alto_riesgo']['descripcion'])

    income = getattr(cliente, 'income_range', '').lower()
    if 'alto' in income or 'millones' in income:
        score += FACTORES['alto_volumen']['peso']
        factores_activados.append(FACTORES['alto_volumen']['descripcion'])

    score = min(score, 100)

    if score <= 25:
        nivel = 'bajo'
    elif score <= 50:
        nivel = 'medio'
    elif score <= 75:
        nivel = 'alto'
    else:
        nivel = 'critico'

    recomendaciones = _generar_recomendaciones(nivel, factores_activados)

    return {
        'score': score,
        'nivel': nivel,
        'factores_activados': factores_activados,
        'recomendaciones': recomendaciones,
    }


def _generar_recomendaciones(nivel, factores):
    base = []
    if nivel == 'bajo':
        base.append('Verificación estándar. Revisión anual suficiente.')
    elif nivel == 'medio':
        base.append('Verificación reforzada. Revisión semestral recomendada.')
        base.append('Solicitar documentación adicional de origen de fondos.')
    elif nivel == 'alto':
        base.append('Debida diligencia ampliada obligatoria.')
        base.append('Aprobación requerida por Oficial de Cumplimiento.')
        base.append('Revisión trimestral y monitoreo continuo de transacciones.')
    else:
        base.append('ALERTA CRÍTICA: No aprobar sin revisión exhaustiva del comité.')
        base.append('Reportar a la Unidad de Información y Análisis Financiero (UIAF).')
        base.append('Congelar operaciones hasta resolver la investigación.')
    return base
