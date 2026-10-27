# Documento de testing - NutriVida

## Objetivo
Verificar la logica de validacion, fechas, formato, operaciones de lista y componentes React mediante pruebas automatizadas.

## Herramientas
- Vitest 5.0.5
- @vitest/coverage-v8 5.0.5
- React Testing Library 16.3.0
- @testing-library/jest-dom 6.9.1
- @testing-library/user-event 14.6.8
- jsdom 29.1.1

## Configuracion
- `vite.config.ts` define `test.globals`, entorno `jsdom`, `setupFiles: ./src/test/setup.ts` y cobertura v8.
- `src/test/setup.ts` importa `@testing-library/jest-dom/vitest`.
- `tsconfig.app.json` incluye `src`.

## Ubicacion de pruebas
- `src/utils/validacion.test.js` (5 pruebas)
- `src/utils/fechas.test.js` (5 pruebas)
- `src/utils/lista.test.js` (5 pruebas)
- `src/utils/formato.test.js` (2 pruebas)
- `src/componentes/atomos/Input.test.tsx` (3 pruebas)
- `src/componentes/moleculas/CardServicio.test.tsx` (3 pruebas)
- `src/componentes/organismos/FormLogin.test.tsx` (4 pruebas)
- `src/componentes/organismos/FormRegistro.test.tsx` (2 pruebas)
- `src/paginas/AdminServicio.test.tsx` (5 pruebas)
- `src/paginas/AdminUsuarios.test.tsx` (5 pruebas)

Total: 39 pruebas aprobadas.

## Instalacion en entorno limpio
```bash
npm install
```

## Ejecutar pruebas
```bash
npm run test
```

## Generar cobertura
```bash
npm run test:coverage
```

## Ultima ejecucion
- Comando: `npm run test`
- Resultado: 10 archivos de prueba, 39 pruebas, 39 aprobadas.
- Comando de cobertura: `npm run test:coverage`
- Cobertura (v8): Statements 40.93%, Branches 35.68%, Functions 36.61%, Lines 44.33%.
- Reporte HTML: `coverage/index.html`.

## Archivos incluidos en cobertura
- `src/**/*.{ts,tsx}`

## Archivos excluidos de cobertura
- `src/**/*.test.{js,ts,tsx}`
- `src/test/**`
- `src/main.tsx`
- `src/vite-env.d.ts`

## Casos cubiertos
- Validacion de RUT y correo.
- Fechas, estado de plan, meses y formato.
- Operaciones de lista: agregar, quitar, estado, pago y no duplicados.
- Renderizado, props y eventos de `Input`.
- Props, renderizado y eventos de `CardServicio`.
- Validaciones y envio de `FormLogin`.
- Validaciones y registro de `FormRegistro`.
- CRUD completo y filtro de busqueda en `AdminServicios`.
- CRUD completo, activacion/desactivacion y filtro de busqueda en `AdminUsuarios`.