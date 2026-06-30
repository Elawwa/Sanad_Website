import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { scrollToTarget } from '../utils/scroll';


export default function Header({ lang, portal, onPortalChange, onLangToggle, onPortalTriggerClick, onServiceClick, isAnnounceVisible = true }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const servicesList = [
    { id: 'setup', titleEn: 'Corporate Setup & Licensing', titleAr: 'تأسيس الشركات والتراخيص', descEn: 'Free zone & mainland entity establishment', descAr: 'تأسيس الشركات في المناطق الحرة والبر الرئيسي' },
    { id: 'tax', titleEn: 'Tax & VAT Advisory', titleAr: 'الاستشارات الضريبية وضريبة القيمة المضافة', descEn: 'Corporate tax compliance & filings', descAr: 'الامتثال الضريبي وإقرارات ضريبة القيمة المضافة' },
    { id: 'legal', titleEn: 'Legal Drafting & Contracts', titleAr: 'الصياغة القانونية والعقود', descEn: 'Watertight bilingual corporate agreements', descAr: 'صياغة العقود والاتفاقيات ثنائية اللغة' },
    { id: 'trainings', titleEn: 'Trainings & Consultancies', titleAr: 'التدريب والاستشارات', descEn: 'Bespoke AML & corporate governance training', descAr: 'تدريب مكافحة غسيل الأموال وحوكمة الشركات' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    home: lang === 'en' ? 'Home' : 'الرئيسية',
    services: lang === 'en' ? 'Services' : 'خدماتنا',
    articles: lang === 'en' ? 'Articles' : 'المقالات',
    about: lang === 'en' ? 'About' : 'عن سند',
    booking: lang === 'en' ? 'Book Consultation' : 'حجز استشارة',
    contact: lang === 'en' ? 'Contact Us' : 'اتصل بنا',
    admin: lang === 'en' ? 'Admin Portal' : 'بوابة الإدارة',
    langBtn: lang === 'en' ? 'العربية' : 'English',
    tagline: lang === 'en' ? 'Consulting' : 'للاستشارات',
  };

  const handleNavClick = (e, hash) => {
    e.preventDefault();
    onPortalChange('client');
    setIsMenuOpen(false);
    setTimeout(() => {
      scrollToTarget(hash, isAnnounceVisible ? 120 : 80);
    }, 50);
  };

  const handlePortalClick = (e, targetPortal) => {
    e.preventDefault();
    setIsMenuOpen(false);
    onPortalTriggerClick(targetPortal);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full h-[72px] z-50 bg-white border-b border-slate-100 flex items-center transition-shadow duration-300 ${
          scrolled ? 'shadow-md shadow-slate-100/50' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between w-full">

          {/* ── Brand Logo (Bigger) ── */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center select-none hover:opacity-90 transition-opacity"
          >
            <img src={lang === 'ar' ? (scrolled ? "/logo-white-ar.png" : "/logo-blue-ar.png") : (scrolled ? "/logo-white.png" : "/logo-blue.png")} alt="SANAD Consulting Logo" className="h-14 object-contain transition-all duration-300" />
          </a>

          {/* ── Desktop Capsule Navigation (Right) ── */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/60 border border-slate-200/50 p-1.5 rounded-full shadow-sm">
            {/* Home */}
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, '#home')}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 select-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.home}
            </a>

            {/* About */}
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, '#about')}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 select-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.about}
            </a>

            {/* Services with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsServicesDropdownOpen(true)}
              onMouseLeave={() => setIsServicesDropdownOpen(false)}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsServicesDropdownOpen(!isServicesDropdownOpen);
                }}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 select-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-1 group"
              >
                <span>{t.services}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isServicesDropdownOpen ? 'rotate-180' : ''} text-slate-500 group-hover:text-[#4c6cd0]`} />
              </button>

              {isServicesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-[480px] bg-white border border-slate-200/50 rounded-2xl shadow-xl p-4 grid grid-cols-2 gap-2.5 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {servicesList.map((s, idx) => (
                      <a
                        key={idx}
                        href={`#service-${s.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsServicesDropdownOpen(false);
                          onServiceClick(s.id);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex flex-col group"
                      >
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#4c6cd0] transition-colors">{lang === 'en' ? s.titleEn : s.titleAr}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">{lang === 'en' ? s.descEn : s.descAr}</span>
                      </a>
                    ))}
                    <div className="col-span-2 border-t border-slate-100 pt-2.5 mt-1 flex justify-between items-center px-1">
                      <a
                        href="#services"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsServicesDropdownOpen(false);
                          handleNavClick(e, '#services');
                        }}
                        className="text-xs font-bold text-[#4c6cd0] hover:text-[#314b9b] flex items-center gap-1 transition-colors"
                      >
                        <span>{lang === 'en' ? 'View all services →' : 'عرض جميع الخدمات ←'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Articles */}
            <a
              href="#articles"
              onClick={(e) => handleNavClick(e, '#articles')}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 select-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.articles}
            </a>

            {/* Contact Us */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 select-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.contact}
            </a>

            {/* Book Consultation */}
            <a
              href="#book"
              onClick={(e) => handleNavClick(e, '#book')}
              className="px-5 py-2 text-xs font-bold text-white bg-[#4c6cd0] hover:bg-[#314b9b] rounded-full transition-all duration-300 select-none hover:shadow-[0_2px_8px_rgba(76,108,208,0.25)]"
            >
              {t.booking}
            </a>

            {/* Divider */}
            <div className="w-px h-4 bg-slate-200 mx-1" />

            {/* Language Switcher */}
            <button
              onClick={onLangToggle}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 select-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.langBtn}</span>
            </button>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="lg:hidden text-[#1e293b] p-2 hover:bg-slate-50 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      <div
        className={`fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl transition-all duration-500 lg:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Close */}
        <div className="absolute top-5 right-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-[#1e293b] p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200/40"
            aria-label="Close Navigation Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="h-full flex flex-col justify-center items-center px-8 text-center gap-6">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-2">
            <img src={lang === 'ar' ? "/logo-blue-ar.png" : "/logo-blue.png"} alt="SANAD Consulting Logo" className="h-16 object-contain" />
          </div>

          {/* Navigation Links (Premium Capsule Dock) */}
          <div className="flex flex-col gap-2 w-full max-w-[280px] items-center bg-slate-100/60 border border-slate-200/50 p-2.5 rounded-[32px] shadow-sm">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, '#home')}
              className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.home}
            </a>

            <a
              href="#about"
              onClick={(e) => handleNavClick(e, '#about')}
              className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.about}
            </a>

            {/* Services with Mobile Accordion */}
            <div className="flex flex-col items-center w-full">
              <button
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center gap-1"
              >
                <span>{t.services}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''} text-slate-500`} />
              </button>
              {isMobileServicesOpen && (
                <div className="flex flex-col gap-1.5 mt-2 bg-white border border-slate-200/50 p-3 rounded-2xl w-[90%] text-center shadow-md">
                  {servicesList.map((s, idx) => (
                    <a
                      key={idx}
                      href={`#service-${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        setIsMobileServicesOpen(false);
                        onServiceClick(s.id);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-[#4c6cd0] transition-colors py-1 block"
                    >
                      {lang === 'en' ? s.titleEn : s.titleAr}
                    </a>
                  ))}
                  <a
                    href="#services"
                    onClick={(e) => {
                      setIsMobileServicesOpen(false);
                      handleNavClick(e, '#services');
                    }}
                    className="text-[10px] font-bold text-[#4c6cd0] pt-2 border-t border-slate-100 block"
                  >
                    {lang === 'en' ? 'View all services →' : 'عرض جميع الخدمات ←'}
                  </a>
                </div>
              )}
            </div>

            <a
              href="#articles"
              onClick={(e) => handleNavClick(e, '#articles')}
              className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.articles}
            </a>

            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white rounded-full transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {t.contact}
            </a>
          </div>

          <div className="w-16 h-px bg-slate-100 my-1" />

          {/* Action Buttons (Premium Capsule layout) */}
          <div className="flex flex-col w-full max-w-[280px] gap-2.5">
            <a
              href="#book"
              onClick={(e) => handleNavClick(e, '#book')}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#4c6cd0] hover:bg-[#314b9b] rounded-full text-center transition-all duration-300 shadow-md shadow-[#4c6cd0]/10 hover:shadow-[0_4px_12px_rgba(76,108,208,0.2)]"
            >
              {t.booking}
            </a>
            <button
              onClick={() => { onLangToggle(); setIsMenuOpen(false); }}
              className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-[#4c6cd0] hover:bg-white bg-slate-100/60 border border-slate-200/50 rounded-full transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.langBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
