/**
 * 全站统一线性图标库（设计规范 §4）：
 * 1.5px 描边、圆角端点、无填充、20×20 视框、颜色跟随 currentColor。
 * 禁止 emoji 当功能图标；新图标一律加在这里统一导出。
 */

interface IconProps {
  className?: string;
}

function Svg({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 设计服务：铅笔 + 尺 */
export function IconPencilRuler({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12.5 3.5l3 3L8 14l-4 1 1-4 7.5-7.5z" />
      <path d="M11 5l3 3" />
      <path d="M3.5 17.5h13" />
      <path d="M6.5 17.5v-2M10 17.5v-2M13.5 17.5v-2" />
    </Svg>
  );
}

/** 装修服务：砖墙 */
export function IconBrickWall({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 4h14v12H3z" />
      <path d="M3 8h14M3 12h14" />
      <path d="M10 4v4M6.5 8v4M13.5 8v4M10 12v4" />
    </Svg>
  );
}

/** 软装服务：沙发 */
export function IconSofa({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 9V6.5A1.5 1.5 0 0 1 7.5 5h5A1.5 1.5 0 0 1 14 6.5V9" />
      <path d="M4 9a2 2 0 0 0-2 2v4h16v-4a2 2 0 0 0-4 0H6a2 2 0 0 0-2-2z" />
      <path d="M5 15v3M15 15v3" />
    </Svg>
  );
}

/** 整装服务：钥匙 */
export function IconKey({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="7" cy="13" r="3.5" />
      <path d="M9.8 10.2L17 3" />
      <path d="M14 5.8l2.4 2.4M11.8 8l1.8 1.8" />
    </Svg>
  );
}

/** 关闭（灯箱等） */
export function IconClose({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 5l10 10M15 5L5 15" />
    </Svg>
  );
}

/** 上一张 */
export function IconChevronLeft({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12.5 4L6.5 10l6 6" />
    </Svg>
  );
}

/** 下一张 */
export function IconChevronRight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7.5 4l6 6-6 6" />
    </Svg>
  );
}

/** 文件 */
export function IconFile({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 2.5h6.5L15 6v11.5H5z" />
      <path d="M11.5 2.5V6H15" />
    </Svg>
  );
}

/** 锁（隐私提示） */
export function IconLock({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6.5 9V7a3.5 3.5 0 0 1 7 0v2" />
      <path d="M4.5 9h11v8.5h-11z" />
      <path d="M10 12.5v2" />
    </Svg>
  );
}

/** 对话气泡（WhatsApp 提示） */
export function IconChat({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 3a7 7 0 0 0-6.05 10.45L3 17l3.65-.95A7 7 0 1 0 10 3z" />
    </Svg>
  );
}

/** 上传 */
export function IconUpload({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 12.5V3.5M6.5 7L10 3.5 13.5 7" />
      <path d="M4 12.5v4h12v-4" />
    </Svg>
  );
}
