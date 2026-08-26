/**
 * lib/quote.ts 快速自测（对照业主口径手算值）。
 * 用法：先用 tsc 编译（见 package 外命令），再 node scripts/quote-selftest.cjs
 */
const { computeQuote } = require('./.tmp/apps/web/lib/quote.js');

const q = computeQuote({
  area: 300,
  style: '现代',
  tier: 'standard',
  region: 'jakarta',
  pool: false,
  garden: false,
});

// 手算：硬装 300×5000×0.9×1.0×1.0×1.4 = 1,890,000
//       软装 300×4250×0.9×1.0        = 1,147,500
//       设计费 300×1500×1.2           =   540,000
//       总价                            = 3,577,500
const expect = {
  hardRmb: 1890000,
  softRmb: 1147500,
  designFeeRmb: 540000,
  extrasRmb: 0,
  totalRmb: 3577500,
};

let pass = true;
for (const [k, v] of Object.entries(expect)) {
  const actual = Math.round(q[k]);
  const ok = actual === v;
  if (!ok) pass = false;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${k}: actual=${actual} expect=${v}`);
}
console.log('breakdown:', JSON.stringify(q.breakdown.map((b) => [b.key, Math.round(b.amountRmb)])));
console.log(pass ? 'ALL PASS' : 'SOME FAILED');
process.exit(pass ? 0 : 1);
