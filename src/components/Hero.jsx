import React from 'react';
import { motion } from 'framer-motion';

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Hero({ lang, onBookClick, isAnnounceVisible = true }) {
  const handleScrollToServices = (e) => {
    e.preventDefault();
    const target = document.querySelector('#services');
    if (target) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
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

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section 
      id="home" 
      className={`relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e2e6b] to-[#4c6cd0] text-white flex items-center ${isAnnounceVisible ? 'pt-[156px]' : 'pt-[120px]'} pb-16 overflow-hidden select-none font-sans`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10">
        
        {/* Left Column: Typography Content */}
        <motion.div
          className="lg:col-span-7 flex flex-col items-start text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow Label */}
          <motion.span
            className="text-xs font-bold tracking-[0.2em] text-[#ffc57e] mb-6 uppercase"
            variants={itemVariants}
          >
            {t.eyebrow}
          </motion.span>

          {/* Headline */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-white leading-[1.1] select-none max-w-2xl"
            variants={itemVariants}
          >
            {t.titleStart}
            <span className="text-[#ffc57e] font-sans font-extrabold">{t.titleHighlight}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base md:text-lg text-slate-300 font-light max-w-2xl mt-6 mb-8 leading-relaxed font-sans"
            variants={itemVariants}
          >
            {t.sub}
          </motion.p>

          {/* Call-to-Action Group */}
          <motion.div
            className="flex flex-wrap gap-4 items-center w-full font-sans"
            variants={itemVariants}
          >
            <button
              onClick={onBookClick}
              className="px-7 py-3.5 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md shadow-[#4c6cd0]/10 text-sm"
            >
              {t.ctaPrimary}
            </button>
            <a
              href="#services"
              onClick={handleScrollToServices}
              className="px-7 py-3.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm"
            >
              {t.ctaSecondary}
            </a>
          </motion.div>

          {/* Checkmarks Footer */}
          <motion.div
            className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-y-4 gap-x-8 text-xs font-semibold text-slate-300 w-full font-sans"
            variants={itemVariants}
          >
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
          </motion.div>
        </motion.div>

        {/* Right Column: Corporate Image with glow background */}
        <motion.div
          className="lg:col-span-5 w-full flex items-center justify-center relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Radial glow backdrop */}
          <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-[#ffc57e]/10 to-[#4c6cd0]/10 blur-3xl opacity-75 pointer-events-none" />
          
          <img 
            src="/sanad_hero_symbol.png" 
            alt="Sanad Consulting Advisory Emblem" 
            className="w-full max-w-[480px] object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
          />
        </motion.div>
      </div>

      {/* Decorative gradients */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#ffc57e]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/8 left-10 w-[400px] h-[400px] rounded-full bg-[#4c6cd0]/5 blur-[100px] pointer-events-none" />
    </section>
  );
}
