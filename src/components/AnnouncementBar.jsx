import React from 'react';

export default function AnnouncementBar({ announcement, lang }) {
  // Check if announcement is visible, or default to showing the live news feed
  const showTicker = announcement?.visible !== false;
  if (!showTicker) return null;

  const customText = lang === 'en' ? announcement?.textEn : announcement?.textAr;
  let newsItems = [];
  if (customText && customText.trim().length > 0) {
    newsItems = customText.split('|').map(s => s.trim()).filter(Boolean);
  } else {
    newsItems = lang === 'en' ? [
      "Eid Mubarak! Our office will be closed on June 16-18.",
      "Establish your UAE Mainland LLC with Sanad Consulting.",
      "Sharjah Publishing City (SPC) Free Zone setup updates.",
      "Special corporate tax consultations now available.",
      "Bilingual legal drafting services for new enterprises."
    ] : [
      "عيد مبارك! ستغلق مكاتبنا في الفترة من 16 إلى 18 يونيو.",
      "أسس شركتك ذات المسؤولية المحدودة في الإمارات مع سند للاستشارات.",
      "آخر تحديثات تأسيس الشركات في مدينة الشارقة للنشر (SPC).",
      "استشارات مخصصة لضريبة الشركات متاحة الآن.",
      "خدمات صياغة العقود القانونية بلغتين للمشاريع الجديدة."
    ];
  }

  // Duplicate items for marquee to prevent gaps/glitches if items count is low
  if (newsItems.length === 1) {
    newsItems = [newsItems[0], newsItems[0], newsItems[0]];
  } else if (newsItems.length === 2) {
    newsItems = [newsItems[0], newsItems[1], newsItems[0], newsItems[1]];
  }


  return (
    <div 
      id="announcement-bar" 
      className="fixed top-[72px] left-0 w-full h-9 bg-gradient-to-r from-[#4c6cd0] to-[#314b9b] text-white z-40 border-b border-white/10 flex items-center overflow-hidden select-none font-sans"
      dir="ltr"
    >
      {/* Live Badge in Sanad Gold */}
      <div className="bg-[#ffc57e] text-[#1e293b] text-[10px] font-extrabold uppercase tracking-widest h-full px-4 flex items-center justify-center gap-1.5 shrink-0 z-10 shadow-[2px_0_8px_rgba(0,0,0,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1e293b] animate-pulse" />
        <span>LIVE</span>
      </div>

      {/* Scrolling Text Container */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        <div className="flex w-full overflow-hidden items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-1">
            {newsItems.map((item, idx) => (
              <span key={`item-1-${idx}`} className="flex items-center gap-3 text-xs md:text-sm tracking-wide font-medium text-white">
                <span className="text-[#ffc57e] text-sm">✦</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-1" aria-hidden="true">
            {newsItems.map((item, idx) => (
              <span key={`item-2-${idx}`} className="flex items-center gap-3 text-xs md:text-sm tracking-wide font-medium text-white">
                <span className="text-[#ffc57e] text-sm">✦</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
