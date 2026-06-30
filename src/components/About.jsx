import React from 'react';
import { Award, BookOpen, Scale, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About({ lang }) {
  const t = {
    header: lang === 'en' ? 'Meet the Founder' : 'تعرف على المؤسس',
    subtitle: lang === 'en'
      ? 'Founder & Managing Director of Sanad Consulting'
      : 'مؤسس ومدير عام سند للاستشارات',
    founderName: lang === 'en' ? 'Dr. Mohamed Elawwa' : 'د. محمد العوا',
    founderTitle: lang === 'en' ? 'Founder & Managing Director' : 'المؤسس والمدير التنفيذي',
    bio1: lang === 'en'
      ? 'Dr. Mohamed Elawwa is a highly accomplished legal consultant and corporate advisor with deep expertise in UAE commercial law, tax structuring, and regulatory compliance. With a distinguished academic background in law and decades of hands-on practitioner experience, Dr. Elawwa founded Sanad Consulting to provide businesses with the clarity and strategic guidance they need to operate with confidence in the UAE\'s dynamic legal environment.'
      : 'الدكتور محمد العوا مستشار قانوني ومستشار مؤسسي ذو كفاءة عالية، يتمتع بخبرة راسخة في قانون التجارة الإماراتي وهيكلة الضرائب والامتثال التنظيمي. وبحكم خلفيته الأكاديمية المتميزة في القانون وعقود من الخبرة العملية، أسس الدكتور العوا سند للاستشارات لتزويد الشركات بالوضوح والتوجيه الاستراتيجي اللازمَين لممارسة أعمالها بثقة في البيئة القانونية الديناميكية لدولة الإمارات.',
    bio2: lang === 'en'
      ? 'As the principal advisor at Sanad, Dr. Elawwa leads engagements across corporate governance, free zone and mainland entity structuring, VAT and corporate tax compliance, AML regulatory frameworks, and commercial contract drafting. He is known for his methodical approach, bilingual fluency in Arabic and English, and an unwavering commitment to client outcomes.'
      : 'بوصفه المستشار الرئيسي في سند، يقود الدكتور العوا الاشتراكات في مجالات حوكمة الشركات وتأسيس الكيانات في المناطق الحرة والبر الرئيسي، والامتثال لضريبة القيمة المضافة وضريبة الشركات، وأطر مكافحة غسيل الأموال، وصياغة العقود التجارية. ويُعرف بنهجه المنهجي، وإتقانه الكامل للغتين العربية والإنجليزية، والتزامه الثابت بتحقيق نتائج ملموسة لعملائه.',
    credentials: [
      {
        icon: <GraduationCap className="w-5 h-5" />,
        label: lang === 'en' ? 'Academic Excellence' : 'التميز الأكاديمي',
        value: lang === 'en' ? 'Doctorate in Law' : 'دكتوراه في القانون',
      },
      {
        icon: <Scale className="w-5 h-5" />,
        label: lang === 'en' ? 'Area of Practice' : 'مجال الممارسة',
        value: lang === 'en' ? 'UAE Corporate & Tax Law' : 'قانون الشركات والضرائب الإماراتي',
      },
      {
        icon: <BookOpen className="w-5 h-5" />,
        label: lang === 'en' ? 'Languages' : 'اللغات',
        value: lang === 'en' ? 'Arabic & English' : 'العربية والإنجليزية',
      },
      {
        icon: <Award className="w-5 h-5" />,
        label: lang === 'en' ? 'Based In' : 'يعمل من',
        value: lang === 'en' ? 'Sharjah, UAE' : 'الشارقة، الإمارات',
      },
    ],
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <section id="about" className="about-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <h2>{t.header}</h2>
          <div className="line"></div>
        </motion.div>

        <div className="about-grid">
          {/* LEFT: Photo */}
          <motion.div
            className="about-image-container"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src="/dr.awwa.png"
              alt="Dr. Mohamed Elawwa – Founder of Sanad Consulting"
              className="about-image"
            />
            {/* Founder name badge overlaid on bottom of photo */}
            <div className="founder-badge">
              <p className="founder-badge-name">{t.founderName}</p>
              <p className="founder-badge-title">{t.founderTitle}</p>
            </div>
          </motion.div>

          {/* RIGHT: Bio + Credentials */}
          <motion.div
            className="about-content"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {/* Subtitle tag */}
            <span className="founder-tag">{t.subtitle}</span>

            <div className="about-text">
              <p>{t.bio1}</p>
              <p>{t.bio2}</p>
            </div>

            {/* Credentials grid */}
            <div className="founder-credentials">
              {t.credentials.map((cred, i) => (
                <motion.div
                  key={i}
                  className="credential-card"
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <span className="credential-icon">{cred.icon}</span>
                  <div>
                    <p className="credential-label">{cred.label}</p>
                    <p className="credential-value">{cred.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
