import React from 'react';
import { Building2, Scale, FileText, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Services({ lang, onServiceClick }) {
  const t = {
    header: lang === 'en' ? 'Services' : 'خدماتنا'
  };

  const services = [
    {
      id: 'setup',
      icon: <Building2 className="w-10 h-10 text-[#4c6cd0]" />,
      titleEn: 'Corporate Setup & Licensing',
      titleAr: 'تأسيس الشركات والتراخيص',
      descEn: 'Structuring, licensing, and establishment of businesses in UAE free zones, mainland, and offshore.',
      descAr: 'هيكلة وترخيص وتأسيس الشركات في المناطق الحرة والبر الرئيسي والمناطق الخارجية بدولة الإمارات.'
    },
    {
      id: 'tax',
      icon: <Scale className="w-10 h-10 text-[#4c6cd0]" />,
      titleEn: 'Tax & VAT Advisory',
      titleAr: 'الاستشارات الضريبية وضريبة القيمة المضافة',
      descEn: 'Guidance on Corporate Tax registration, VAT filings, restructuring, and double taxation treaty benefits.',
      descAr: 'إرشادات بشأن التسجيل في ضريبة الشركات، وإقرارات ضريبة القيمة المضافة، وإعادة الهيكلة، واتفاقيات الازدواج الضريبي.'
    },
    {
      id: 'legal',
      icon: <FileText className="w-10 h-10 text-[#4c6cd0]" />,
      titleEn: 'Legal Drafting & Contracts',
      titleAr: 'الصياغة القانونية والعقود',
      descEn: 'Drafting and reviewing shareholder agreements, articles of association, employment contracts, and NDA agreements.',
      descAr: 'صياغة ومراجعة اتفاقيات المساهمين، والنظام الأساسي، وعقود العمل، واتفاقيات عدم الإفصاح.'
    },
    {
      id: 'trainings',
      icon: <GraduationCap className="w-10 h-10 text-[#4c6cd0]" />,
      titleEn: 'Trainings & Consultancies',
      titleAr: 'التدريب والاستشارات',
      descEn: 'Premium corporate training programs on UAE compliance, AML regulations, and director duties.',
      descAr: 'برامج تدريبية متميزة للمؤسسات حول الامتثال في دولة الإمارات، لوائح مكافحة غسيل الأموال، وواجبات أعضاء مجلس الإدارة.'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section id="services" className="services-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2>{t.header}</h2>
          <div className="line"></div>
        </motion.div>
        
        <motion.div 
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((s, idx) => (
            <motion.div 
              key={idx} 
              className="service-card cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-[#4c6cd0]/20"
              onClick={() => onServiceClick(s.id)}
              variants={cardVariants}
            >
              <div className="service-icon">{s.icon}</div>
              <h3>{lang === 'en' ? s.titleEn : s.titleAr}</h3>
              <p>{lang === 'en' ? s.descEn : s.descAr}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
