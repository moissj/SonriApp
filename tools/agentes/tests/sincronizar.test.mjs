import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { runSync } from '../sincronizar.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..', '..');
const SCRIPT_PATH = path.join(REPO_ROOT, 'tools', 'agentes', 'sincronizar.mjs');

function copyFixtureWorkspace() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sonri-sync-'));
  fs.cpSync(path.join(REPO_ROOT, 'tools', 'agentes', 'fuente'), path.join(tmp, 'tools', 'agentes', 'fuente'), {
    recursive: true,
  });
  fs.cpSync(path.join(REPO_ROOT, 'tools', 'skills', 'fuente'), path.join(tmp, 'tools', 'skills', 'fuente'), {
    recursive: true,
  });
  return tmp;
}

describe('sincronizar.mjs', () => {
  it('genera agentes y skills para Claude y Gemini, manteniendo solo lectura sin escritura', () => {
    const tmp = copyFixtureWorkspace();
    try {
      const res = runSync({ rootDir: tmp, check: false });
      assert.equal(res.total, 19); // 5*2 agentes + 3*3 skills/commands

      for (const ro of ['relevador', 'verificador']) {
        const claude = fs.readFileSync(path.join(tmp, '.claude', 'agents', `${ro}.md`), 'utf8');
        const gemini = fs.readFileSync(path.join(tmp, '.gemini', 'agents', `${ro}.md`), 'utf8');
        assert.match(claude, /GENERADO desde tools\/agentes\/fuente/);
        assert.match(gemini, /GENERADO desde tools\/agentes\/fuente/);
        assert.match(gemini, /Campo omitido en Gemini CLI: esfuerzo/);
        assert.doesNotMatch(claude, /^tools:.*\b(Edit|Write)\b/m);
        assert.doesNotMatch(gemini, /^\s*-\s*(replace|write_file)\s*$/m);
      }

      const cmd = fs.readFileSync(path.join(tmp, '.gemini', 'commands', 'orquestar.toml'), 'utf8');
      assert.match(cmd, /@\{tools\/skills\/fuente\/orquestar\.md\}/);
      assert.match(cmd, /\{\{args\}\}/);

      const ok = runSync({ rootDir: tmp, check: true });
      assert.deepEqual(ok.drifted, []);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('--check falla con código 1 cuando hay deriva provocada en un generado', () => {
    const tmp = copyFixtureWorkspace();
    try {
      runSync({ rootDir: tmp, check: false });
      const target = path.join(tmp, '.gemini', 'agents', 'cliente-web.md');
      fs.appendFileSync(target, '\n<!-- cambio manual indebido -->\n', 'utf8');

      assert.throws(
        () => execFileSync(process.execPath, [SCRIPT_PATH, '--check', '--root', tmp], { stdio: 'pipe' }),
        (err) => err.status === 1 && err.stderr.toString().includes('.gemini/agents/cliente-web.md')
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('rechaza agente de solo lectura si intenta declarar herramientas de escritura', () => {
    const tmp = copyFixtureWorkspace();
    try {
      const file = path.join(tmp, 'tools', 'agentes', 'fuente', 'relevador.md');
      const content = fs.readFileSync(file, 'utf8').replace('[leer, buscar-archivos, buscar-texto]', '[leer, editar]');
      fs.writeFileSync(file, content, 'utf8');
      assert.throws(() => runSync({ rootDir: tmp, check: false }), /solo lectura/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

