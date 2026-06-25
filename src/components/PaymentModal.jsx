import React, { useState, useEffect } from 'react';

export default function PaymentModal({ tempBookingData, lang, onClose, onPaymentSuccess }) {
  const [step, setStep] = useState('loading'); // 'loading', 'success'
  const [refCode, setRefCode] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const code = 'SND-' + Math.floor(1000 + Math.random() * 9000);
      setRefCode(code);
      setStep('success');
      onPaymentSuccess(code);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const t = {
    header: lang === 'en' ? 'Booking Confirmation' : 'تأكيد الحجز',
    loadingTitle: lang === 'en' ? 'Confirming Your Booking...' : 'جاري تأكيد الحجز...',
    loadingSub: lang === 'en' ? 'Do not close this window or refresh the page' : 'لا تغلق هذه النافذة أو تقم بتحديث الصفحة',
    successTitle: lang === 'en' ? 'Booking Confirmed' : 'تم تأكيد الحجز',
    successMsg: lang === 'en' ? 'Thank you! Your consultation has been booked successfully.' : 'شكرًا لك! تم حجز استشارتك بنجاح.',
    refLabel: lang === 'en' ? 'Reference:' : 'الرمز المرجعي:',
    doneBtn: lang === 'en' ? 'Done' : 'تم'
  };

  return (
    <div id="payment-modal-overlay" className="modal-overlay">
      <div className="modal-container">
        {step !== 'loading' && (
          <button className="close-btn" onClick={onClose} id="close-payment-modal">&times;</button>
        )}

        {step === 'loading' && (
          <div id="payment-loading" className="payment-loading" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ fontWeight: 600, fontSize: '1.2rem', color: '#1e293b', marginTop: '1.5rem' }}>{t.loadingTitle}</p>
            <p className="subtext" style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>{t.loadingSub}</p>
          </div>
        )}

        {step === 'success' && (
          <div id="payment-success" className="payment-success" style={{ textAlign: 'center' }}>
            <div className="success-icon" style={{ background: '#dcfce7', color: '#16a34a', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1.5rem' }}>✓</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{t.successTitle}</h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{t.successMsg}</p>
            <div className="booking-receipt" style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'inline-block', minWidth: '200px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>
                <strong>{t.refLabel}</strong> <span id="receipt-ref" style={{ color: '#4c6cd0', fontWeight: 700 }}>{refCode}</span>
              </p>
            </div>
            <div>
              <button className="btn-primary" onClick={onClose} id="btn-success-close" style={{ width: '100%' }}>{t.doneBtn}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
