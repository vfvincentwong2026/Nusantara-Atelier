/* P1 quick_estimate 单元测试（node:test + node:assert，不新增 npm 依赖）
 * 运行：npm run test:estimate（先 tsc 编译到 .test-build 再 node --test）
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quickEstimate } from './quickEstimate';
import type { EstimateInput } from './types';

/** 基准输入：法式 200㎡ jakarta premium 全空间 */
const BASE: EstimateInput = {
  style: '法式',
  area: 200,
  spaces: ['living', 'kitchen', 'bedroom', 'bathroom'],
  location: 'jakarta',
  tier: 'premium',
};

test('1. 法式 200㎡ jakarta premium：结构完整、区间有序、单方造价在合理带内', () => {
  const out = quickEstimate(BASE);
  // 结构完整
  assert.ok(out.total_idr && out.per_sqm_idr && out.timeline_days);
  assert.ok(Array.isArray(out.breakdown) && out.breakdown.length > 0);
  assert.ok(Array.isArray(out.crew_plan) && out.crew_plan.length > 0);
  assert.ok(out.confidence === 'low' || out.confidence === 'medium');
  // 金额区间有序
  assert.ok(out.total_idr.mid > 0);
  assert.ok(out.total_idr.low < out.total_idr.mid);
  assert.ok(out.total_idr.mid < out.total_idr.high);
  // 单方造价 sanity check：500k–5,000k IDR/㎡（P1 骨架为部分口径，偏低端正常）
  assert.ok(
    out.per_sqm_idr.mid >= 500_000 && out.per_sqm_idr.mid <= 5_000_000,
    `per_sqm mid=${out.per_sqm_idr.mid} 超出 500k–5,000k 合理带`
  );
  // per_sqm 与 total / area 一致
  assert.equal(out.per_sqm_idr.mid, Math.round(out.total_idr.mid / BASE.area));
});

test('2. 风格别名容错：「法式轻奢」「法式奶油」都映射到 french', () => {
  const a = quickEstimate({ ...BASE, style: '法式轻奢' });
  const b = quickEstimate({ ...BASE, style: '法式奶油' });
  const c = quickEstimate({ ...BASE, style: 'french' });
  assert.equal(a.total_idr.mid, b.total_idr.mid);
  assert.equal(a.total_idr.mid, c.total_idr.mid);
});

test('3. 大板/岩板元素强制中国技工（modern 客厅岩板背景墙）', () => {
  const out = quickEstimate({ ...BASE, style: '现代', spaces: ['living'] });
  const slab = out.breakdown.find((b) => b.process === 'large-format-slab-installation');
  assert.ok(slab, 'modern 客厅应展开 large-format-slab-installation（岩板背景墙）');
  assert.equal(slab.crew, 'china-skilled-labor');
});

test('4. 输入校验：不支持的风格抛错并列出支持列表；area 越界抛错', () => {
  assert.throws(() => quickEstimate({ ...BASE, style: '巴洛克' }), /暂不支持的风格/);
  assert.throws(() => quickEstimate({ ...BASE, style: '巴洛克' }), /法式/);
  assert.throws(() => quickEstimate({ ...BASE, area: 10 }), /面积需在/);
  assert.throws(() => quickEstimate({ ...BASE, area: 99999 }), /面积需在/);
});

test('5. data_gaps 非空：draft 数据与缺数环节必须如实标注', () => {
  const out = quickEstimate(BASE);
  assert.ok(out.data_gaps.length > 0, 'draft 阶段 data_gaps 不应为空');
  // 工时未校对必须被标注
  assert.ok(out.data_gaps.some((g) => g.includes('工时未校对')));
  // 法式护墙板无工艺节点必须被标注
  assert.ok(out.data_gaps.some((g) => g.includes('feature_wall')));
});

test('6. 斋月工期：ramadan:true 时 likely 工期为不输入时的 1.3 倍', () => {
  const normal = quickEstimate(BASE);
  const ramadan = quickEstimate({ ...BASE, ramadan: true });
  assert.ok(Math.abs(ramadan.timeline_days.likely - normal.timeline_days.likely * 1.3) < 0.15);
  // 斋月只影响工期，不影响造价
  assert.equal(ramadan.total_idr.mid, normal.total_idr.mid);
});
