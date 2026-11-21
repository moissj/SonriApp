import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_TOOLS = new Set(['Claude', 'Gemini']);

/** Calcula el siguiente prefijo NN disponible entre planes y trackers sin duplicados. */
export function nextPlanNumber(planDir, trackerDir) {
  let max = -1;
  for (const dir of [planDir, trackerDir]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      const m = file.match(/^(\d{2})_/);
      if (m) max = Math.max(max, Number.parseInt(m[1], 10));
    }
  }
  return String(max + 1).padStart(2, '0');
}

function buildPlanTemplate(num, slug, title) {
  return [
    `# Plan ${num} — ${title}`,
    '',
    `- **ID:** \`${num}_${slug}\``,
    `- **Estado:** Pendiente de ejecución`,
    `- **Tracker:** [\`gestion/tracker/${num}_${slug}.md\`](../tracker/${num}_${slug}.md)`,
    '',
    '## Objetivo',
    '<!-- Qué problema clínico o técnico resuelve este plan y qué queda fuera de alcance. -->',
    '',
    '## Enfoque',
    '<!-- Decisiones clave de diseño y orden de pistas (BD -> tipos -> funciones -> cliente -> verificador). -->',
    '',
    '## Archivos a crear / modificar',
    '- *(Definir antes de delegar)*',
    '',
    '## Cambios de BD / SQL / RLS',
    '- *(Ninguno o detallar migración idempotente + RLS fail-closed + reversibilidad)*',
    '',
    '## Reglas de negocio y contrato',
    '- Contrato versionado: `gestion/fase_de_desarrollo/' + `${num}_${slug}_expediente.json` + '` (si aplica).',
    '- Cero pérdida o sobrescritura silenciosa de datos clínicos existentes.',
    '',
    '## Casos de prueba',
    '- *(Casos borde, pruebas unitarias y aislamiento RLS entre consultorios con datos sintéticos)*',
    '',
  ].join('\n');
}

function buildTrackerTemplate(num, slug, title, herramienta) {
  return [
    `# Tracker ${num} — ${title}`,
    '',
    `- **Plan:** [\`${num}_${slug}_plan.md\`](../fase_de_desarrollo/${num}_${slug}_plan.md)`,
    `- **Herramienta en uso:** ${herramienta}`,
    '',
    '## Checklist',
    '- [ ] Revisar plan y contrato (`expediente.json` si aplica)',
    '- [ ] Ejecutar pista datos / migraciones y regenerar tipos (si aplica)',
    '- [ ] Implementar cambios y pruebas unitarias',
    '- [ ] Validar gates locales (`tsc --noEmit`, `npm run build`, `npm test -- --watch=false`, `sincronizar.mjs --check`)',
    '- [ ] Revisión adversarial (`verificador`)',
    '- [ ] Commit',
    '',
  ].join('\n');
}

/** Crea el par plan + tracker con el siguiente número libre. */
export function createPlan({ rootDir = process.cwd(), slug, title, herramienta = 'Claude' }) {
  if (!slug || !SLUG_REGEX.test(slug)) {
    throw new Error(`Slug inválido "${slug}". Usa minúsculas y guiones (ej. mi-plan).`);
  }
  if (!title || !title.trim()) throw new Error('El título es obligatorio.');
  if (!VALID_TOOLS.has(herramienta)) {
    throw new Error(`Herramienta inválida "${herramienta}". Usa Claude o Gemini.`);
  }

  const planDir = path.join(rootDir, 'gestion', 'fase_de_desarrollo');
  const trackerDir = path.join(rootDir, 'gestion', 'tracker');
  fs.mkdirSync(planDir, { recursive: true });
  fs.mkdirSync(trackerDir, { recursive: true });

  const num = nextPlanNumber(planDir, trackerDir);
  const planPath = path.join(planDir, `${num}_${slug}_plan.md`);
  const trackerPath = path.join(trackerDir, `${num}_${slug}.md`);

  fs.writeFileSync(planPath, buildPlanTemplate(num, slug, title.trim()), 'utf8');
  fs.writeFileSync(trackerPath, buildTrackerTemplate(num, slug, title.trim(), herramienta), 'utf8');
  return { num, planPath, trackerPath };
}

function parseCliArgs(argv) {
  const pos = [];
  let rootDir = process.cwd();
  let herramienta = 'Claude';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) rootDir = path.resolve(argv[++i]);
    else if (argv[i] === '--herramienta' && argv[i + 1]) herramienta = argv[++i];
    else pos.push(argv[i]);
  }
  return { slug: pos[0], title: pos[1], rootDir, herramienta };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { slug, title, rootDir, herramienta } = parseCliArgs(process.argv.slice(2));
  const { num, planPath, trackerPath } = createPlan({ rootDir, slug, title, herramienta });
  console.log(`Creados (${num}):\n- ${path.relative(rootDir, planPath)}\n- ${path.relative(rootDir, trackerPath)}`);
}

