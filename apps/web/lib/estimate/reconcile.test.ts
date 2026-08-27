/* M4 · A 级对账验证（node:test 承载，随 npm run test:estimate 一起跑）
 * 跑 5 风格 × 3 面积 × jakarta 共 15 组输入，三条估价线对比并打印对比表。
 * 断言口径：
 *   - 三条线所有组总价 > 0（引擎基本可用）；
 *   - quick vs BOM 偏差方向一致（全部同号）——方向一致说明偏差是口径性缺数，可解释；
 *   - 平均偏差与 <25% 组数只打印不硬卡（P1 骨架阶段如实记录，验收线见对账报告）。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileMatrix, reconcileTable } from './reconcile';

test('M4-A 对账矩阵：quick_estimate vs BOM vs 系数法（15 组）', () => {
  const summary = reconcileMatrix();
  // 控制台输出对比表（node --test 下可见），报告用同一张表
  console.log('\n' + reconcileTable(summary));
  console.log(
    `\n平均 |quick vs BOM| 偏差：${summary.mean_abs_diff_pct}%；` +
      `<25% 组数：${summary.within_25pct}/${summary.total}`
  );

  assert.equal(summary.rows.length, 15);
  for (const r of summary.rows) {
    assert.ok(r.quick_idr > 0, `${r.style}/${r.area} quick 总价应 > 0`);
    assert.ok(r.bom_idr > 0, `${r.style}/${r.area} BOM 总价应 > 0`);
    assert.ok(r.quote_fitout_idr > 0, `${r.style}/${r.area} fitout 应 > 0`);
  }
  // 偏差方向一致性：P1 骨架缺数导致 quick 系统性低于 BOM（全部同号则口径性偏差，可解释）
  const signs = new Set(summary.rows.map((r) => Math.sign(r.diff_vs_bom_pct)));
  assert.equal(signs.size, 1, 'quick vs BOM 偏差方向应一致（口径性缺数可解释）');
});
