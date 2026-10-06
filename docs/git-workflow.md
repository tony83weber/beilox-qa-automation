# Flujo de trabajo en equipo (Git + PR)

Este repo usa una versión reducida de este flujo (ver la tabla al final). En un equipo real de QA el flujo que usé en trabajos anteriores es el siguiente. Los nombres exactos de ramas (`develop`, `main`, `release/*`) los define cada empresa.

## 1. Rama por historia de usuario

Se parte de la rama de integración actualizada y se crea una rama que referencie la historia:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/QA-123-busqueda-sin-resultados
```

Convención: `feature/<ID-de-la-historia>-<descripcion-corta>`. Para fixes de tests rotos: `fix/<ID>-<descripcion>`.

## 2. Commits chicos y descriptivos

Un commit por cambio lógico (`test(ui): agrega escenario sin resultados`, `fix(pom): locator del botón Buscar`). Push frecuente de la rama:

```bash
git push -u origin feature/QA-123-busqueda-sin-resultados
```

## 3. Pull Request

Cuando la historia está terminada se abre un PR hacia la rama de integración. El repo trae un template ([`.github/pull_request_template.md`](../.github/pull_request_template.md)) que pide:

- link a la historia / ticket
- qué se automatizó y qué quedó afuera
- evidencia de la corrida (reporte Allure o screenshot)
- CI en verde (smoke en el PR)

## 4. Control cruzado

Otro QA revisa el PR: legibilidad, POM, esperas, datos de prueba, que el test falle cuando debe fallar. Los comentarios se resuelven en la misma rama.

## 5. Merge

Con la aprobación del revisor y CI en verde se mergea a la rama de integración (`develop` o la que use la empresa) y se borra la rama de la historia. La suite completa multi-browser corre en el cron (en este repo, los lunes 15:00 ART).

## Cómo encaja con este repo

| Equipo real | Este challenge |
|-------------|----------------|
| `feature/*` → PR → `develop` | `feature/*` → PR → `main` (no hay `develop`: un solo integrador). Ej.: las mejoras de MCP, esperas y CI entraron por `feature/QA-mejoras-mcp-esperas-ci` |
| Smoke en cada PR | El workflow corre `@smoke` (API + UI Chromium) en todo PR a `main` |
| Full en nightly / cron | Cron de los lunes, matrix de 4 browsers |
| Control cruzado de otro QA | Paso del PR antes del merge: el revisor usa el checklist del template |
