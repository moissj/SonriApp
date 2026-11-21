import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createPlan, nextPlanNumber } from '../nuevo-plan.mjs';

describe('nuevo-plan.mjs', () => {
  it('calcula numeración secuencial sin repetidos entre plan y tracker', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sonri-plan-'));
    try {
      const p0 = createPlan({ rootDir: tmp, slug: 'auditoria', title: 'Auditoría inicial' });
      assert.equal(p0.num, '00');
      assert.ok(fs.existsSync(p0.planPath));
      assert.ok(fs.existsSync(p0.trackerPath));

      const tracker0 = fs.readFileSync(p0.trackerPath, 'utf8');
      assert.match(tracker0, /\*\*Herramienta en uso:\*\* Claude/);
      assert.match(tracker0, /\.\.\/fase_de_desarrollo\/00_auditoria_plan\.md/);
      assert.ok(tracker0.trimEnd().endsWith('- [ ] Commit'));

      // Simular un tracker suelto con número 03 en trackerDir para comprobar salto a 04
      fs.writeFileSync(path.join(tmp, 'gestion', 'tracker', '03_manual.md'), '# 03', 'utf8');
      const pNext = createPlan({ rootDir: tmp, slug: 'siguiente', title: 'Siguiente paso', herramienta: 'Gemini' });
      assert.equal(pNext.num, '04');
      assert.match(fs.readFileSync(pNext.trackerPath, 'utf8'), /\*\*Herramienta en uso:\*\* Gemini/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('rechaza slugs inválidos o herramienta desconocida', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sonri-plan-err-'));
    try {
      assert.throws(() => createPlan({ rootDir: tmp, slug: 'Con_Mayusculas', title: 'Test' }), /Slug inválido/);
      assert.throws(() => createPlan({ rootDir: tmp, slug: 'valido', title: '   ' }), /título/);
      assert.throws(
        () => createPlan({ rootDir: tmp, slug: 'valido', title: 'Test', herramienta: 'Otra' }),
        /Herramienta inválida/
      );
      assert.equal(nextPlanNumber(path.join(tmp, 'a'), path.join(tmp, 'b')), '00');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

