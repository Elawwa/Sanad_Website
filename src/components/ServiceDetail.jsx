import React from 'react';
import { motion } from 'framer-motion';
import { Search, Scale, ListChecks, Target, ArrowLeft, ArrowRight } from 'lucide-react';

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function ServiceDetail({ serviceId, lang, onGoToHome, onServiceClick }) {
  const servicesData = {
    setup: {
      titleEn: 'Corporate Setup & Licensing',
      titleAr: 'تأسيس الشركات والتراخيص',
      descEn: 'Structuring, licensing, and establishment of businesses in UAE free zones, mainland, and offshore.',
      descAr: 'هيكلة وترخيص وتأسيس الشركات في المناطق الحرة والبر الرئيسي والمناطق الخارجية بدولة الإمارات.',
      subEn: 'End-to-end company formation — lowest cost, highest compliance.',
      subAr: 'تأسيس متكامل للشركات — بأقل تكلفة وأعلى امتثال.',
      whatIsEn: 'Complete corporate formation services covering documentation, trade license acquisition, and residency setups.',
      whatIsAr: 'خدمات تأسيس الشركات المتكاملة التي تشمل صياغة المستندات، واستخراج الرخص التجارية، وتأشيرات الإقامة.',
      roleEn: 'Proper structuring protects shareholder liability, secures corporate tax exemptions, and ensures long-term operational legality.',
      roleAr: 'تضمن الهيكلة السليمة حماية مسؤولية المساهمين، والاستفادة من الإعفاءات الضريبية المتاحة، وسلامة التراخيص القانونية.',
      whatWeDoEn: [
        'Select company type and jurisdiction (Mainland vs Free Zone)',
        'Draft Memorandum of Association (MOA) and corporate bylaws',
        'Submit licensing applications and obtain trade name approvals',
        'Coordinate visa setups and government approvals'
      ],
      whatWeDoAr: [
        'تحديد نوع الشركة والولاية القضائية (بر رئيسي أم منطقة حرة)',
        'صياغة عقد التأسيس (MOA) والأنظمة الأساسية للشركة',
        'تقديم طلبات الترخيص والحصول على موافقة الاسم التجاري',
        'تنسيق تأشيرات الإقامة والموافقات الحكومية'
      ],
      outcomeEn: [
        'Active UAE Trade License',
        'Valid establishment card and registration certificate',
        'Protected shareholder rights with clear bylaws',
        'Corporate structure ready for bank account opening'
      ],
      outcomeAr: [
        'رخصة تجارية نشطة وصالحة في دولة الإمارات',
        'بطاقة منشأة سارية وشهادة تسجيل رسمية',
        'حقوق مساهمين محمية بموجب أنظمة تأسيس واضحة',
        'هيكل مؤهل ومستعد لفتح حساب مصرفي للشركة'
      ]
    },
    tax: {
      titleEn: 'Tax & VAT Advisory',
      titleAr: 'الاستشارات الضريبية وضريبة القيمة المضافة',
      descEn: 'Optimize your corporate tax exposure and maintain flawless VAT filings under UAE laws.',
      descAr: 'تحسين وضعك الضريبي والامتثال الكامل لإقرارات ضريبة القيمة المضافة بموجب قوانين دولة الإمارات.',
      subEn: 'End-to-end VAT and corporate tax — lowest cost, highest compliance.',
      subAr: 'حلول ضريبية متكاملة لضريبة الشركات والقيمة المضافة — بأقل تكلفة وأعلى امتثال.',
      whatIsEn: 'Strategic tax planning, registration, VAT return preparation, and ongoing compliance support.',
      whatIsAr: 'التخطيط الضريبي الاستراتيجي، والتسجيل، وإعداد إقرارات ضريبة القيمة المضافة، ودعم الامتثال المستمر.',
      roleEn: 'Violating UAE Corporate Tax or VAT regulations results in heavy fines. Proper compliance saves costs and builds reputational trust.',
      roleAr: 'تؤدي مخالفة لوائح ضريبة الشركات أو القيمة المضافة إلى غرامات باهظة. الامتثال الصحيح يوفر التكاليف ويبني الثقة.',
      whatWeDoEn: [
        'Register company for Corporate Tax & VAT with the FTA',
        'Prepare and review quarterly VAT returns before filing',
        'Analyze corporate tax applicability and exemptions',
        'Professional representation before the Federal Tax Authority (FTA)'
      ],
      whatWeDoAr: [
        'التسجيل لضريبة الشركات وضريبة القيمة المضافة لدى الهيئة الاتحادية للضرائب',
        'إعداد ومراجعة إقرارات ضريبة القيمة المضافة ربع السنوية قبل التقديم',
        'تحليل خضوع الشركات للضريبة والإعفاءات المتاحة',
        'التمثيل القانوني والمهني أمام الهيئة الاتحادية للضرائب'
      ],
      outcomeEn: [
        'Flawless tax compliance with federal legislation',
        'Zero administrative penalties or violation markers',
        'Maximum legitimate tax savings through optimization',
        'Accurate quarterly VAT returns filed securely'
      ],
      outcomeAr: [
        'امتثال ضريبي مثالي مع القوانين الاتحادية',
        'تفادي الغرامات الإدارية تماماً وحماية سجل الشركة',
        'أقصى توفير ضريبي قانوني من خلال التخطيط الأمثل',
        'تقديم إقرارات ضريبة القيمة المضافة الربع سنوية بدقة وأمان'
      ]
    },
    legal: {
      titleEn: 'Legal Drafting & Contracts',
      titleAr: 'الصياغة القانونية والعقود',
      descEn: 'Custom bilingual contracts that protect your business relationships and corporate interests.',
      descAr: 'عقود وصياغة قانونية مخصصة ثنائية اللغة تحمي علاقاتك التجارية ومصالح شركتك.',
      subEn: 'Watertight corporate contracts — lowest cost, highest protection.',
      subAr: 'صياغة عقود محكمة — حماية قانونية كاملة وبأفضل التكاليف.',
      whatIsEn: 'Professional drafting and review of all commercial, employment, and shareholder agreements in English and Arabic.',
      whatIsAr: 'صياغة ومراجعة مهنية لجميع الاتفاقيات التجارية وعقود العمل والشركاء باللغتين العربية والإنجليزية.',
      roleEn: 'Vague agreements lead to disputes. Watertight legal drafting minimizes commercial litigation risks and solidifies rights.',
      roleAr: 'تؤدي العقود غير الواضحة إلى النزاعات. تقلل الصياغة القانونية المحكمة من مخاطر التقاضي وتضمن الحقوق.',
      whatWeDoEn: [
        'Draft Memorandum & Articles of Association (MOA / AOA)',
        'Review commercial lease, vendor, and distribution contracts',
        'Bilingual legal translation and notarization support',
        'Draft employee contracts, NDAs, and confidentiality agreements'
      ],
      whatWeDoAr: [
        'صياغة عقد التأسيس والنظام الأساسي للشركة (MOA / AOA)',
        'مراجعة عقود الإيجار التجارية، وعقود الموردين والتوزيع',
        'الترجمة القانونية ثنائية اللغة ودعم التوثيق الرسمي',
        'صياغة عقود العمل، اتفاقيات عدم الإفصاح وسرية المعلومات'
      ],
      outcomeEn: [
        'Legally binding bilingual agreements tailored to UAE courts',
        'Protected intellectual property and capital contributions',
        'Clear exit clauses and dispute resolution mechanisms',
        'Minimized litigation exposure and transaction risks'
      ],
      outcomeAr: [
        'عقود ثنائية اللغة ملزمة قانوناً ومصممة للمحاكم الإماراتية',
        'حماية رأس المال المساهم والملكية الفكرية',
        'بنود خروج وتسوية منازعات واضحة ومحكمة',
        'تقليل مخاطر المعاملات التجارية والتقاضي تماماً'
      ]
    },
    trainings: {
      titleEn: 'Trainings & Consultancies',
      titleAr: 'التدريب والاستشارات',
      descEn: 'Premium corporate training programs on UAE compliance, AML regulations, and director duties.',
      descAr: 'برامج تدريبية متميزة للمؤسسات حول الامتثال في دولة الإمارات، لوائح مكافحة غسيل الأموال، وواجبات أعضاء مجلس الإدارة.',
      subEn: 'Empower corporate boardrooms — compliance capability building.',
      subAr: 'تمكين مجالس الإدارات — بناء القدرات والامتثال المؤسسي.',
      whatIsEn: 'Bespoke executive training programs on Anti-Money Laundering (AML), economic substance regulations, and corporate governance.',
      whatIsAr: 'برامج تدريبية مخصصة للمدراء التنفيذيين حول مكافحة غسيل الأموال (AML) وقواعد الأنشطة الاقتصادية الفعلية وحوكمة الشركات.',
      roleEn: 'Regulatory compliance is dynamic. Continuous training protects directors from personal liability and ensures active governance.',
      roleAr: 'الامتثال التنظيمي عملية مستمرة. يحمي التدريب المستمر أعضاء مجلس الإدارة من المسؤولية الشخصية ويضمن الإدارة الفعالة.',
      whatWeDoEn: [
        'Develop custom AML training manuals and compliance policies',
        'Train compliance officers on regulatory reporting (goAML)',
        'Conduct workshops on director duties & corporate governance liability',
        'Provide consulting on corporate restructuring and optimization'
      ],
      whatWeDoAr: [
        'تطوير أدلة تدريبية مخصصة لمكافحة غسيل الأموال وسياسات الامتثال',
        'تدريب مسؤولي الامتثال على تقديم التقارير التنظيمية (goAML)',
        'تقديم ورش عمل حول واجبات مجلس الإدارة ومسؤوليات الحوكمة',
        'تقديم استشارات متخصصة حول إعادة هيكلة الشركات وتحسين الأداء'
      ],
      outcomeEn: [
        'Fully trained and certified compliance operations team',
        'Audit-ready regulatory compliance protocols established',
        'Protected corporate leadership from compliance risks',
        'Active governance framework implementation'
      ],
      outcomeAr: [
        'فريق عمل مدرب ومؤهل لإدارة عمليات الامتثال بالكامل',
        'تأسيس بروتوكولات امتثال تنظيمية جاهزة لعمليات التدقيق',
        'حماية القيادة التنفيذية ومجلس الإدارة من مخاطر الامتثال',
        'تطبيق إطار حوكمة نشط وفعال داخل المؤسسة'
      ]
    }
  };

  const data = servicesData[serviceId] || servicesData.setup;

  const handleBookConsultation = () => {
    onGoToHome();
    setTimeout(() => {
      const target = document.getElementById('book');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleContactUs = () => {
    onGoToHome();
    setTimeout(() => {
      const target = document.getElementById('contact');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const otherServices = Object.keys(servicesData).filter(id => id !== serviceId);

  return (
    <div className="bg-[#faf8f4] min-h-screen pt-[72px] font-sans text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e2e6b] to-[#4c6cd0] text-white py-16 px-6 select-none">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#ffc57e] uppercase mb-3 block">
            {lang === 'en' ? 'SERVICE PROFILE' : 'ملف الخدمة'}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
            {lang === 'en' ? data.titleEn : data.titleAr}
          </h1>
          <p className="text-base md:text-lg text-slate-300 font-light mb-6 leading-relaxed">
            {lang === 'en' ? data.subEn : data.subAr}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={handleBookConsultation}
              className="px-6 py-2.5 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-xs font-bold transition-all shadow-md shadow-[#4c6cd0]/10"
            >
              {lang === 'en' ? 'Free Consultation' : 'استشارة مجانية'}
            </button>
            <button
              onClick={handleContactUs}
              className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition-all"
            >
              {lang === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Breadcrumbs ── */}
      <div className="border-b border-slate-200/50 bg-white py-3 px-6 text-xs text-slate-400 select-none">
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 font-medium">
          <a href="#home" onClick={(e) => { e.preventDefault(); onGoToHome(); }} className="hover:text-[#4c6cd0] transition-colors">
            {lang === 'en' ? 'Home' : 'الرئيسية'}
          </a>
          <span>/</span>
          <span>{lang === 'en' ? 'Services' : 'خدماتنا'}</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{lang === 'en' ? data.titleEn : data.titleAr}</span>
        </div>
      </div>

      {/* ── Service Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* What is it? */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/40 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <Search className="w-5 h-5 text-[#ffc57e] shrink-0" />
              <h2 className="text-base font-bold text-slate-800 border-l-4 border-[#ffc57e] pl-2 rtl:border-l-0 rtl:border-r-4 rtl:pr-2 rtl:pl-0">
                {lang === 'en' ? 'What is it?' : 'ما هي هذه الخدمة؟'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'en' ? data.whatIsEn : data.whatIsAr}
            </p>
          </div>

          {/* Importance & Role */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/40 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <Scale className="w-5 h-5 text-[#ffc57e] shrink-0" />
              <h2 className="text-base font-bold text-slate-800 border-l-4 border-[#ffc57e] pl-2 rtl:border-l-0 rtl:border-r-4 rtl:pr-2 rtl:pl-0">
                {lang === 'en' ? 'Importance & Role' : 'أهميتها ودورها'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'en' ? data.roleEn : data.roleAr}
            </p>
          </div>
        </div>

        {/* What We Do & Outcome Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* What We Do List */}
          <div>
            <h2 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-[#4c6cd0] shrink-0" />
              <span>{lang === 'en' ? 'What We Do' : 'ماذا نقدم'}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {(lang === 'en' ? data.whatWeDoEn : data.whatWeDoAr).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-xs">
                  <CheckIcon className="text-[#4c6cd0] w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Your Outcome List */}
          <div>
            <h2 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#ffc57e] shrink-0" />
              <span>{lang === 'en' ? 'Your Outcome' : 'النتائج المحققة'}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {(lang === 'en' ? data.outcomeEn : data.outcomeAr).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-xs">
                  <CheckIcon className="text-[#ffc57e] w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Ready to Help Card ── */}
        <div className="bg-[#1e293b] text-white rounded-2xl p-8 mb-12 text-center relative overflow-hidden shadow-lg select-none">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-tr from-[#ffc57e]/10 to-[#4c6cd0]/10 blur-xl opacity-75 pointer-events-none" />
          <h2 className="text-2xl font-serif mb-2">
            {lang === 'en' ? 'Ready to Help' : 'مستعدون للمساعدة'}
          </h2>
          <p className="text-xs text-slate-300 font-light mb-6 max-w-xl mx-auto leading-relaxed">
            {lang === 'en' 
              ? `Talk to the SANAD team and get your consultation on ${data.titleEn}.` 
              : `تحدث مع فريق سند واحصل على استشارتك المخصصة في ${data.titleAr}.`}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleBookConsultation}
              className="px-6 py-2.5 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-xs font-bold transition-all shadow-md shadow-[#4c6cd0]/10"
            >
              {lang === 'en' ? 'Book Consultation' : 'احجز استشارة الآن'}
            </button>
            <button
              onClick={handleContactUs}
              className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition-all"
            >
              {lang === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </button>
          </div>
        </div>

        {/* ── Related Services ── */}
        <div>
          <h3 className="text-sm font-extrabold tracking-wider text-slate-400 uppercase mb-4">
            {lang === 'en' ? 'Related Services' : 'خدمات ذات صلة'}
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {otherServices.map(id => {
              const rel = servicesData[id];
              return (
                <button
                  key={id}
                  onClick={() => onServiceClick(id)}
                  className="px-4 py-2 bg-white hover:bg-[#4c6cd0]/10 text-slate-600 hover:text-[#4c6cd0] border border-slate-200/50 hover:border-[#4c6cd0]/20 rounded-full text-xs font-bold transition-all duration-300 shadow-sm"
                >
                  {lang === 'en' ? rel.titleEn : rel.titleAr}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
