import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function PortalLoginModal({ targetPortal, lang, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  const checkRateLimit = () => {
    const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
    const now = Date.now();
    // Keep only attempts within the last 15 minutes
    const recentAttempts = attempts.filter(time => now - time < LOCKOUT_DURATION);
    
    if (recentAttempts.length !== attempts.length) {
      localStorage.setItem('auth_attempts', JSON.stringify(recentAttempts));
    }

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = recentAttempts[0];
      const timeRemaining = LOCKOUT_DURATION - (now - oldestAttempt);
      setIsLockedOut(true);
      setLockoutTimeRemaining(timeRemaining);
      return false;
    }
    setIsLockedOut(false);
    return true;
  };

  useEffect(() => {
    checkRateLimit();
    let interval;
    if (isLockedOut) {
      interval = setInterval(() => {
        checkRateLimit();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkRateLimit()) return;
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get ID token to pass as token
      const token = await user.getIdToken();

      // Pass token and user details to parent
      onLoginSuccess(token, { username: user.email, role: 'admin' });
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      
      const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
      attempts.push(Date.now());
      localStorage.setItem('auth_attempts', JSON.stringify(attempts));
      checkRateLimit();

      setError(lang === 'en' ? 'Invalid email or password' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  const t = {
    adminTitle: lang === 'en' ? 'Admin Portal Verification' : 'التحقق من بوابة الإدارة',
    adminDesc: lang === 'en' ? 'Access restricted to system administrators' : 'الدخول مقتصر على مدراء النظام',
    defaultTitle: lang === 'en' ? 'Portal Verification' : 'التحقق من الدخول',
    defaultDesc: lang === 'en' ? 'Please verify your identity to continue' : 'الرجاء التحقق من هويتك للمتابعة',
    emailLabel: lang === 'en' ? 'Email Address' : 'البريد الإلكتروني',
    pwdLabel: lang === 'en' ? 'Access Password' : 'كلمة مرور الدخول',
    submitBtn: lang === 'en' ? 'Verify and Access' : 'التحقق والدخول',
  };

  const title = targetPortal === 'admin' ? t.adminTitle : t.defaultTitle;
  const desc = targetPortal === 'admin' ? t.adminDesc : t.defaultDesc;

  return (
    <div id="portal-login-overlay" className="modal-overlay">
      <div className="modal-container admin-login-card">
        <button className="close-btn" onClick={onClose} id="close-login-modal">&times;</button>
        <div className="modal-header">
          <span className="admin-icon"><KeyRound className="w-12 h-12 text-[#4c6cd0] mx-auto" /></span>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="portal-email">{t.emailLabel}</label>
            <input
              type="email"
              id="portal-email"
              placeholder={lang === 'en' ? 'Enter email' : 'أدخل البريد الإلكتروني'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={isLockedOut}
            />
          </div>
          <div className="input-group">
            <label htmlFor="portal-password">{t.pwdLabel}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="portal-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLockedOut}
                style={{ 
                  paddingRight: lang === 'en' ? '2.5rem' : undefined,
                  paddingLeft: lang === 'ar' ? '2.5rem' : undefined
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: 'absolute',
                  right: lang === 'en' ? '0.75rem' : 'auto',
                  left: lang === 'ar' ? '0.75rem' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {isLockedOut ? (
            <p className="error-msg" style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
              {lang === 'en' 
                ? `Too many attempts. Please try again in ${Math.ceil(lockoutTimeRemaining / 60000)} minutes.`
                : `تم تجاوز الحد المسموح من المحاولات. الرجاء المحاولة بعد ${Math.ceil(lockoutTimeRemaining / 60000)} دقيقة.`}
            </p>
          ) : (
            error && <p className="error-msg" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>
          )}

          <button type="submit" className="btn-primary w-100" style={{ marginTop: '1.5rem' }} disabled={isLockedOut}>{t.submitBtn}</button>
        </form>
      </div>
    </div>
  );
}
