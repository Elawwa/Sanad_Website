import React from 'react';

export default function Services({ lang, onServiceClick }) {
  const t = {
    header: lang === 'en' ? 'Services' : 'خدماتنا'
  };

  const services = [
    {
      id: 'setup',
      icon: '🏛️',
      titleEn: 'Corporate Setup & Licensing',
      titleAr: 'تأسيس الشركات والتراخيص',
      descEn: 'Structuring, licensing, and establishment of businesses in UAE free zones, mainland, and offshore.',
      descAr: 'هيكلة وترخيص وتأسيس الشركات في المناطق الحرة والبر الرئيسي والمناطق الخارجية بدولة الإمارات.'
    },
    {
      id: 'tax',
      icon: '📊',
      titleEn: 'Tax & VAT Advisory',
      titleAr: 'الاستشارات الضريبية وضريبة القيمة المضافة',
      descEn: 'Guidance on Corporate Tax registration, VAT filings, restructuring, and double taxation treaty benefits.',
      descAr: 'إرشادات بشأن التسجيل في ضريبة الشركات، وإقرارات ضريبة القيمة المضافة، وإعادة الهيكلة، واتفاقيات الازدواج الضريبي.'
    },
    {
      id: 'legal',
      icon: '📜',
      titleEn: 'Legal Drafting & Contracts',
      titleAr: 'الصياغة القانونية والعقود',
      descEn: 'Drafting and reviewing shareholder agreements, articles of association, employment contracts, and NDA agreements.',
      descAr: 'صياغة ومراجعة اتفاقيات المساهمين، والنظام الأساسي، وعقود العمل، واتفاقيات عدم الإفصاح.'
    },
    {
      id: 'trainings',
      icon: '🎓',
      titleEn: 'Trainings & Consultancies',
      titleAr: 'التدريب والاستشارات',
      descEn: 'Premium corporate training programs on UAE compliance, AML regulations, and director duties.',
      descAr: 'برامج تدريبية متميزة للمؤسسات حول الامتثال في دولة الإمارات، لوائح مكافحة غسيل الأموال، وواجبات أعضاء مجلس الإدارة.'
    }
  ];

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="section-header reveal-on-scroll visible">
          <h2>{t.header}</h2>
          <div className="line"></div>
        </div>
        <div className="services-grid">
          {services.map((s, idx) => (
            <div 
              key={idx} 
              className="service-card reveal-on-scroll visible cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-[#4c6cd0]/20"
              onClick={() => onServiceClick(s.id)}
            >
              <div className="service-icon">{s.icon}</div>
              <h3>{lang === 'en' ? s.titleEn : s.titleAr}</h3>
              <p>{lang === 'en' ? s.descEn : s.descAr}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
