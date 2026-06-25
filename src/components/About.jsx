import React from 'react';

export default function About({ lang }) {
  const t = {
    header: lang === 'en' ? 'About Our Firm' : 'نبذة عن مكتبنا',
    p1: lang === 'en' 
      ? 'Sanad Consulting FZE is a premium advisory firm based in the UAE, dedicated to steering businesses through complex legal, corporate, and fiscal environments. Our primary mission is to establish solid foundations for local and international corporations to scale, comply, and thrive.'
      : 'سند للاستشارات هي مؤسسة استشارية رائدة مقرها دولة الإمارات العربية المتحدة، مكرسة لتوجيه الشركات عبر البيئات القانونية والمؤسسية والمالية المعقدة. مهمتنا الأساسية هي وضع أسس متينة للشركات المحلية والدولية للتوسع والامتثال والازدهار.',
    p2: lang === 'en'
      ? 'With a team of seasoned legal experts and certified tax practitioners, we provide bespoke, clear, and actionable advisory that bridges the gap between regulatory hurdles and commercial success.'
      : 'مع فريق من الخبراء القانونيين والممارسين الضريبيين المعتمدين، نقدم استشارات مخصصة وواضحة وقابلة للتطبيق لسد الفجوة بين العقبات التنظيمية والنجاح التجاري.',
    f1Title: lang === 'en' ? 'Bilingual Legal Advisory' : 'استشارات قانونية ثنائية اللغة',
    f1Desc: lang === 'en' 
      ? 'Complete service delivery in Arabic and English, tailored to UAE jurisdiction.' 
      : 'تقديم خدمات متكاملة باللغتين العربية والإنجليزية، مصممة خصيصاً للقوانين الإماراتية.',
    f2Title: lang === 'en' ? 'Tax & Regulatory Compliance' : 'الامتثال الضريبي والتنظيمي',
    f2Desc: lang === 'en'
      ? 'Mitigate corporate tax risks and optimize financial operations.'
      : 'الحد من مخاطر ضرائب الشركات وتحسين العمليات المالية.'
  };

  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="section-header reveal-on-scroll visible">
          <h2>{t.header}</h2>
          <div className="line"></div>
        </div>
        <div className="about-grid">
          <div className="about-content reveal-on-scroll visible">
            <div className="about-text">
              <p>{t.p1}</p>
              <p>{t.p2}</p>
            </div>
            <div className="about-features">
              <div className="feature-item">
                <span className="feature-icon">💼</span>
                <div>
                  <h4>{t.f1Title}</h4>
                  <p>{t.f1Desc}</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <div>
                  <h4>{t.f2Title}</h4>
                  <p>{t.f2Desc}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-image-container reveal-on-scroll reveal-stagger-1 visible">
            <img src="/sanad_about_office.png" alt="Sanad Consulting Advisory Office" className="about-image" />
          </div>
        </div>
      </div>
    </section>
  );
}
