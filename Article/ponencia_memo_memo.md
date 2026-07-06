# Ponencia: Memo Memo — herramienta gratuita de código abierto para enseñar memorias de traducción

**III Encuentro Nacional de Docentes de Traducción e Interpretación**
Duración: 15 min + 5 min preguntas | Modalidad: virtual | Idioma: español

---

## Slide 1 — Título (30 s)

**Memo Memo: herramienta gratuita de código abierto para enseñar memorias de traducción**

[TU NOMBRE] — [TU UNIVERSIDAD]
@ [TU RED SOCIAL O WEB]

---

## Slide 2 — El problema (1:30 min)

**Tres barreras en el aula de TAC**

| Problema | Consecuencia |
|---|---|
| Licencias comerciales caras | El alumno solo practica en el laboratorio, no en casa |
| Trials caducan a los 30 días | La práctica se interrumpe |
| Instalación requiere IT / admin | El profesor no puede agregar software nuevo cuando quiere |

**El diagnóstico:** la herramienta ideal para el aula no existe en el mercado porque el comprador es la institución, no el docente.

---

## Slide 3 — ¿Y si existiera una alternativa? (1 min)

**Requisitos de la herramienta ideal para enseñar TM:**

- Gratuita — sin licencias, sin trials, sin sorpresas
- Sin instalación — abre el navegador y funciona
- Sin servidor — no depende de IT, no expone datos
- Formatos reales — TMX, XLIFF, CSV (los que pide la industria)
- Que haga lo esencial: buscar, editar, alinear, fusionar

Eso es Memo Memo.

---

## Slide 4 — ¿Qué es Memo Memo? (1:30 min)

**Memo Memo** es un editor de memorias de traducción:

- **100% en el navegador** — sin instalar nada
- **Código abierto** (GPLv3) — cualquiera puede verlo, modificarlo, mejorarlo
- **Sin servidor** — todos los archivos se procesan en la máquina del usuario
- **Formatos soportados:** TMX 1.4, XLIFF/XLF/SDLXLIFF, CSV
- **Tecnología:** JavaScript moderno, Tailwind CSS, IndexedDB (sin frameworks, sin build)

> "Your data never leaves your machine."

**[Mostrar screenshot de la interfaz]**

---

## Slide 5 — Demo (5 min)

**Escenario 1: Cargar y explorar una TM**
- Arrastrar un TMX → tabla paginada
- Buscar por texto y por regex
- Editar inline una celda
- Descargar TMX limpio

**Escenario 2: Alinear dos textos**
- Pegar o subir source y target (.txt, .docx)
- "Start Alignment" → pares alineados
- Ajustar filas (merge, shift, delete)
- Exportar a TMX o abrir en Search

**Escenario 3: Fusionar memorias**
- Subir 2+ TM → ordenar → deduplicar
- Elegir idioma de salida
- "Merge & Download"

**[En vivo o grabado — 5 min exactos]**

---

## Slide 6 — ¿Cómo lo uso en clase? (2 min)

**Tres actividades que ya funcionan:**

1. **Diagnóstico de una TM** (1 sesión)
   - El alumno carga un TMX, explora segmentos, busca inconsistencias
   - Aprende la estructura TMX sin abrir un XML

2. **Alineación de textos paralelos** (1-2 sesiones)
   - El alumno alinea un documento fuente y destino real
   - Comprende el concepto de segmentación y correspondencia

3. **Fusión y limpieza de memorias** (1 sesión)
   - El alumno fusiona memorias de distintas fuentes
   - Evalúa duplicados, resuelve conflictos

**Ventaja pedagógica:** el alumno puede hacer todo desde su laptop, en clase o en casa, sin pedir permisos ni instalar nada.

---

## Slide 7 — Limitaciones actuales (1 min)

| Limitación | Contexto |
|---|---|
| No tiene TA (traducción automática) | Es un editor, no un CAT tool completo |
| Alineación posicional (no ML) | Suficiente para textos bien estructurados |
| Sin nube ni colaboración en tiempo real | Por diseño — es 100% local |
| Bugs o features faltantes | Es código abierto y está en evolución |

Pero **para el aula**, ninguna de estas limitaciones impide su uso. Al contrario: la simplicidad obliga al alumno a entender el concepto de TM, no a esconderse tras la automatización.

---

## Slide 8 — Conclusión (1 min)

**Memo Memo demuestra que se puede enseñar tecnología de traducción:**

- Sin depender del presupuesto institucional
- Sin instalar software en los laboratorios
- Sin exponer datos de los estudiantes
- Sin sacrificar formatos reales de la industria

**Es gratis. Es abierto. Vive en un navegador.**

---

## Slide 9 — Cierre + Q&A (30 s)

**¿Dónde encontrarlo?**

[https://github.com/your-username/memomemo](https://github.com/your-username/memomemo)

Solo necesitan un navegador.

**Gracias. Preguntas.**

---

## Notas para el presentador

- **Demo**: graba un video de 4-5 min como respaldo por si hay problemas de conexión (la modalidad es virtual). Ensaya que quede exactamente en 5 min.
- **Ritmo**: no te detengas en detalles técnicos (arquitectura, IndexedDB, parsers). Esta audiencia quiere saber **cómo se usa en clase**.
- **Tono**: colegas docentes, no conferencia de ingeniería. Habla de problemas de aula, no de stacks tecnológicos.
- **Idioma**: español, siempre.
- **Virtual**: al ser virtual, ten la demo bien iluminada y el audio limpio. Usa cámara si puedes.

---

## Tiempos totales

| Sección | Duración |
|---|---|
| Slides 1-4 (contexto + qué es) | ~4 min |
| Slide 5 (demo) | ~5 min |
| Slides 6-7 (uso en clase + limitaciones) | ~3 min |
| Slide 8-9 (cierre) | ~1.5 min |
| Buffer | ~1.5 min |
| **Total** | **15 min** |

---

*Documento preparado para el III Encuentro Nacional de Docentes de Traducción e Interpretación — 8 de agosto de 2026*
