/**
 * lib/bom.ts 自测（300㎡ 现代·标准档·3 房·无附加，对照手算值）。
 * 用法：先 tsc 编译到 scripts/.tmp（见 README 注释），再 node scripts/bom-selftest.cjs
 *
 * 编译命令（apps/web 目录下）：
 *   npx tsc lib/bom.ts lib/materials.ts lib/quote.ts lib/cases.ts lib/types.ts \
 *     --outDir scripts/.tmp --rootDir ../.. --module commonjs --target es2019 \
 *     --resolveJsonModule --esModuleInterop --skipLibCheck
 *   并同步 data/materials.json、data/cases.json 到 scripts/.tmp/data/
 */
const { computeBom } = require('./.tmp/apps/web/lib/bom.js');

const r = computeBom({
  area: 300,
  style: '现代',
  tier: 'standard',
  rooms_count: 3,
  floors: 2,
  has_pool: false,
  has_garden: false,
});

/* 手算口径（降级模型）：
 * 房间：客厅/公共区 171 (=300−129)、主卧 25、次卧×2 20、卫浴×2 6、厨房 12、餐厅 25、书房 15
 * 公共区地面 = 171+25+12+15 = 223 ㎡ → 瓷砖 60×60（waste 1.08）= 240.8
 * 卧室地面   = 65 ㎡ → HDF 复合地板（waste 1.05）= 68.3
 * 卫浴套件   = 2 套（马桶×2 + 花洒×2）
 * 门         = 3 卧 + 2 卫 + 厨 + 书房 = 7 樘
 * 灯具点位   = ceil(300/4) = 75
 */
let pass = true;
function check(label, actual, expect, tol = 0.05) {
  const ok = Math.abs(actual - expect) <= Math.max(Math.abs(expect) * tol, 0.06);
  if (!ok) pass = false;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: actual=${actual} expect≈${expect}`);
}

const line = (scope) => r.bom.find((l) => l.room_scope === scope);

check('公共区地面数量', line('全屋地面').quantity, 240.8, 0.001);
check('卧室地面数量', line('卧室地面').quantity, 68.3, 0.001);
check('卫浴马桶数量', line('卫浴（估算）') ? 2 : 0, 2, 0);
const bathLines = r.bom.filter((l) => l.category === '卫浴');
check('卫浴行数(马桶+花洒)', bathLines.length, 2, 0);
check('卫浴每行数量', bathLines.every((l) => l.quantity === 2) ? 2 : 0, 2, 0);
check('门数量', line('各房间门').quantity, 7, 0);
check('灯具点位', line('全屋照明').quantity, 75, 0);
check('衣柜延米', line('卧室衣柜').quantity, 10.8, 0.001);
check('厨柜延米', line('厨房厨柜').quantity, 4, 0);

// 手算金额对照
check('公共区地面小计', line('全屋地面').subtotal_idr, 24080000, 0.001);
check('卧室地面小计', line('卧室地面').subtotal_idr, 9971800, 0.001);

// 对平：total = Σsubtotal + labor（容差 1%）
const sumSub = r.bom.reduce((s, l) => s + l.subtotal_idr, 0);
const recomposed = sumSub + r.labor.total_idr;
check('总价对平', r.total_idr, recomposed, 0.01);

// anchor 对照口径：系数法「装修」(fitout) 分项 = 硬装 1,890,000 RMB × 0.18
check('anchor.scope', r.estimate_anchor.scope === 'finishing' ? 1 : 0, 1, 0);
check('anchor fitout 分项 RMB', r.estimate_anchor.total_rmb, 340200, 0.001);
check('anchor fitout 分项 IDR', r.estimate_anchor.total_idr, 708750000, 0.001);
check('anchor diff_pct', r.estimate_anchor.diff_pct, -78.9, 0.002);
console.log(`材料合计: Rp ${sumSub.toLocaleString('id-ID')}`);
console.log(`人工合计(×${r.labor.weight}): Rp ${r.labor.total_idr.toLocaleString('id-ID')}`);
console.log(`BOM 总价: Rp ${r.total_idr.toLocaleString('id-ID')}`);
console.log(`估算对照: Rp ${r.estimate_anchor.total_idr.toLocaleString('id-ID')} (diff ${r.estimate_anchor.diff_pct}%)`);
console.log(`BOM 行数: ${r.bom.length}，空间来源: ${r.room_source}`);
console.log(pass ? 'ALL PASS' : 'SOME FAILED');
process.exit(pass ? 0 : 1);
