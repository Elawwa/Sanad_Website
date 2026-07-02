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

      {/* Starfield Backdrop (Three.js / React Three Fiber) */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <Canvas>
          <Stars radius={50} count={1800} factor={3} fade speed={1.5} />
        </Canvas>
      </div>
    </motion.section>
  );
}
