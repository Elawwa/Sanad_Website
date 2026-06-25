import React, { useState } from 'react';

export default function PortalLoginModal({ targetPortal, lang, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // PIN constraint check: Both Employee and Admin passwords must be "0000"
    if (password.trim() === '0000') {
      onLoginSuccess(targetPortal);
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const t = {
    adminTitle: lang === 'en' ? 'Admin Portal Verification' : 'التحقق من بوابة الإدارة',
    adminDesc: lang === 'en' ? 'Access restricted to system administrators' : 'الدخول مقتصر على مدراء النظام',
    defaultTitle: lang === 'en' ? 'Portal Verification' : 'التحقق من الدخول',
    defaultDesc: lang === 'en' ? 'Please verify your identity to continue' : 'الرجاء التحقق من هويتك للمتابعة',
    pwdLabel: lang === 'en' ? 'Access Password' : 'كلمة مرور الدخول',
    submitBtn: lang === 'en' ? 'Verify and Access' : 'التحقق والدخول',
    errorMsg: lang === 'en' ? 'Incorrect password. Access denied.' : 'كلمة المرور غير صحيحة. تم رفض الدخول.'
  };

  const title = targetPortal === 'admin' ? t.adminTitle : t.defaultTitle;
  const desc = targetPortal === 'admin' ? t.adminDesc : t.defaultDesc;

  return (
    <div id="portal-login-overlay" className="modal-overlay">
      <div className="modal-container admin-login-card">
        <button className="close-btn" onClick={onClose} id="close-login-modal">&times;</button>
        <div className="modal-header">
          <span className="admin-icon">🔑</span>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="portal-password">{t.pwdLabel}</label>
            <input
              type="password"
              id="portal-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <p className="error-msg">{t.errorMsg}</p>}
          <button type="submit" className="btn-primary w-100">{t.submitBtn}</button>
        </form>
      </div>
    </div>
  );
}
