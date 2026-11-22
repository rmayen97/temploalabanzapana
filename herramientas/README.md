# Diseño nuevo (beta)

`nuevo.html` se **genera** a partir de `index.html` para que ambos diseños
compartan exactamente la misma lógica (Supabase, admin, ausencias, canciones…).

- `nuevo_ui.js` — navegación, pantalla de Inicio y menú del diseño nuevo.
- `build_nuevo.py` — aplica el diseño nuevo sobre `index.html`.

Si cambias funciones en `index.html`, vuelve a generar el diseño nuevo:

```bash
python3 herramientas/build_nuevo.py index.html nuevo.html herramientas/nuevo_ui.js
```

Los bloques marcados `BETA:START` / `BETA:END` en `index.html` (aviso "¿Quieres
probar el nuevo diseño?" y redirección) se quitan automáticamente al generar.
Links útiles: `/?diseno=nuevo` activa el diseño nuevo, `/?diseno=clasico` el anterior.
