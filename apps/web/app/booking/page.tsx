'use client';

import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import { useLanguage } from '@/components/LanguageProvider';
import { IconChat } from '@/components/icons';
import { STYLES } from '@/lib/types';
import { WHATSAPP_NUMBER, API_BASE } from '@/lib/site';

const STYLE_OPTIONS = STYLES.filter((s) => s !== '全部' && s !== '更多');

const inputCls =
  'w-full border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent';
const labelCls = 'mb-1.5 block text-xs tracking-widest text-ink-3';

export default function BookingPage() {
  const { t, locale } = useLanguage();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [style, setStyle] = useState<string>('现代');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      setError(true);
      return;
    }
    setError(false);

    // 先把线索写入 API（await，失败静默，不阻塞 WhatsApp 跳转）
    try {
      await fetch(`${API_BASE}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim() || undefined,
          location: location.trim() || undefined,
          area: area ? Number(area) : undefined,
          style,
          message: message.trim() || undefined,
          locale,
        }),
      });
    } catch {
      // API 不可用时静默继续，WhatsApp 仍是主通道
    }

    // 用当前语言的字段标签拼消息
    const lines = [
      `【${t.bookingForm.title} · Nusantara Atelier】`,
      `${t.bookingForm.name}: ${name.trim()}`,
      `${t.bookingForm.whatsapp}: ${whatsapp.trim()}`,
    ];
    if (email.trim()) lines.push(`${t.bookingForm.email}: ${email.trim()}`);
    if (location.trim())
      lines.push(`${t.bookingForm.location}: ${location.trim()}`);
    if (area.trim()) lines.push(`${t.bookingForm.area}: ${area.trim()}`);
    lines.push(`${t.bookingForm.style}: ${t.styles[style] ?? style}`);
    if (message.trim()) lines.push(`${t.bookingForm.message}: ${message.trim()}`);

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <main className="min-h-screen bg-paper pb-24">
      <SiteHeader />

      <div className="mx-auto max-w-2xl px-6 pt-28">
        <p className="section-eyebrow">{t.bookingForm.eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-balance text-ink md:text-4xl">
          {t.bookingForm.title}
        </h1>
        <p className="mt-3 text-sm leading-[1.7] text-ink-2">
          {t.booking.body}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t.bookingForm.name} *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>{t.bookingForm.whatsapp} *</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className={inputCls}
                inputMode="tel"
                required
              />
            </div>
            <div>
              <label className={labelCls}>{t.bookingForm.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t.bookingForm.location}</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.bookingForm.locationPlaceholder}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t.bookingForm.area}</label>
              <input
                type="number"
                min={0}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t.bookingForm.style}</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className={inputCls}
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {t.styles[s] ?? s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.bookingForm.message}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-sm text-accent">{t.bookingForm.required}</p>
          )}

          <button
            type="submit"
            className="w-full bg-accent px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-accent-dark"
          >
            {t.bookingForm.submit}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-ink-3">
            <IconChat className="h-3.5 w-3.5" />
            {t.bookingForm.waHint}
          </p>
        </form>
      </div>
    </main>
  );
}
