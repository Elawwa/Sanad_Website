import React from 'react';
import { Carousel } from '@/components/ui/carousel';
import { motion } from 'framer-motion';

export default function Articles({ lang, articles, onArticleClick }) {
  const t = {
    title: lang === 'en' ? 'Latest Insights & Articles' : 'آخر المقالات والأخبار',
    subtitle: lang === 'en' ? 'Stay updated with recent business setups, tax advice, and corporate regulations in the UAE.' : 'تابع أحدث مستجدات تأسيس الشركات، واللوائح الضريبية، وحوكمة الأعمال في دولة الإمارات.',
    readMore: lang === 'en' ? 'Read Article' : 'اقرأ المقال',
    noArticles: lang === 'en' ? 'No articles published yet.' : 'لا توجد مقالات منشورة بعد.',
  };

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <motion.section 
      id="articles" 
      className="py-16 px-6 bg-white border-t border-slate-100 select-none"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-800 mb-3 tracking-tight">
          {t.title}
        </h2>
        <div className="w-12 h-1 bg-[#4c6cd0] mx-auto mb-4 rounded-full" />
        <p className="text-slate-500 max-w-xl mx-auto text-xs md:text-sm font-light leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <Carousel
          options={{
            align: 'start',
            direction: lang === 'ar' ? 'rtl' : 'ltr',
            loop: articles.length > 3,
          }}
          slides={articles.map((art) => {
            const hasCover = art.coverImage && art.coverImage.length > 0;
            return (
              <div
                key={art.id}
                onClick={() => onArticleClick(art.id)}
                className="w-full bg-[#faf8f4] border border-slate-200/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                    {hasCover ? (
                      <img
                        src={art.coverImage}
                        alt={lang === 'en' ? art.titleEn : art.titleAr}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e2e6b] to-[#4c6cd0] text-white/40 font-serif text-lg italic">
                        SANAD
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="p-5 flex flex-col gap-2.5">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                      <span dir="ltr">{art.date}</span>
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug tracking-tight group-hover:text-[#4c6cd0] transition-colors line-clamp-2">
                      {lang === 'en' ? art.titleEn : art.titleAr}
                    </h3>
                    <p className="text-slate-500 text-xs font-light leading-relaxed line-clamp-3">
                      {lang === 'en' ? art.contentEn : art.contentAr}
                    </p>
                  </div>
                </div>

                {/* Read Action Button Footer */}
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 flex justify-between items-center group-hover:bg-slate-50/50 transition-colors">
                  <span className="text-xs font-extrabold text-slate-700 group-hover:text-[#4c6cd0] transition-colors">
                    {t.readMore}
                  </span>
                  <span className="text-slate-400 group-hover:text-[#4c6cd0] transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300 font-bold text-sm">
                    {lang === 'ar' ? '←' : '→'}
                  </span>
                </div>
              </div>
            );
          })}
        />
      </div>
    </motion.section>
  );
}
