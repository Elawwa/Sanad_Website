import React from 'react';
import { Megaphone } from 'lucide-react';

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
      "Eid Mubarak! Our office will be closed on June 16-18."
    ] : [
      "عيد مبارك! ستغلق مكاتبنا في الفترة من 16 إلى 18 يونيو."
    ];
  }

  return (
    <div 
      id="announcement-bar" 
      className="fixed top-[72px] left-0 w-full h-9 bg-gradient-to-r from-[#4c6cd0] to-[#314b9b] text-white z-40 border-b border-white/10 flex items-center justify-center select-none font-sans px-4"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-xs md:text-sm font-medium tracking-wide">
        <Megaphone className="w-3.5 h-3.5 text-[#ffc57e] shrink-0" />
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {newsItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#ffc57e] text-sm">✦</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

