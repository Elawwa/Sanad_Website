import React, { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { ArrowRight } from "lucide-react";
import { scrollToTarget } from '../utils/scroll';

const COLORS_TOP = ["#ffc57e", "#4c6cd0", "#1e2e6b", "#314b9b"];

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Hero({ lang, onBookClick, isAnnounceVisible = true }) {
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  const handleScrollToServices = (e) => {
    e.preventDefault();
    scrollToTarget('#services', 120);
  };

  const t = {
    eyebrow: lang === 'en' 
      ? 'PREMIUM CORPORATE ADVISORY' 
      : 'استشارات مؤسسية متميزة',
    titleStart: lang === 'en' ? 'Your Foundation. ' : 'تأسيس متين. ',
    titleHighlight: lang === 'en' ? 'For Growth.' : 'لنمو أعمالك.',
    sub: lang === 'en'
      ? 'Trusted legal structuring and tax strategy in Sharjah Publishing City. Designed for the modern enterprise.'
      : 'هيكلة قانونية واستراتيجية ضريبية موثوقة في مدينة الشارقة للنشر. مصممة للمؤسسات الحديثة.',
    ctaPrimary: lang === 'en' ? 'Schedule Consultation' : 'جدولة استشارة',
    ctaSecondary: lang === 'en' ? 'Explore Services' : 'استكشف الخدمات',
    badge1: lang === 'en' ? 'Sharjah Publishing City (SPC) Partner' : 'شريك مدينة الشارقة للنشر (SPC)',
    badge2: lang === 'en' ? 'Bilingual Corporate Advisory' : 'استشارات مؤسسية بلغتين',
    badge3: lang === 'en' ? 'Tax Strategy & Legal Structuring' : 'استراتيجية الضرائب والهيكلة القانونية'
  };

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className={`relative min-h-screen grid place-content-center overflow-hidden bg-gray-950 px-6 ${isAnnounceVisible ? 'pt-[156px]' : 'pt-[120px]'} pb-16 text-gray-200`}
    >
      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto w-full select-none text-center">
        {/* Eyebrow badge */}
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-slate-800/40 border border-slate-700/30 px-4 py-2 text-xs font-semibold text-[#ffc57e] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffc57e] animate-pulse"></span>
          {t.eyebrow}
        </span>
        
        {/* Title */}
        <h1 className="max-w-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-transparent leading-[1.1] leading-tight">
          {t.titleStart}
          <span className="text-[#ffc57e] font-sans font-extrabold block md:inline">{t.titleHighlight}</span>
        </h1>
        
        {/* Subtitle */}
        <p className="my-6 max-w-2xl text-center text-base md:text-lg text-slate-300 font-light leading-relaxed font-sans">
          {t.sub}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 items-center justify-center font-sans">
          <motion.button
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            onClick={onBookClick}
            className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/20 px-6 py-3.5 text-sm font-bold text-gray-50 transition-colors hover:bg-gray-950/60"
          >
            {t.ctaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <a
            href="#services"
            onClick={handleScrollToServices}
            className="px-6 py-3.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold hover:scale-[1.015] active:scale-[0.985] transition-all text-sm"
          >
            {t.ctaSecondary}
          </a>
        </div>

        {/* Checkmarks Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-y-4 gap-x-8 text-xs font-semibold text-slate-300 w-full font-sans">
          <div className="flex items-center gap-2">
            <CheckIcon className="text-[#ffc57e] w-4 h-4 shrink-0" />
            <span>{t.badge1}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="text-[#ffc57e] w-4 h-4 shrink-0" />
            <span>{t.badge2}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="text-[#ffc57e] w-4 h-4 shrink-0" />
            <span>{t.badge3}</span>
          </div>
        </div>
      </div>

      {/* Subtle Background Watermarks (Logo Greek Pillar & Scales of Justice) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        {/* Large Central Logo-Inspired Greek Pillar Outline */}
        <svg
          className="absolute w-[120%] max-w-[800px] h-auto text-white/[0.03] md:text-white/[0.04]"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shaft columns */}
          <rect x="76" y="55" width="8" height="90" rx="1" stroke="currentColor" strokeWidth="0.5" />
          <rect x="88" y="55" width="8" height="90" rx="1" stroke="currentColor" strokeWidth="0.5" />
          <rect x="100" y="55" width="8" height="90" rx="1" stroke="currentColor" strokeWidth="0.5" />
          <rect x="112" y="55" width="8" height="90" rx="1" stroke="currentColor" strokeWidth="0.5" />
          <rect x="124" y="55" width="8" height="90" rx="1" stroke="currentColor" strokeWidth="0.5" />
          {/* Base & Top */}
          <rect x="65" y="145" width="70" height="6" rx="2" fill="currentColor" opacity="0.3" />
          <rect x="70" y="139" width="60" height="6" rx="1" fill="currentColor" opacity="0.3" />
          <rect x="70" y="51" width="60" height="4" rx="1" fill="currentColor" opacity="0.3" />
          <path d="M 68 45 C 68 50, 76 50, 76 45 Z" fill="currentColor" opacity="0.3" />
          <path d="M 124 45 C 124 50, 132 50, 132 45 Z" fill="currentColor" opacity="0.3" />
        </svg>

        {/* Floating Scales of Justice Outlines (Left & Right) */}
        <svg
          className="absolute left-[-8%] md:left-[5%] w-[35%] max-w-[280px] h-auto text-[#ffc57e]/[0.03] md:text-[#ffc57e]/[0.04] rotate-[15deg]"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="35" x2="80" y2="35" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="35" x2="10" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="35" x2="30" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 5 60 Q 20 68 35 60 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" />
          <line x1="80" y1="35" x2="70" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="80" y1="35" x2="90" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 65 60 Q 80 68 95 60 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        <svg
          className="absolute right-[-8%] md:right-[5%] w-[35%] max-w-[280px] h-auto text-[#4c6cd0]/[0.03] md:text-[#4c6cd0]/[0.04] rotate-[-15deg]"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="35" x2="80" y2="35" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="35" x2="10" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="35" x2="30" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 5 60 Q 20 68 35 60 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" />
          <line x1="80" y1="35" x2="70" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="80" y1="35" x2="90" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 65 60 Q 80 68 95 60 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Starfield Backdrop (Three.js / React Three Fiber) */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas>
          <Stars radius={50} count={1500} factor={3} fade speed={1.2} />
        </Canvas>
      </div>
    </motion.section>
  );
}
