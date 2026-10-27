# Documento de testing - NutriVida

## Objetivo
Verificar la lógica de validación, fechas, formato y operaciones de lista mediante pruebas automatizadas.

## Herramientas
- Vitest 5
- @vitest/coverage-v8
- React Testing Library y jsdom instalados para futuras pruebas de componentes

## Configuración
- `vite.config.ts` define `test.globals`, entorno `node` y cobertura v8.
- `tsconfig.node.json` incluye los tipos de Vitest.

## Ubicación de pruebas
- `src/utils/validacion.test.js`
- `src/utils/fechas.test.js`
- `src/utils/lista.test.js`
- `src/utils/formato.test.js`

## Instalación en entorno limpio
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

## Última ejecución
- Comando: `npm run test`
- Resultado: 4 archivos de prueba, 17 pruebas, 17 aprobadas.
- Cobertura (v8): Statements 63.06%, Branches 44.23%, Functions 70.27%, Lines 67.12%.
- Reporte HTML: `coverage/index.html`.

## Limitaciones conocidas
- Solo se prueban utilidades puras; faltan pruebas de componentes, rutas, roles y CRUD completo.
- No existe un umbral mínimo de cobertura definido por la rúbrica.