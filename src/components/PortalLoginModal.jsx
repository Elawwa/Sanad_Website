import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck, Smartphone } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function PortalLoginModal({ targetPortal, lang, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials', 'phone_setup', 'otp'
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [tempUser, setTempUser] = useState(null);
  const [tempUserToken, setTempUserToken] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  const checkRateLimit = () => {
    const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
    const now = Date.now();
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

  // Clean up Recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const initRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Firebase ReCAPTCHA resolved successfully.');
          },
          'expired-callback': () => {
            setError(lang === 'en' ? 'ReCAPTCHA expired. Please try again.' : 'انتهت صلاحية كابتشا. يرجى المحاولة مرة أخرى.');
          }
        });
      } catch (err) {
        console.error('Error initializing RecaptchaVerifier:', err);
      }
    }
  };

  const handleSendSMS = async (phoneNumber, userInstance, idToken) => {
    try {
      initRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) throw new Error('Recaptcha initialization failed');

      const confirmResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmResult);
      setTempUser(userInstance);
      setTempUserToken(idToken);
      setStep('otp');
      setOtpSentMessage(lang === 'en'
        ? `A native security code has been sent via SMS to ${phoneNumber.slice(0, 4)}***${phoneNumber.slice(-3)}.`
        : `تم إرسال رمز الأمان عبر رسالة نصية قصيرة إلى ${phoneNumber.slice(0, 4)}***${phoneNumber.slice(-3)}.`
      );
    } catch (err) {
      console.error('Failed to send SMS OTP:', err);
      setError(lang === 'en' 
        ? 'Failed to send SMS. Ensure your phone number is correct and Firebase Phone Auth is enabled.' 
        : 'فشل إرسال الرسالة النصية. تأكد من صحة رقم الهاتف وتفعيل الخدمة.'
      );
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!checkRateLimit()) return;
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      if (targetPortal === 'admin') {
        // Fetch phone number from admin document in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;

        if (userData && userData.phone) {
          // Send SMS to registered phone
          await handleSendSMS(userData.phone, user, token);
        } else {
          // First-time Phone Setup
          setTempUser(user);
          setTempUserToken(token);
          setStep('phone_setup');
        }
      } else {
        onLoginSuccess(token, { username: user.email, role: 'user' });
      }
    } catch (err) {
      console.error(err);
      const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
      attempts.push(Date.now());
      localStorage.setItem('auth_attempts', JSON.stringify(attempts));
      checkRateLimit();
      setError(lang === 'en' ? 'Invalid email or password' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSetupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let formattedPhone = phoneInput.trim();
    if (!formattedPhone.startsWith('+')) {
      // Default to UAE country code if not specified
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+971' + formattedPhone.slice(1);
      } else {
        formattedPhone = '+971' + formattedPhone;
      }
    }

    try {
      if (!tempUser) throw new Error('Session expired');

      // Update Firestore user document with the phone number
      const userRef = doc(db, 'users', tempUser.uid);
      await updateDoc(userRef, { phone: formattedPhone });

      // Send SMS
      await handleSendSMS(formattedPhone, tempUser, tempUserToken);
    } catch (err) {
      console.error(err);
      setError(lang === 'en' ? 'Failed to save phone number. Try again.' : 'فشل حفظ رقم الهاتف. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!confirmationResult) throw new Error('Session expired');

      // Confirm native code with Firebase
      await confirmationResult.confirm(otpInput.trim());

      // Success! Log in
      onLoginSuccess(tempUserToken, { username: tempUser?.email, role: 'admin' });
      setEmail('');
      setPassword('');
      setOtpInput('');
      setStep('credentials');
    } catch (err) {
      console.error(err);
      setError(lang === 'en' ? 'Invalid or expired verification code.' : 'رمز التحقق غير صالح أو منتهي الصلاحية.');
    } finally {
      setIsLoading(false);
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
    phoneTitle: lang === 'en' ? 'Phone Setup' : 'إعداد الهاتف',
    phoneDesc: lang === 'en' ? 'Register your phone number to receive verification codes' : 'سجل رقم هاتفك لتلقي رموز التحقق',
    phoneLabel: lang === 'en' ? 'Phone Number (with country code)' : 'رقم الهاتف (مع رمز الدولة)',
    phonePlaceholder: lang === 'en' ? '+971 50 123 4567' : 'أدخل رقم الهاتف',
    phoneSubmitBtn: lang === 'en' ? 'Save and Send Code' : 'حفظ وإرسال الرمز',
    otpTitle: lang === 'en' ? 'SMS Verification Code' : 'رمز التحقق النصي',
    otpDesc: lang === 'en' ? 'Enter the 6-digit code sent to your mobile phone' : 'أدخل الرمز المكون من 6 أرقام المرسل إلى هاتفك المحمول',
    otpLabel: lang === 'en' ? 'Enter SMS Code' : 'أدخل رمز الرسالة النصية',
    otpSubmitBtn: lang === 'en' ? 'Confirm and Log In' : 'تأكيد وتسجيل الدخول',
    backBtn: lang === 'en' ? 'Back to Login' : 'العودة لتسجيل الدخول',
  };

  const title = step === 'otp' ? t.otpTitle : (step === 'phone_setup' ? t.phoneTitle : (targetPortal === 'admin' ? t.adminTitle : t.defaultTitle));
  const desc = step === 'otp' ? t.otpDesc : (step === 'phone_setup' ? t.phoneDesc : (targetPortal === 'admin' ? t.adminDesc : t.defaultDesc));

  return (
    <div id="portal-login-overlay" className="modal-overlay">
      {/* Invisible container required by Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="modal-container admin-login-card">
        <button className="close-btn" onClick={onClose} id="close-login-modal">&times;</button>
        <div className="modal-header">
          <span className="admin-icon">
            {step === 'otp' ? (
              <ShieldCheck className="w-12 h-12 text-[#ffc57e] mx-auto animate-pulse" />
            ) : step === 'phone_setup' ? (
              <Smartphone className="w-12 h-12 text-[#ffc57e] mx-auto" />
            ) : (
              <KeyRound className="w-12 h-12 text-[#4c6cd0] mx-auto" />
            )}
          </span>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>

        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit}>
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
                disabled={isLockedOut || isLoading}
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
                  disabled={isLockedOut || isLoading}
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

            <button type="submit" className="btn-primary w-100" style={{ marginTop: '1.5rem' }} disabled={isLockedOut || isLoading}>
              {isLoading ? (lang === 'en' ? 'Connecting...' : 'جاري الاتصال...') : t.submitBtn}
            </button>
          </form>
        )}

        {step === 'phone_setup' && (
          <form onSubmit={handlePhoneSetupSubmit}>
            <div className="input-group">
              <label htmlFor="portal-phone">{t.phoneLabel}</label>
              <input
                type="tel"
                id="portal-phone"
                placeholder={t.phonePlaceholder}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && <p className="error-msg" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.75rem' }}>{error}</p>}

            <button type="submit" className="btn-primary w-100" style={{ marginTop: '1.5rem' }} disabled={isLoading}>
              {isLoading ? (lang === 'en' ? 'Saving...' : 'جاري الحفظ...') : t.phoneSubmitBtn}
            </button>

            <button 
              type="button" 
              className="btn-secondary w-100" 
              style={{ marginTop: '0.5rem', border: 'none', background: 'transparent', color: '#64748b' }}
              onClick={() => {
                setStep('credentials');
                setError('');
              }}
              disabled={isLoading}
            >
              {t.backBtn}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            {otpSentMessage && (
              <p className="info-msg" style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '8px 12px', borderRadius: '6px' }}>
                {otpSentMessage}
              </p>
            )}

            <div className="input-group">
              <label htmlFor="portal-otp">{t.otpLabel}</label>
              <input
                type="text"
                id="portal-otp"
                maxLength="6"
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="123456"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                required
                autoFocus
                disabled={isLoading}
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem', fontWeight: 'bold' }}
              />
            </div>

            {error && <p className="error-msg" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>{error}</p>}

            <button type="submit" className="btn-primary w-100" style={{ marginTop: '1.5rem' }} disabled={isLoading}>
              {isLoading ? (lang === 'en' ? 'Verifying...' : 'جاري التحقق...') : t.otpSubmitBtn}
            </button>

            <button 
              type="button" 
              className="btn-secondary w-100" 
              style={{ marginTop: '0.5rem', border: 'none', background: 'transparent', color: '#64748b' }}
              onClick={() => {
                setStep('credentials');
                setError('');
                setOtpInput('');
              }}
              disabled={isLoading}
            >
              {t.backBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


