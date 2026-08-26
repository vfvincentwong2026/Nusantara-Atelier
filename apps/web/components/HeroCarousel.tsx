'use client';

import { useEffect, useState } from 'react';

/**
 * Hero 实景照片轮播：纯 client JS 交叉淡入淡出 + 缓慢 Ken Burns 推近，无第三方依赖。
 * 白色蒙版叠加（规范 §6：白蒙版保留），保证墨色标题文案可读。
 */
export default function HeroCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      5000
    );
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-paper-soft">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          } ${i === index ? 'animate-hero-zoom' : ''}`}
        />
      ))}
      {/* 浅色蒙版：全幅实景 + 白色渐变压亮，底部融入页面基底 */}
      <div className="absolute inset-0 bg-white/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/25 to-paper" />
    </div>
  );
}
