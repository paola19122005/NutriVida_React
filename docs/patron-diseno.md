# Patrón de diseño y arquitectura - NutriVida

## Atomic Design
- Átomos: `src/componentes/atomos/Boton.tsx`, `Input.tsx`.
- Moléculas: `CampoFormulario.tsx`, `CardServicio.tsx`, `CardBlog.tsx`, `SelectorFecha.tsx`.
- Organismos: `Navbar.tsx`, `Footer.tsx`, `FormLogin.tsx`, `FormRegistro.tsx`, `FormContacto.tsx`.
- Páginas: `src/paginas/*`.

## Patrón aplicado
Se aplica composición de componentes reutilizables con propiedades tipadas. Los organismos componen moléculas y átomos; las páginas componen organismos y gestionan estado. Esto permite reutilización y separación de responsabilidades.

## Ejemplos
- `CardServicio` recibe props tipadas y se reutiliza en `Catalogo`, `Inicio` y `Nosotros`.
- `CampoFormulario` encapsula `Input` y mensajes de error.
- `Navbar` cambia su navegación según el rol sin duplicar componentes.