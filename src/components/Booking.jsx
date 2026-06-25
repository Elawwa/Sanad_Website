import React, { useState } from 'react';

export default function Booking({ lang, onBookingSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    brief: '',
    type: 'in-person'
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBookingSubmit({ ...formData });
  };

  const t = {
    header: lang === 'en' ? 'Schedule Your Consultation' : 'حدد موعد استشارتك',
    name: lang === 'en' ? 'Full Name' : 'الاسم الكامل',
    phone: lang === 'en' ? 'Phone Number' : 'رقم الهاتف',
    email: lang === 'en' ? 'Email Address' : 'البريد الإلكتروني',
    brief: lang === 'en' ? 'Consultation Brief' : 'نبذة عن الاستشارة',
    type: lang === 'en' ? 'Consultation Type' : 'نوع الاستشارة',
    optionInPerson: lang === 'en' ? 'In-Person (Sharjah Office)' : 'حضورياً (مكتب الشارقة)',
    optionOnline: lang === 'en' ? 'Online Meeting' : 'اجتماع عبر الإنترنت',
    optionText: lang === 'en' ? 'Written/Text Advisory' : 'استشارة مكتوبة',
    submitBtn: lang === 'en' ? 'Book Consultation' : 'احجز الاستشارة'
  };

  return (
    <section id="book" className="booking-section">
      <div className="container">
        <div className="section-header reveal-on-scroll visible">
          <h2>{t.header}</h2>
          <div className="line"></div>
        </div>
        <div className="form-container reveal-on-scroll visible">
          <form id="booking-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">{t.name}</label>
              <input type="text" id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="phone">{t.phone}</label>
              <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required />
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
        </div>
      </div>
    </section>
  );
}
