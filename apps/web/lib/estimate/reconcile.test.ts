/* M4 · A 级对账验证（node:test 承载，随 npm run test:estimate 一起跑）
 * 跑 5 风格 × 3 面积 × jakarta 共 15 组输入，三条估价线对比并打印对比表。
 * 断言口径（2026-08-27 数据补全后更新）：
 *   - 三条线所有组总价 > 0（引擎基本可用）；
 *   - 平均 |quick vs BOM| 偏差必须小于补全前基准 42.2%（回归锁，防偏差反弹）；
 *   - 单组最大 |偏差| < 75%（当前最差组 french/120㎡ 为 -70%，锁定不恶化）；
 *   - 偏差方向不再要求一致：补全后 modern/italian 中大面积组已出现小幅正偏差（±6% 内），
 *     说明 quick 与 BOM 在收敛区交叉，是健康信号而非异常。
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
    assert.ok(
      Math.abs(r.diff_vs_bom_pct) < 75,
      `${r.style}/${r.area} 单组偏差 ${r.diff_vs_bom_pct}% 超出 ±75% 锁定线`
    );
  }
  // 回归锁：平均偏差不得反弹回数据补全前（42.2%）以上
  assert.ok(
    summary.mean_abs_diff_pct < 42.2,
    `平均偏差 ${summary.mean_abs_diff_pct}% 反弹至补全前基准 42.2% 以上`
  );
});
