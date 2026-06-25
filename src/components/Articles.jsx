import React, { useRef, useState, useEffect } from 'react';

export default function Articles({ lang, articles, onArticleClick }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const t = {
    title: lang === 'en' ? 'Latest Insights & Articles' : 'آخر المقالات والأخبار',
    subtitle: lang === 'en' ? 'Stay updated with recent business setups, tax advice, and corporate regulations in the UAE.' : 'تابع أحدث مستجدات تأسيس الشركات، واللوائح الضريبية، وحوكمة الأعمال في دولة الإمارات.',
    readMore: lang === 'en' ? 'Read Article' : 'اقرأ المقال',
    noArticles: lang === 'en' ? 'No articles published yet.' : 'لا توجد مقالات منشورة بعد.',
  };

  const checkScrollLimits = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    // In RTL, scrollLeft can be negative or positive depending on browser implementation,
    // so we handle limits based on scrollWidth, clientWidth, and scrollLeft.
    const scrollLeft = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      // Run initial check
      checkScrollLimits();
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScrollLimits);
    };
  }, [articles]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = 350; // card width + gap
    // Account for RTL direction
    const isRtl = lang === 'ar';
    const multiplier = isRtl ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1);

    el.scrollBy({
      left: scrollAmount * multiplier,
      behavior: 'smooth'
    });
  };

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section id="articles" className="reveal-on-scroll py-16 px-6 bg-white border-t border-slate-100 select-none">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-800 mb-3 tracking-tight">
          {t.title}
        </h2>
        <div className="w-12 h-1 bg-[#4c6cd0] mx-auto mb-4 rounded-full" />
        <p className="text-slate-500 max-w-xl mx-auto text-xs md:text-sm font-light leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto group/carousel">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-slate-200/50 shadow-md flex items-center justify-center text-slate-600 hover:text-[#4c6cd0] hover:border-[#4c6cd0]/30 transition-all select-none hover:scale-105 active:scale-95"
            aria-label="Previous Articles"
          >
            <span className="text-lg font-bold">←</span>
          </button>
        )}

        {/* Scrollable Carousel Wrapper */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {articles.map((art) => {
            const hasCover = art.coverImage && art.coverImage.length > 0;
            return (
              <div
                key={art.id}
                onClick={() => onArticleClick(art.id)}
                className="flex-shrink-0 w-[290px] sm:w-[320px] bg-[#faf8f4] border border-slate-200/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 snap-start cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                    {hasCover ? (
                      <img
                        src={art.coverImage}
                        alt={lang === 'en' ? art.titleEn : art.titleAr}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e2e6b] to-[#4c6cd0] text-white/40 font-serif text-lg italic">
                        SANAD
                      </div>
                    )}
                    {/* Category Overlay Tag */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#4c6cd0] px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                      {lang === 'en' ? art.categoryEn : art.categoryAr}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 flex flex-col gap-2.5">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                      {art.date}
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
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-slate-200/50 shadow-md flex items-center justify-center text-slate-600 hover:text-[#4c6cd0] hover:border-[#4c6cd0]/30 transition-all select-none hover:scale-105 active:scale-95"
            aria-label="Next Articles"
          >
            <span className="text-lg font-bold">→</span>
          </button>
        )}
      </div>
    </section>
  );
}
