import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CLAUDE_MODEL = { razonamiento: 'opus', codificacion: 'sonnet', barrido: 'haiku' };
const GEMINI_MODEL = { razonamiento: 'pro', codificacion: 'flash', barrido: 'flash-lite' };
const CLAUDE_EFFORT = { alto: 'high', medio: 'medium', bajo: 'low' };
const CLAUDE_TOOLS = { leer: ['Read'], editar: ['Edit'], escribir: ['Write'], 'buscar-archivos': ['Glob'], 'buscar-texto': ['Grep'], shell: ['Bash'] };
const GEMINI_TOOLS = { leer: ['read_file'], editar: ['replace'], escribir: ['write_file'], 'buscar-archivos': ['glob', 'list_directory'], 'buscar-texto': ['grep_search'], shell: ['run_shell_command'] };
const READ_ONLY_AGENTS = new Set(['relevador', 'verificador']);

const normalize = (text) => text.replace(/\r\n/g, '\n');

/** Parsea frontmatter YAML plano de un archivo Markdown neutral. */
export function parseFrontmatter(raw) {
  const clean = normalize(raw);
  const match = clean.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error('Falta frontmatter YAML válido (---).');
  const meta = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.replace(/\s+#.*$/, '').trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(':');
    if (sep === -1) throw new Error(`Línea YAML inválida: ${trimmed}`);
    const key = trimmed.slice(0, sep).trim();
    const val = trimmed.slice(sep + 1).trim();
    meta[key] = val.startsWith('[') && val.endsWith(']')
      ? val.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
      : val;
  }
  return { meta, body: match[2].trimStart() };
}

function mapTools(list, table, file) {
  const out = [];
  for (const item of list) {
    const mapped = table[item];
    if (!mapped) throw new Error(`Herramienta desconocida "${item}" en ${file}`);
    out.push(...mapped);
  }
  return out;
}

function validateAgent(meta, file) {
  for (const req of ['nombre', 'descripcion', 'tier', 'herramientas']) {
    if (!meta[req]) throw new Error(`Falta "${req}" en ${file}`);
  }
  if (!CLAUDE_MODEL[meta.tier]) throw new Error(`Tier inválido "${meta.tier}" en ${file}`);
  if (!Array.isArray(meta.herramientas) || !meta.herramientas.length) {
    throw new Error(`"herramientas" debe ser lista no vacía en ${file}`);
  }
  if (READ_ONLY_AGENTS.has(meta.nombre) &&
      (meta.herramientas.includes('editar') || meta.herramientas.includes('escribir'))) {
    throw new Error(`Agente de solo lectura "${meta.nombre}" no puede declarar editar/escribir.`);
  }
}

function renderClaudeAgent(meta, body, srcRel) {
  const tools = mapTools(meta.herramientas, CLAUDE_TOOLS, srcRel).join(', ');
  const effort = meta.esfuerzo ? CLAUDE_EFFORT[meta.esfuerzo] : null;
  if (meta.esfuerzo && !effort) throw new Error(`Esfuerzo inválido "${meta.esfuerzo}" en ${srcRel}`);
  const lines = [
    '---',
    `name: ${meta.nombre}`,
    `description: ${meta.descripcion}`,
    `model: ${CLAUDE_MODEL[meta.tier]}`,
    ...(effort ? [`effort: ${effort}`] : []),
    `tools: ${tools}`,
    '---',
    `<!-- GENERADO desde ${srcRel} — no editar a mano. -->`,
    '',
    body.trimEnd(),
    '',
  ];
  return lines.join('\n');
}

function renderGeminiAgent(meta, body, srcRel) {
  const tools = mapTools(meta.herramientas, GEMINI_TOOLS, srcRel);
  const maxTurns = Number(meta.max_turns) || 20;
  const omitted = meta.esfuerzo ? ' Campo omitido en Gemini CLI: esfuerzo.' : '';
  const lines = [
    '---',
    `name: ${meta.nombre}`,
    `description: ${meta.descripcion}`,
    'kind: local',
    `model: ${GEMINI_MODEL[meta.tier]}`,
    `max_turns: ${maxTurns}`,
    'tools:',
    ...tools.map((t) => `  - ${t}`),
    '---',
    `<!-- GENERADO desde ${srcRel} — no editar a mano.${omitted} -->`,
    '',
    body.trimEnd(),
    '',
  ];
  return lines.join('\n');
}

function renderSkill(meta, body, srcRel) {
  if (!meta.nombre || !meta.descripcion) throw new Error(`Skill inválida en ${srcRel}`);
  return [
    '---',
    `name: ${meta.nombre}`,
    `description: ${meta.descripcion}`,
    '---',
    `<!-- GENERADO desde ${srcRel} — no editar a mano. -->`,
    '',
    body.trimEnd(),
    '',
  ].join('\n');
}

function renderGeminiCommand(meta, srcRel) {
  const desc = meta.descripcion.replace(/"/g, '\\"');
  return [
    `# GENERADO desde ${srcRel} — no editar a mano.`,
    `description = "${desc}"`,
    'prompt = """',
    `Sigue exactamente el procedimiento definido en @{${srcRel}}.`,
    '',
    'Contexto adicional del usuario: {{args}}',
    '"""',
    '',
  ].join('\n');
}

/** Construye el mapa de archivos destino -> contenido esperado desde fuentes neutras. */
export function buildTargets(rootDir) {
  const targets = new Map();
  const agentsDir = path.join(rootDir, 'tools', 'agentes', 'fuente');
  for (const name of fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort()) {
    const srcRel = `tools/agentes/fuente/${name}`;
    const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(agentsDir, name), 'utf8'));
    validateAgent(meta, srcRel);
    targets.set(`.claude/agents/${meta.nombre}.md`, renderClaudeAgent(meta, body, srcRel));
    targets.set(`.gemini/agents/${meta.nombre}.md`, renderGeminiAgent(meta, body, srcRel));
  }
  const skillsDir = path.join(rootDir, 'tools', 'skills', 'fuente');
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir).filter((f) => f.endsWith('.md')).sort()) {
      const srcRel = `tools/skills/fuente/${name}`;
      const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(skillsDir, name), 'utf8'));
      const skillBody = renderSkill(meta, body, srcRel);
      targets.set(`.claude/skills/${meta.nombre}/SKILL.md`, skillBody);
      targets.set(`.gemini/skills/${meta.nombre}/SKILL.md`, skillBody);
      targets.set(`.gemini/commands/${meta.nombre}.toml`, renderGeminiCommand(meta, srcRel));
    }
  }
  return targets;
}

/** Genera salidas o verifica deriva (--check). */
export function runSync({ rootDir = process.cwd(), check = false } = {}) {
  const targets = buildTargets(rootDir);
  const drifted = [];
  for (const [rel, expected] of targets.entries()) {
    const abs = path.join(rootDir, rel);
    const current = fs.existsSync(abs) ? normalize(fs.readFileSync(abs, 'utf8')) : null;
    if (current === expected) continue;
    if (check) {
      drifted.push(rel);
    } else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, expected, 'utf8');
    }
  }
  return { total: targets.size, drifted };
}

function parseCliArgs(argv) {
  const check = argv.includes('--check');
  const idx = argv.indexOf('--root');
  const rootDir = idx !== -1 && argv[idx + 1] ? path.resolve(argv[idx + 1]) : process.cwd();
  return { check, rootDir };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { check, rootDir } = parseCliArgs(process.argv.slice(2));
  const { total, drifted } = runSync({ rootDir, check });
  if (check && drifted.length > 0) {
    console.error(`Deriva detectada en ${drifted.length} archivo(s):\n- ${drifted.join('\n- ')}`);
    process.exit(1);
  }
  console.log(check ? `Sincronización OK (${total} archivos verificados).` : `Generados ${total} archivos.`);
}
