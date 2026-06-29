# SonarQube Report — AML/KYC

> Generado el 2026-06-28 20:20:42 | Proyecto: `parcial-ingenieria`

## Resumen

| Métrica | Valor |
|---------|-------|
| **Quality Gate** | ✅ Pasó |
| **Líneas de código** | 8336 |
| **Bugs** | 2 |
| **Vulnerabilidades** | 7 |
| **Code Smells** | 86 |
| **Cobertura** | 0.0% |
| **Duplicación** | 4.7% |
| **Rating Seguridad** | C |
| **Rating Confiabilidad** | B |
| **Rating Mantenibilidad** | A |

### Distribución por Severidad

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Blocker | 1 |
| 🟠 Critical | 4 |
| 🟡 Major | 35 |
| 🔵 Minor | 55 |

### Distribución por Tipo

| Tipo | Cantidad |
|------|----------|
| 🧹 Code Smell | 86 |
| 🔓 Vulnerabilidad | 7 |
| 🐛 Bug | 2 |

---

## Hotspots de Seguridad (10)

| Archivo | Línea | Categoría | Probabilidad | Descripción |
|---------|:-----:|-----------|:------------:|-------------|
| `Frontend-Public/src/lib/validators.ts` | 15 | DoS (Denegación de Servicio) | MEDIUM | Asegúrese de que la regex usada aquí, vulnerable a tiempo de ejecución super-lineal por backtracking, no pueda causar denegación de servicio. |
| `frontend-admin/src/lib/validators.ts` | 15 | DoS (Denegación de Servicio) | MEDIUM | Asegúrese de que la regex usada aquí, vulnerable a tiempo de ejecución super-lineal por backtracking, no pueda causar denegación de servicio. |
| `Frontend-Public/src/api/mock/handlers/formularios.ts` | 5 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |
| `Frontend-Public/src/api/mock/handlers/formularios.ts` | 9 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |
| `frontend-admin/src/api/mock/handlers/expedientes.ts` | 125 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |
| `frontend-admin/src/api/mock/store.ts` | 108 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |
| `frontend-admin/src/api/mock/store.ts` | 109 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |
| `frontend-admin/src/api/mock/store.ts` | 133 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |
| `frontend-admin/src/api/mock/store.ts` | 146 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |
| `frontend-admin/src/api/mock/utils.ts` | 4 | Criptografía Débil | MEDIUM | Asegúrese de que usar este generador pseudoaleatorio sea seguro aquí. |

---

## Vulnerabilidades (7)

| Severidad | Archivo | Línea | Regla | Descripción |
|-----------|---------|:-----:|-------|-------------|
| 🟡 Major | `frontend-admin/src/api/mock/data/users.ts` | 28 | `typescript:S2068` | Revise esta posible contraseña hardcodeada. |
| 🟡 Major | `frontend-admin/src/api/mock/data/users.ts` | 50 | `typescript:S2068` | Revise esta posible contraseña hardcodeada. |
| 🟡 Major | `frontend-admin/src/api/mock/data/users.ts` | 72 | `typescript:S2068` | Revise esta posible contraseña hardcodeada. |
| 🟡 Major | `frontend-admin/src/api/mock/handlers/usuarios.ts` | 42 | `typescript:S2068` | Revise esta posible contraseña hardcodeada. |
| 🟡 Major | `frontend-admin/src/components/admin/DemoCredentials.tsx` | 16 | `typescript:S2068` | Revise esta posible contraseña hardcodeada. |
| 🟡 Major | `frontend-admin/src/components/admin/DemoCredentials.tsx` | 21 | `typescript:S2068` | Revise esta posible contraseña hardcodeada. |
| 🔵 Minor | `qa-dashboard/dashboard.html` | 7 | `Web:S5725` | Asegúrese de que no usar integridad de recursos sea seguro aquí. |

---

## Bugs (2)

| Severidad | Archivo | Línea | Regla | Descripción |
|-----------|---------|:-----:|-------|-------------|
| 🔵 Minor | `frontend-admin/src/components/ui/dialog.tsx` | 29 | `typescript:S1082` | Elementos visibles no interactivos con click deben tener un listener de teclado. |
| 🔵 Minor | `frontend-admin/src/components/ui/dialog.tsx` | 35 | `typescript:S1082` | Elementos visibles no interactivos con click deben tener un listener de teclado. |

---

## Code Smells (86)

| Severidad | Archivo | Línea | Regla | Descripción |
|-----------|---------|:-----:|-------|-------------|
| 🔵 Minor | `frontend-admin/src/pages/admin/KanbanBoard.tsx` | 12 | `typescript:S1128` | Elimine este import no utilizado de 'EstadoBadge'. |
| 🟡 Major | `frontend-admin/src/pages/admin/KanbanBoard.tsx` | 151 | `typescript:S6848` | Evite elementos interactivos no nativos. Si no es posible usar HTML nativo, agregue un rol apropiado y soporte para tabulación, mouse, teclado y táctil. |
| 🟡 Major | `frontend-admin/src/pages/admin/KanbanBoard.tsx` | 172 | `typescript:S6848` | Evite elementos interactivos no nativos. Si no es posible usar HTML nativo, agregue un rol apropiado y soporte para tabulación, mouse, teclado y táctil. |
| 🟠 Critical | `Frontend-Public/src/api/client.ts` | 25 | `typescript:S3776` | Refactorice esta función para reducir su Complejidad Cognitiva de 17 a 15. |
| 🔵 Minor | `Frontend-Public/src/components/forms/FileDropzone.tsx` | 15 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/components/forms/SignatureCanvas.tsx` | 9 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/components/forms/WizardProgress.tsx` | 9 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `Frontend-Public/src/components/forms/WizardProgress.tsx` | 19 | `typescript:S6819` | Utilice <progress> en lugar del rol "progressbar" para asegurar accesibilidad. |
| 🟡 Major | `Frontend-Public/src/components/forms/WizardProgress.tsx` | 33 | `typescript:S3358` | Extraiga esta operación ternaria anidada a una declaración independiente. |
| 🟡 Major | `Frontend-Public/src/components/ui/alert.tsx` | 34 | `typescript:S6850` | Los encabezados deben tener contenido accesible por lector de pantalla. |
| 🟡 Major | `Frontend-Public/src/components/ui/card.tsx` | 24 | `typescript:S6850` | Los encabezados deben tener contenido accesible por lector de pantalla. |
| 🔵 Minor | `Frontend-Public/src/lib/validators.ts` | 29 | `typescript:S7773` | Prefiera `Number.parseInt` en lugar de `parseInt`. |
| 🔵 Minor | `Frontend-Public/src/lib/validators.ts` | 34 | `typescript:S7773` | Prefiera `Number.parseInt` en lugar de `parseInt`. |
| 🟡 Major | `Frontend-Public/src/pages/Confirmacion.tsx` | 16 | `typescript:S7721` | Mueva la función 'handlePrint' al ámbito superior. |
| 🔵 Minor | `Frontend-Public/src/pages/Confirmacion.tsx` | 17 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 581 | `typescript:S4325` | Esta aserción es innecesaria, el receptor ya acepta el tipo original. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 585 | `typescript:S4325` | Esta aserción es innecesaria, el receptor ya acepta el tipo original. |
| 🟡 Major | `Frontend-Public/src/pages/FormularioKYC.tsx` | 753 | `typescript:S6478` | Mueva esta definición de componente fuera del componente padre y pase datos como props. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 753 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟠 Critical | `Frontend-Public/src/pages/FormularioKYC.tsx` | 762 | `typescript:S3735` | Elimine este uso del operador "void". |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 798 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 802 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 826 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 891 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `Frontend-Public/src/pages/FormularioKYC.tsx` | 954 | `typescript:S3358` | Extraiga esta operación ternaria anidada a una declaración independiente. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 983 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1023 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1060 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1081 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1133 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1237 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1271 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1335 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1364 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1451 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1491 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `Frontend-Public/src/pages/FormularioKYC.tsx` | 1533 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `frontend-admin/src/api/client.ts` | 46 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🔵 Minor | `frontend-admin/src/api/client.ts` | 51 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🟠 Critical | `frontend-admin/src/api/client.ts` | 58 | `typescript:S3776` | Refactorice esta función para reducir su Complejidad Cognitiva de 20 a 15. |
| 🟠 Critical | `frontend-admin/src/api/mock/data/alertas.ts` | 5 | `typescript:S3776` | Refactorice esta función para reducir su Complejidad Cognitiva de 18 a 15. |
| 🔵 Minor | `frontend-admin/src/api/mock/handlers/alertas.ts` | 6 | `typescript:S7776` | `TIPOS_VALIDOS` debería ser un `Set`, use `TIPOS_VALIDOS.has()` para verificar existencia. |
| 🟡 Major | `frontend-admin/src/api/mock/handlers/auth.ts` | 20 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🔵 Minor | `frontend-admin/src/api/mock/handlers/auth.ts` | 82 | `typescript:S7744` | El objeto vacío es inútil. |
| 🔵 Minor | `frontend-admin/src/api/mock/store.ts` | 149 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🔵 Minor | `frontend-admin/src/api/mock/store.ts` | 149 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🔵 Minor | `frontend-admin/src/api/mock/store.ts` | 149 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🔵 Minor | `frontend-admin/src/api/mock/utils.ts` | 35 | `typescript:S6551` | 'v' usará formato de stringificación por defecto ('[object Object]'). |
| 🔵 Minor | `frontend-admin/src/components/PrivateRoute.tsx` | 11 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `frontend-admin/src/components/admin/Badges.tsx` | 20 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `frontend-admin/src/components/admin/Badges.tsx` | 30 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `frontend-admin/src/components/layout/AdminHeader.tsx` | 54 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `frontend-admin/src/components/layout/AdminHeader.tsx` | 156 | `typescript:S6848` | Evite elementos interactivos no nativos. Si no es posible usar HTML nativo, agregue un rol apropiado y soporte para tabulación, mouse, teclado y táctil. |
| 🔵 Minor | `frontend-admin/src/components/layout/AdminSidebar.tsx` | 40 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `frontend-admin/src/components/ui/avatar.tsx` | 8 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `frontend-admin/src/components/ui/card.tsx` | 24 | `typescript:S6850` | Los encabezados deben tener contenido accesible por lector de pantalla. |
| 🔵 Minor | `frontend-admin/src/components/ui/dialog.tsx` | 16 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `frontend-admin/src/components/ui/dialog.tsx` | 29 | `typescript:S6819` | Use <dialog> instead of the "dialog" role to ensure accessibility across all devices. |
| 🟡 Major | `frontend-admin/src/components/ui/dialog.tsx` | 29 | `typescript:S6847` | Elementos no interactivos no deberían tener listeners de mouse o teclado. |
| 🟡 Major | `frontend-admin/src/components/ui/dialog.tsx` | 35 | `typescript:S6848` | Evite elementos interactivos no nativos. Si no es posible usar HTML nativo, agregue un rol apropiado y soporte para tabulación, mouse, teclado y táctil. |
| 🔵 Minor | `frontend-admin/src/contexts/AuthContext.tsx` | 21 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `frontend-admin/src/contexts/AuthContext.tsx` | 72 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🔵 Minor | `frontend-admin/src/contexts/AuthContext.tsx` | 73 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🔵 Minor | `frontend-admin/src/contexts/ThemeContext.tsx` | 14 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🔵 Minor | `frontend-admin/src/contexts/ThemeContext.tsx` | 15 | `typescript:S6754` | La llamada a useState no está desestructurada en par valor + setter |
| 🔵 Minor | `frontend-admin/src/contexts/ThemeContext.tsx` | 22 | `typescript:S7764` | Prefiera `globalThis` en lugar de `window`. |
| 🟡 Major | `frontend-admin/src/contexts/ThemeContext.tsx` | 40 | `typescript:S6481` | El objeto pasado como prop value al Context provider cambia en cada render. Considere usar useMemo. |
| 🔵 Minor | `frontend-admin/src/lib/validators.ts` | 31 | `typescript:S7773` | Prefiera `Number.parseInt` en lugar de `parseInt`. |
| 🔵 Minor | `frontend-admin/src/lib/validators.ts` | 36 | `typescript:S7773` | Prefiera `Number.parseInt` en lugar de `parseInt`. |
| 🟡 Major | `frontend-admin/src/pages/admin/Auditoria.tsx` | 53 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🔵 Minor | `frontend-admin/src/pages/admin/Dashboard.tsx` | 26 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `frontend-admin/src/pages/admin/Dashboard.tsx` | 54 | `typescript:S6479` | No use índices de Array como keys |
| 🟡 Major | `frontend-admin/src/pages/admin/ExpedienteDetail.tsx` | 178 | `typescript:S6479` | No use índices de Array como keys |
| 🟡 Major | `frontend-admin/src/pages/admin/ExpedienteDetail.tsx` | 212 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🟡 Major | `frontend-admin/src/pages/admin/ExpedienteDetail.tsx` | 234 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🟡 Major | `frontend-admin/src/pages/admin/ExpedienteDetail.tsx` | 282 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🔵 Minor | `frontend-admin/src/pages/admin/ExpedienteDetail.tsx` | 293 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `frontend-admin/src/pages/admin/ExpedientesList.tsx` | 139 | `typescript:S6479` | No use índices de Array como keys |
| 🟡 Major | `frontend-admin/src/pages/admin/ExpedientesList.tsx` | 179 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🔵 Minor | `frontend-admin/src/pages/admin/Reportes.tsx` | 31 | `typescript:S6759` | Marque las props del componente como read-only. |
| 🟡 Major | `frontend-admin/src/pages/admin/Reportes.tsx` | 131 | `typescript:S3358` | Extraiga esta operación ternaria anidada a una declaración independiente. |
| 🟡 Major | `frontend-admin/src/pages/admin/Reportes.tsx` | 156 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🟡 Major | `frontend-admin/src/pages/admin/Usuarios.tsx` | 56 | `typescript:S6582` | Prefiera usar una expresión optional chain, es más concisa y fácil de leer. |
| 🟡 Major | `frontend-admin/src/pages/admin/Workflow.tsx` | 116 | `typescript:S3358` | Extraiga esta operación ternaria anidada a una declaración independiente. |
| 🟡 Major | `qa-dashboard/dashboard.html` | 37 | `css:S7924` | El texto no cumple con el contraste mínimo con su fondo. |
| 🔴 Blocker | `backend/clients/models.py` | 13 | `python:S1845` | Renombre el campo \"tipo_documento\" para evitar conflicto con \"TIPO_DOCUMENTO\" definido en línea 6. |

---

## Recomendaciones

- **🔴 Prioridad crítica:** 1 issue(s) Blocker — corregir inmediatamente.
- **🟠 Prioridad alta:** 4 issue(s) Critical — corregir pronto.
- **🔓 Revisar vulnerabilidades:** 7 vulnerabilidad(es) de seguridad.
- **⚠️ Revisar hotspots:** 10 hotspot(s) de seguridad pendientes de revisión.
- **🧪 Mejorar cobertura:** La cobertura de tests está en 0.0% — se recomienda al menos 50%.
