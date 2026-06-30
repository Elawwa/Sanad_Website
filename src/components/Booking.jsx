import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PhoneInput from './PhoneInput';

export default function Booking({ lang, onBookingSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    brief: '',
    type: 'in-person'
  });

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
      onBookingSubmit({ ...formData, isSpam: true });
      return;
    }
    onBookingSubmit({ ...formData });
  };

  const t = {
    header: lang === 'en' ? 'Schedule Your Consultation' : 'حدد موعد استشارتك',
    name: lang === 'en' ? 'Full Name' : 'الاسم الكامل',
    phone: lang === 'en' ? 'Phone Number' : 'رقم الهاتف',
    email: lang === 'en' ? 'Email Address' : 'البريد الإلكتروني',
    brief: lang === 'en' ? 'Consultation Brief' : 'نبذة عن الاستشارة',
    type: lang === 'en' ? 'Consultation Type' : 'نوع الاستشارة',
    optionInPerson: lang === 'en' ? 'In-Person' : 'حضورياً',
    optionOnline: lang === 'en' ? 'Online Meeting' : 'اجتماع عبر الإنترنت',
    optionText: lang === 'en' ? 'Written/Text Advisory' : 'استشارة مكتوبة',
    submitBtn: lang === 'en' ? 'Book Consultation' : 'احجز الاستشارة'
  };

  return (
    <section id="book" className="booking-section">
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
          className="form-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <form id="booking-form" onSubmit={handleSubmit}>
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

            <div className="input-group">
              <label htmlFor="name">{t.name}</label>
              <input type="text" id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="phone">{t.phone}</label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                required
                lang={lang}
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">{t.email}</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="brief">{t.brief}</label>
              <textarea id="brief" rows="4" value={formData.brief} onChange={handleChange} required></textarea>
            </div>
            <div className="input-group">
              <label htmlFor="type">{t.type}</label>
              <select id="type" value={formData.type} onChange={handleChange} required>
                <option value="in-person">{t.optionInPerson}</option>
                <option value="online">{t.optionOnline}</option>
                <option value="text">{t.optionText}</option>
              </select>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn-primary w-100">{t.submitBtn}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
