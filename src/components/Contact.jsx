import React, { useState } from 'react';
import { MapPin, PhoneCall, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import PhoneInput from './PhoneInput';

export default function Contact({ lang, siteSettings, onContactSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (honeypot) {
      // Pass isSpam: true if the honeypot field is filled by a bot
      onContactSubmit({ ...formData, isSpam: true });
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSuccess(true);
      return;
    }
    onContactSubmit({ ...formData });
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const t = {
    header: lang === 'en' ? 'Contact Our Office' : 'اتصل بمكتبنا',
    addrTitle: lang === 'en' ? 'Sharjah Office' : 'مكتب الشارقة',
    phoneTitle: lang === 'en' ? 'Phone & Email' : 'الهاتف والبريد الإلكتروني',
    hoursTitle: lang === 'en' ? 'Business Hours' : 'ساعات العمل',
    formTitle: lang === 'en' ? 'Send Us a Message' : 'أرسل لنا رسالة',
    formName: lang === 'en' ? 'Your Name' : 'الاسم',
    formEmail: lang === 'en' ? 'Your Email' : 'البريد الإلكتروني',
    formPhone: lang === 'en' ? 'Your Phone' : 'رقم الهاتف',
    formMsg: lang === 'en' ? 'Message' : 'الرسالة',
    formSubmit: lang === 'en' ? 'Send Message' : 'إرسال الرسالة',
    successMsg: lang === 'en' ? 'Thank you! Your message has been sent successfully.' : 'نشكرك! تم إرسال رسالتك بنجاح.'
  };

  const displayHours = lang === 'en' ? siteSettings.hoursEn : siteSettings.hoursAr;
  const displayAddress = lang === 'en' ? siteSettings.addressEn : siteSettings.addressAr;
  const whatsappLink = siteSettings.whatsapp 
    ? (siteSettings.whatsapp.startsWith('http') 
        ? siteSettings.whatsapp 
        : `https://wa.me/${siteSettings.whatsapp.replace(/\D/g, '')}`)
    : '';

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section id="contact" className="contact-section">
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
          className="contact-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="contact-card" variants={cardVariants}>
            <span className="contact-icon"><MapPin className="w-8 h-8 text-[#ffc57e] mx-auto" /></span>
            <h4>{t.addrTitle}</h4>
            <p>{displayAddress}</p>
          </motion.div>
          
          <motion.div className="contact-card flex flex-col justify-between" variants={cardVariants}>
            <div>
              <span className="contact-icon"><PhoneCall className="w-8 h-8 text-[#ffc57e] mx-auto" /></span>
              <h4>{t.phoneTitle}</h4>
              <p><span dir="ltr">{siteSettings.phone}</span></p>
              <p>{siteSettings.email}</p>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-white/5">
              {siteSettings.linkedin && (
                <a href={siteSettings.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#ffc57e] transition-colors" title="LinkedIn">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
              {siteSettings.email && (
                <a href={`mailto:${siteSettings.email}`} className="text-slate-400 hover:text-[#ffc57e] transition-colors" title="Email">
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {siteSettings.youtube && (
                <a href={siteSettings.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#ffc57e] transition-colors" title="YouTube">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163c-.272-.98-1.04-1.748-2.02-2.02C19.82 3.7 12 3.7 12 3.7s-7.82 0-9.48.443c-.98.272-1.748 1.04-2.02 2.02C0 7.83 0 12 0 12s0 4.17.5 5.837c.272.98 1.04 1.748 2.02 2.02C4.18 20.3 12 20.3 12 20.3s7.82 0 9.48-.443c.98-.272 1.748-1.04 2.02-2.02C24 16.17 24 12 24 12s0-4.17-.5-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {siteSettings.instagram && (
                <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#ffc57e] transition-colors" title="Instagram">
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}
              {siteSettings.whatsapp && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#ffc57e] transition-colors" title="WhatsApp">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.446L0 24zm6.59-4.846c1.6.95 3.498 1.45 5.419 1.451 5.428 0 9.845-4.42 9.849-9.852.002-2.63-1.02-5.102-2.871-6.958C17.19 1.989 14.718.963 12.01.963c-5.437 0-9.857 4.42-9.86 9.854a9.814 9.814 0 0 0 1.5 5.05l-.991 3.616 3.702-.97a9.782 9.782 0 0 0 4.696 1.189zm8.95-6.84c-.244-.122-1.445-.713-1.668-.795-.223-.082-.385-.122-.548.122-.162.244-.63.795-.772.957-.142.163-.284.183-.528.06-.244-.12-1.03-.38-1.962-1.212-.724-.646-1.213-1.443-1.355-1.687-.142-.244-.015-.376.107-.497.11-.11.244-.285.366-.427.122-.142.163-.244.244-.407.082-.163.04-.306-.02-.427-.06-.122-.548-1.32-.75-1.81-.197-.474-.396-.41-.548-.417-.142-.007-.305-.007-.468-.007a.899.899 0 0 0-.65.305c-.223.244-.853.834-.853 2.031 0 1.197.87 2.353.99 2.516.122.163 1.713 2.616 4.15 3.668.58.25 1.033.4 1.385.512.582.185 1.112.159 1.53.097.466-.069 1.445-.59 1.648-1.16.203-.572.203-1.06.142-1.16-.06-.1-.223-.163-.467-.285z"/>
                  </svg>
                </a>
              )}
            </div>
          </motion.div>
          
          <motion.div className="contact-card" variants={cardVariants}>
            <span className="contact-icon"><Clock className="w-8 h-8 text-[#ffc57e] mx-auto" /></span>
            <h4>{t.hoursTitle}</h4>
            {displayHours.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
          className="contact-form-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3>{t.formTitle}</h3>
          <form id="contact-form" onSubmit={handleSubmit}>
            {/* Anti-spam Honeypot field */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="website_hp">Do not fill this field</label>
              <input
                type="text"
                id="website_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex="-1"
                autoComplete="off"
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="name">{t.formName}</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="email">{t.formEmail}</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="phone">{t.formPhone}</label>
                <PhoneInput
                  id="phone"
                  value={formData.phone}
                  onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                  required
                  lang={lang}
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="message">{t.formMsg}</label>
              <textarea id="message" rows="5" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="btn-primary">{t.formSubmit}</button>
          </form>
          {success && <p className="success-text">{t.successMsg}</p>}
        </motion.div>
      </div>
    </section>
  );
}
