import React, { useState } from 'react';

export default function Contact({ lang, siteSettings, onContactSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header reveal-on-scroll visible">
          <h2>{t.header}</h2>
          <div className="line"></div>
        </div>
        <div className="contact-grid">
          <div className="contact-card reveal-on-scroll visible">
            <span className="contact-icon">📍</span>
            <h4>{t.addrTitle}</h4>
            <p>{displayAddress}</p>
          </div>
          <div className="contact-card reveal-on-scroll reveal-stagger-1 visible">
            <span className="contact-icon">📞</span>
            <h4>{t.phoneTitle}</h4>
            <p>{siteSettings.phone}</p>
            <p>{siteSettings.email}</p>
          </div>
          <div className="contact-card reveal-on-scroll reveal-stagger-2 visible">
            <span className="contact-icon">🕒</span>
            <h4>{t.hoursTitle}</h4>
            {displayHours.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>

        <div className="contact-form-container reveal-on-scroll visible">
          <h3>{t.formTitle}</h3>
          <form id="contact-form" onSubmit={handleSubmit}>
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
                <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="message">{t.formMsg}</label>
              <textarea id="message" rows="5" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="btn-primary">{t.formSubmit}</button>
          </form>
          {success && <p className="success-text">{t.successMsg}</p>}
        </div>
      </div>
    </section>
  );
}
