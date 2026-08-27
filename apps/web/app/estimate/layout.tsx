import type { Metadata } from 'next';

/** /estimate 为 client component，独立元数据由本 server layout 提供（同 /upload 模式） */
export const metadata: Metadata = {
  title: 'Internal Demo · Quick Estimate',
  description:
    'P1 quick_estimate 工序级快速估价引擎内部演示页（数据校对中，不对外）。Internal demo of the process-level quick estimate engine.',
  robots: { index: false, follow: false }, // 内部演示页，禁止收录
};

export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
