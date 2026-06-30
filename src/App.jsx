import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AnnouncementBar from './components/AnnouncementBar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Booking from './components/Booking';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PortalLoginModal from './components/PortalLoginModal';
import AdminPortal from './components/AdminPortal';
import ServiceDetail from './components/ServiceDetail';
import Articles from './components/Articles';
import ArticleDetail from './components/ArticleDetail';
import Toast from './components/Toast';
import CustomDialog from './components/CustomDialog';
import { sendBookingEmails, sendContactEmails } from './utils/email';
import { sanitizeAndValidateBooking, sanitizeAndValidateContact } from './utils/validation';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  getSettings,
  updateSettings,
  getAnnouncement,
  updateAnnouncement,
  getArticles,
  createArticle,
  deleteArticle,
  updateArticle,
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getContacts,
  createContact,
  updateContactStatus,
  deleteContact
} from './services/firebaseService';

// --- Default & Seed Data Configuration ---
const defaultSettings = {
  phone: "+971 6 555 1234",
  email: "info@sanadconsulting.ae",
  hoursEn: "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday - Sunday: Closed",
  hoursAr: "الاثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً\nالسبت - الأحد: مغلق",
  addressEn: "Sharjah Research Technology & Innovation Park, Sharjah, United Arab Emirates",
  addressAr: "مجمع الشارقة للبحوث والتكنولوجيا والابتكار، الشارقة، الإمارات العربية المتحدة",
  linkedin: "https://linkedin.com",
  youtube: "https://youtube.com",
  instagram: "https://instagram.com",
  whatsapp: "https://wa.me/97165551234"
};

const defaultAnnouncement = {
  textEn: "Eid Mubarak! Our office will be closed on June 16-18.",
  textAr: "عيد مبارك! ستغلق مكاتبنا في الفترة من 16 إلى 18 يونيو.",
  visible: true
};

const defaultArticles = [
  {
    titleEn: "Navigating the New UAE Corporate Tax Regime",
    titleAr: "فهم نظام ضريبة الشركات الجديد في دولة الإمارات",
    categoryEn: "Tax Advisory",
    categoryAr: "الاستشارات الضريبية",
    contentEn: "The UAE Federal Tax Authority has introduced a corporate tax rate of 9% for taxable income exceeding AED 375,000. Business owners must structure their operations properly to benefit from small business relief and free zone exemptions. Keeping proper books of accounts is now mandatory for compliance.",
    contentAr: "أعلنت الهيئة الاتحادية للضرائب عن بدء تطبيق ضريبة الشركات بنسبة 9% على الدخل الخاضع للضريبة الذي يتجاوز 375,000 درهم إماراتي. يجب على أصحاب الأعمال هيكلة عملياتهم بشكل صحيح للاستفادة من تسهيلات الأعمال الصغيرة والإعفاءات المتاحة للمناطق الحرة. أصبح الاحتفاظ بدفاتر حسابات دقيقة أمراً إلزامياً للامتثال القانوني.",
    coverImage: "/sanad_about_office.png",
    date: new Date(2026, 5, 20).toISOString().split('T')[0],
    attachments: [],
    video: ""
  }
];

export default function App() {
  // --- Core State Variables ---
  const [lang, setLang] = useState('en');
  const [portal, setPortal] = useState('client'); // 'client', 'admin'
  const [loginTargetPortal, setLoginTargetPortal] = useState(''); // 'admin'
  const [currentView, setCurrentView] = useState('home'); // 'home', 'service-detail', 'article-detail'
  const [selectedServiceId, setSelectedServiceId] = useState('setup');
  const [selectedArticleId, setSelectedArticleId] = useState('');
  
  // Backend backed states
  const [articles, setArticles] = useState([]);
  const [siteSettings, setSiteSettings] = useState(defaultSettings);
  const [announcement, setAnnouncement] = useState(defaultAnnouncement);
  const [contacts, setContacts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  
  // Dashboard states
  const [tempBookingData, setTempBookingData] = useState(null);

  // Overlay modale states
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Custom alerts/toasts states
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
  const [customDialog, setCustomDialog] = useState(null); // { isOpen, type, title, message, placeholder, defaultValue, onConfirm, onCancel }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const openDialog = (config) => {
    setCustomDialog({
      ...config,
      isOpen: true,
      onConfirm: (val) => {
        setCustomDialog(null);
        if (config.onConfirm) config.onConfirm(val);
      },
      onCancel: () => {
        setCustomDialog(null);
        if (config.onCancel) config.onCancel();
      }
    });
  };

  const showAlert = (message, title = '', onConfirm) => openDialog({ type: 'alert', message, title, onConfirm });
  const showConfirm = (message, title = '', onConfirm, onCancel) => openDialog({ type: 'confirm', message, title, onConfirm, onCancel });
  const showPrompt = (message, placeholder = '', title = '', onConfirm, onCancel, defaultValue = '') => openDialog({ type: 'prompt', message, placeholder, title, defaultValue, onConfirm, onCancel });

  // --- Fetch Public Data on Mount & Seed if Empty ---
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Load Settings
        let settingsData = await getSettings();
        if (!settingsData) {
          console.log('Seeding default site settings to Firestore...');
          await updateSettings(defaultSettings);
          settingsData = defaultSettings;
        }
        setSiteSettings(settingsData);

        // Load Announcement
        let announceData = await getAnnouncement();
        if (!announceData) {
          console.log('Seeding default announcement to Firestore...');
          await updateAnnouncement(defaultAnnouncement);
          announceData = defaultAnnouncement;
        }
        setAnnouncement(announceData);

        // Load Articles
        let articlesData = await getArticles();
        if (articlesData.length === 0) {
          console.log('Seeding default articles to Firestore...');
          const seeded = await createArticle(defaultArticles[0]);
          articlesData = [seeded];
        }
        setArticles(articlesData);
        if (articlesData.length > 0) {
          setSelectedArticleId(articlesData[0].id);
        }
      } catch (err) {
        console.error('Error fetching public data:', err);
      }
    };
    fetchPublicData();
  }, []);

  // --- Firebase Auth State Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // S2: Verify role from Firestore — never assume any authenticated user is an admin
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';

          if (!isAdmin) {
            // Authenticated but not an admin — sign them out immediately
            await signOut(auth);
            setUser(null);
            setPortal('client');
            return;
          }

          setUser({ username: firebaseUser.email, role: 'admin' });
          setPortal('admin');

          const bookingsData = await getBookings();
          setBookings(bookingsData);

          const contactsData = await getContacts();
          setContacts(contactsData);
        } catch (err) {
          console.error('Error verifying admin role:', err.message);
          await signOut(auth);
          setUser(null);
          setPortal('client');
        }
      } else {
        setUser(null);
        setPortal('client');
        setBookings([]);
        setContacts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Action Handlers ---

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handlePortalChange = async (newPortal) => {
    if (newPortal === 'client') {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Logout error:', err);
      }
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPortal(newPortal);
    }
  };

  const handlePortalTriggerClick = (target) => {
    if (portal === target) {
      setPortal(target);
    } else {
      setLoginTargetPortal(target);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (newToken, loggedInUser) => {
    setUser(loggedInUser);
    setPortal(loggedInUser.role);
    setShowLoginModal(false);
    showToast(lang === 'en' ? 'Logged in successfully!' : 'تم تسجيل الدخول بنجاح!', 'success');
  };

  // D1: extracted from the two submit handlers — single source of truth for the cooldown
  const SUBMIT_COOLDOWN_MS = 30_000;
  const isRateLimited = () => {
    const lastSubmit = localStorage.getItem('last_submit_time');
    return lastSubmit && Date.now() - parseInt(lastSubmit, 10) < SUBMIT_COOLDOWN_MS;
  };

  const handleBookingSubmit = async (formData) => {
    // 1. Anti-spam honeypot filter — fully silent
    if (formData.isSpam) return;

    // 2. Rate limiting
    if (isRateLimited()) {
      showToast(lang === 'en' ? 'Please wait 30 seconds between submissions.' : 'يرجى الانتظار 30 ثانية بين عمليات الإرسال.', 'warning');
      return;
    }
    const now = Date.now();

    // 3. Validation and Sanitization
    const validation = sanitizeAndValidateBooking(formData);
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    const code = 'SND-' + Math.floor(1000 + Math.random() * 9000);
    const bookingData = {
      ...validation.sanitized,
      ref: code,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const newBooking = await createBooking(bookingData);

      // H1: fire email but catch failures so they surface as a console warning, not a silent swallow
      sendBookingEmails(bookingData).catch(e => console.warn('EmailJS booking notification failed:', e.message));

      // Save submission timestamp
      localStorage.setItem('last_submit_time', now.toString());
      setTempBookingData(null);

      showAlert(
        lang === 'en'
          ? `Your consultation has been booked successfully! Reference code: ${code}. The team will review and schedule your session.`
          : `تم حجز استشارتك بنجاح! رمز المرجع: ${code}. سيقوم الفريق بمراجعة وجدولة جلستك.`,
        lang === 'en' ? 'Booking Confirmed' : 'تم تأكيد الحجز'
      );
    } catch (err) {
      console.error('Booking failed:', err.message);
      showToast(lang === 'en' ? 'Booking failed.' : 'فشل الحجز.', 'error');
    }
  };

  const handleContactSubmit = async (formData) => {
    // 1. Anti-spam honeypot filter — fully silent
    if (formData.isSpam) return;

    // 2. Rate limiting
    if (isRateLimited()) {
      showToast(lang === 'en' ? 'Please wait 30 seconds between submissions.' : 'يرجى الانتظار 30 ثانية بين عمليات الإرسال.', 'warning');
      return;
    }
    const now = Date.now();

    // 3. Validation and Sanitization
    const validation = sanitizeAndValidateContact(formData);
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    try {
      const newContact = await createContact(validation.sanitized);

      // H1: fire email but catch failures so they surface as a console warning, not a silent swallow
      sendContactEmails(validation.sanitized).catch(e => console.warn('EmailJS contact notification failed:', e.message));

      // Save submission timestamp
      localStorage.setItem('last_submit_time', now.toString());
      showToast(
        lang === 'en' ? 'Message sent successfully! We will get back to you.' : 'تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.',
        'success'
      );
    } catch (err) {
      console.error('Contact submission failed:', err.message);
      showToast(lang === 'en' ? 'Failed to send message.' : 'فشل إرسال الرسالة.', 'error');
    }
  };

  const handleScheduleBooking = async (bookingId, details) => {
    try {
      const updated = await updateBooking(bookingId, { status: 'Scheduled', appointmentDetails: details });
      setBookings((prev) => prev.map(b => b.id === bookingId ? { ...b, ...updated } : b));
      showToast(lang === 'en' ? 'Booking scheduled!' : 'تمت جدولة الحجز!', 'success');
    } catch (err) {
      console.error('Schedule booking failed:', err.message);
      showToast(lang === 'en' ? 'Failed to schedule.' : 'فشلت الجدولة.', 'error');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const updated = await updateBooking(bookingId, { status: 'Completed' });
      setBookings((prev) => prev.map(b => b.id === bookingId ? { ...b, ...updated } : b));
      showToast(lang === 'en' ? 'Booking completed!' : 'اكتمل الحجز!', 'success');
    } catch (err) {
      console.error('Complete booking failed:', err.message);
      showToast(lang === 'en' ? 'Failed to complete booking.' : 'فشل إتمام الحجز.', 'error');
    }
  };

  const handleMarkContactRead = async (contactId) => {
    try {
      const updated = await updateContactStatus(contactId, 'Processed');
      setContacts((prev) => prev.map(c => c.id === contactId ? { ...c, ...updated } : c));
    } catch (err) {
      console.error('Mark contact read failed:', err.message);
      showToast(lang === 'en' ? 'Failed to update message.' : 'فشل تحديث الرسالة.', 'error');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await deleteContact(contactId);
      setContacts((prev) => prev.filter(c => c.id !== contactId));
      showToast(lang === 'en' ? 'Message deleted!' : 'تم حذف الرسالة!', 'info');
    } catch (err) {
      console.error('Delete contact failed:', err.message);
      showToast(lang === 'en' ? 'Failed to delete message.' : 'فشل حذف الرسالة.', 'error');
    }
  };

  // Admin actions
  const handleSaveSettings = async (settings, announce) => {
    try {
      await updateSettings(settings);
      await updateAnnouncement(announce);

      setSiteSettings(settings);
      setAnnouncement(announce);
      showToast(lang === 'en' ? 'Settings saved!' : 'تم حفظ الإعدادات!', 'success');
    } catch (err) {
      console.error('Save settings failed:', err.message);
      showToast(lang === 'en' ? 'Failed to save settings.' : 'فشل حفظ الإعدادات.', 'error');
    }
  };

  const handleToggleAnnouncementVisibility = async (visible) => {
    try {
      const updated = { ...announcement, visible };
      await updateAnnouncement(updated);
      setAnnouncement(updated);
    } catch (err) {
      console.error('Toggle announcement failed:', err.message);
      showToast(lang === 'en' ? 'Failed to update announcement.' : 'فشل تحديث الإعلان.', 'error');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter(b => b.id !== bookingId));
      showToast(lang === 'en' ? 'Booking deleted!' : 'تم حذف الحجز!', 'info');
    } catch (err) {
      console.error('Delete booking failed:', err.message);
      showToast(lang === 'en' ? 'Failed to delete booking.' : 'فشل حذف الحجز.', 'error');
    }
  };

  const handlePublishArticle = async (newArticle) => {
    try {
      const created = await createArticle(newArticle);
      setArticles((prev) => [created, ...prev]);
      showToast(
        lang === 'en' ? 'Article published successfully!' : 'تم نشر المقال بنجاح!',
        'success'
      );
    } catch (err) {
      console.error('Publish article failed:', err.message);
      showToast(lang === 'en' ? 'Failed to publish.' : 'فشل النشر.', 'error');
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      await deleteArticle(articleId);
      setArticles((prev) => prev.filter(a => a.id !== articleId));
      showToast(
        lang === 'en' ? 'Article deleted successfully!' : 'تم حذف المقال بنجاح!',
        'info'
      );
    } catch (err) {
      console.error('Delete article failed:', err.message);
      showToast(lang === 'en' ? 'Failed to delete article.' : 'فشل حذف المقال.', 'error');
    }
  };

  const handleUpdateArticle = async (articleId, updatedData) => {
    try {
      const updated = await updateArticle(articleId, updatedData);
      setArticles((prev) => prev.map(a => a.id === articleId ? { ...a, ...updated } : a));
      showToast(
        lang === 'en' ? 'Article updated successfully!' : 'تم تحديث المقال بنجاح!',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(lang === 'en' ? 'Failed to update article.' : 'فشل تحديث المقال.', 'error');
    }
  };

  // --- Localization Direction Sync ---
  useEffect(() => {
    document.body.classList.toggle('rtl', lang === 'ar');
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // --- Scroll Listeners & Translucent Header ---
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Scroll Reveal Animation Observer ---
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });
      revealElements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, []);

  // --- History & Browser Back Redirection ---
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '');
    }

    const handlePopState = (event) => {
      if (event.state) {
        if (event.state.view === 'service-detail') {
          setCurrentView('service-detail');
          setSelectedServiceId(event.state.serviceId);
        } else if (event.state.view === 'article-detail') {
          setCurrentView('article-detail');
          setSelectedArticleId(event.state.articleId);
        } else {
          setCurrentView('home');
        }
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  // Scroll callback from Hero CTA
  const handleScrollToBooking = () => {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
  };

  // P1: extracted — was inlined 3 times in the JSX
  const handleServiceClick = (serviceId) => {
    setCurrentView('service-detail');
    setSelectedServiceId(serviceId);
    window.history.pushState({ view: 'service-detail', serviceId }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentAnnounceText = lang === 'en' ? announcement?.textEn : announcement?.textAr;
  const isAnnounceVisible = announcement?.visible !== false;
  const currentPath = window.location.pathname;

  if (currentPath === '/admin') {
    return (
      <div className="app-root bg-slate-50 min-h-screen flex flex-col justify-between">
        {!user ? (
          <PortalLoginModal
            targetPortal="admin"
            lang={lang}
            onClose={() => {
              window.location.href = '/';
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <AdminPortal
            lang={lang}
            siteSettings={siteSettings}
            announcement={announcement}
            bookings={bookings}
            contacts={contacts}
            onLogout={async () => {
              try {
                await signOut(auth);
              } catch (e) {
                console.error(e);
              }
              setUser(null);
              window.location.href = '/';
            }}
            onSaveSettings={handleSaveSettings}
            onToggleAnnouncementVisibility={handleToggleAnnouncementVisibility}
            onScheduleBooking={handleScheduleBooking}
            onCompleteBooking={handleCompleteBooking}
            onDeleteBooking={handleDeleteBooking}
            onMarkContactRead={handleMarkContactRead}
            onDeleteContact={handleDeleteContact}
            showToast={showToast}
            showAlert={showAlert}
            showConfirm={showConfirm}
            showPrompt={showPrompt}
            articles={articles}
            onPublishArticle={handlePublishArticle}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
          />
        )}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            lang={lang}
            onClose={closeToast}
          />
        )}
        {customDialog && (
          <CustomDialog
            isOpen={customDialog.isOpen}
            type={customDialog.type}
            title={customDialog.title}
            message={customDialog.message}
            placeholder={customDialog.placeholder}
            defaultValue={customDialog.defaultValue}
            lang={lang}
            onConfirm={customDialog.onConfirm}
            onCancel={customDialog.onCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header
        lang={lang}
        portal={portal}
        onPortalChange={handlePortalChange}
        onLangToggle={handleLangToggle}
        onPortalTriggerClick={handlePortalTriggerClick}
        isAnnounceVisible={isAnnounceVisible}
        onServiceClick={handleServiceClick}
      />

      <AnnouncementBar announcement={announcement} lang={lang} />

      {currentView === 'home' && (
        <main id="main-content">
          <Hero lang={lang} onBookClick={handleScrollToBooking} isAnnounceVisible={isAnnounceVisible} />
          <About lang={lang} />
          <Services lang={lang} onServiceClick={handleServiceClick} />
          <Articles lang={lang} articles={articles} onArticleClick={(articleId) => {
            setCurrentView('article-detail');
            setSelectedArticleId(articleId);
            window.history.pushState({ view: 'article-detail', articleId }, '');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
          <Booking lang={lang} onBookingSubmit={handleBookingSubmit} />
          <Contact lang={lang} siteSettings={siteSettings} onContactSubmit={handleContactSubmit} />
        </main>
      )}

      {currentView === 'service-detail' && (
        <ServiceDetail
          serviceId={selectedServiceId}
          lang={lang}
          onGoToHome={() => {
            if (window.history.state && window.history.state.view === 'service-detail') {
              window.history.back();
            } else {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onServiceClick={handleServiceClick}
        />
      )}

      {currentView === 'article-detail' && (
        <ArticleDetail
          article={articles.find(a => a.id === selectedArticleId) || articles[0]}
          lang={lang}
          onGoToHome={() => {
            if (window.history.state && window.history.state.view === 'article-detail') {
              window.history.back();
            } else {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          articles={articles}
          onArticleClick={(articleId) => {
            setSelectedArticleId(articleId);
            window.history.pushState({ view: 'article-detail', articleId }, '');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <Footer onPortalClick={handlePortalTriggerClick} siteSettings={siteSettings} lang={lang} />

      {showLoginModal && (
        <PortalLoginModal
          targetPortal={loginTargetPortal}
          lang={lang}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}



      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          lang={lang}
          onClose={closeToast}
        />
      )}

      {customDialog && (
        <CustomDialog
          isOpen={customDialog.isOpen}
          type={customDialog.type}
          title={customDialog.title}
          message={customDialog.message}
          placeholder={customDialog.placeholder}
          defaultValue={customDialog.defaultValue}
          lang={lang}
          onConfirm={customDialog.onConfirm}
          onCancel={customDialog.onCancel}
        />
      )}
    </div>
  );
}
