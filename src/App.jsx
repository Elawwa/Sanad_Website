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
import PaymentModal from './components/PaymentModal';
import AdminPortal from './components/AdminPortal';
import ServiceDetail from './components/ServiceDetail';
import Articles from './components/Articles';
import ArticleDetail from './components/ArticleDetail';
import Toast from './components/Toast';
import CustomDialog from './components/CustomDialog';

// --- Default & Seed Data Configuration ---
const defaultSettings = {
  phone: "+971 6 555 1234",
  email: "info@sanadconsulting.ae",
  hoursEn: "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday - Sunday: Closed",
  hoursAr: "الاثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً\nالسبت - الأحد: مغلق",
  addressEn: "Sharjah Research Technology & Innovation Park, Sharjah, United Arab Emirates",
  addressAr: "مجمع الشارقة للبحوث والتكنولوجيا والابتكار، الشارقة، الإمارات العربية المتحدة"
};

const defaultAnnouncement = {
  textEn: "Eid Mubarak! Our office will be closed on June 16-18.",
  textAr: "عيد مبارك! ستغلق مكاتبنا في الفترة من 16 إلى 18 يونيو.",
  visible: true
};

const defaultContacts = [
  { id: 1, name: "Fatima Al-Mansoori", email: "fatima.almansoori@gmail.com", phone: "+971 50 123 4567", message: "Hello, we want to expand our business to Sharjah free zone next month. Can we schedule a meeting?", date: new Date().toLocaleDateString(), status: "New" },
  { id: 2, name: "Richard Smith", email: "richard.smith@uk-logistics.com", phone: "+44 7911 123456", message: "Inquiry on Corporate Tax registration thresholds for UAE branches of British firms.", date: new Date().toLocaleDateString(), status: "New" }
];

const defaultBookings = [
  { id: 101, name: "George Miller", phone: "+971 50 123 4567", email: "george@miller.com", brief: "Need a legal draft review for a SaaS setup.", type: "online", ref: "SND-1029", status: "Paid & Pending Review", date: new Date().toLocaleDateString(), assignedEmployeeId: 1 },
  { id: 102, name: "Lina K.", phone: "+971 52 987 6543", email: "lina@k-setup.ae", brief: "In-person consultation to establish UAE mainland LLC.", type: "in-person", ref: "SND-3049", status: "Scheduled", appointmentDetails: "Sharjah Office on June 15th at 10:00 AM", date: new Date().toLocaleDateString(), assignedEmployeeId: 2 }
];

const defaultArticles = [
  {
    id: 1,
    titleEn: "Navigating the New UAE Corporate Tax Regime",
    titleAr: "فهم نظام ضريبة الشركات الجديد في دولة الإمارات",
    categoryEn: "Tax Advisory",
    categoryAr: "الاستشارات الضريبية",
    contentEn: "The UAE Federal Tax Authority has introduced a corporate tax rate of 9% for taxable income exceeding AED 375,000. Business owners must structure their operations properly to benefit from small business relief and free zone exemptions. Keeping proper books of accounts is now mandatory for compliance.",
    contentAr: "أعلنت الهيئة الاتحادية للضرائب عن بدء تطبيق ضريبة الشركات بنسبة 9% على الدخل الخاضع للضريبة الذي يتجاوز 375,000 درهم إماراتي. يجب على أصحاب الأعمال هيكلة عملياتهم بشكل صحيح للاستفادة من تسهيلات الأعمال الصغيرة والإعفاءات المتاحة للمناطق الحرة. أصبح الاحتفاظ بدفاتر حسابات دقيقة أمراً إلزامياً للامتثال القانوني.",
    coverImage: "/sanad_about_office.png",
    date: new Date(2026, 5, 20).toLocaleDateString(),
    attachments: [],
    video: ""
  },
  {
    id: 2,
    titleEn: "Mainland vs. Free Zone Setup: Which is Right for You?",
    titleAr: "تأسيس الشركات: البر الرئيسي مقابل المنطقة الحرة",
    categoryEn: "Corporate Setup",
    categoryAr: "تأسيس الشركات",
    contentEn: "Choosing between a mainland entity and a free zone setup depends on your target market. A mainland company allows you to trade freely anywhere in the UAE, while a free zone setup offers 100% foreign ownership and tax exemptions, but limits direct trading in the local market without an agent.",
    contentAr: "يعتمد الاختيار بين شركة البر الرئيسي وتأسيس شركة في المنطقة الحرة على السوق المستهدف. تتيح لك شركة البر الرئيسي التداول بحرية في أي مكان داخل الإمارات، بينما يوفر تأسيس شركة في المنطقة الحرة ملكية أجنبية بنسبة 100% وإعفاءات ضريبية، ولكنه يحد من التجارة المباشرة في السوق المحلي بدون وكيل.",
    coverImage: "/sanad_hero_symbol.png",
    date: new Date(2026, 5, 22).toLocaleDateString(),
    attachments: [],
    video: ""
  }
];

// Helper to seed localStorage
const getLocalStorageItem = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
};

export default function App() {
  // --- Core State Variables ---
  const [lang, setLang] = useState('en');
  const [portal, setPortal] = useState('client'); // 'client', 'employee', 'admin'
  const [loginTargetPortal, setLoginTargetPortal] = useState(''); // 'employee' or 'admin'
  const [currentView, setCurrentView] = useState('home'); // 'home', 'service-detail', 'article-detail'
  const [selectedServiceId, setSelectedServiceId] = useState('setup');
  const [selectedArticleId, setSelectedArticleId] = useState(1);
  const [articles, setArticles] = useState(() => getLocalStorageItem('sanad_articles', defaultArticles));
  
  // Storage properties
  const [siteSettings, setSiteSettings] = useState(() => getLocalStorageItem('sanad_site_settings', defaultSettings));
  const [announcement, setAnnouncement] = useState(() => getLocalStorageItem('sanad_announcement', defaultAnnouncement));
  const [contacts, setContacts] = useState(() => getLocalStorageItem('sanad_contacts', defaultContacts));
  const [bookings, setBookings] = useState(() => getLocalStorageItem('sanad_bookings', defaultBookings));
  
  // Dashboard states
  const [tempBookingData, setTempBookingData] = useState(null);

  // Overlay modale states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Custom alerts/toasts states
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
  const [customDialog, setCustomDialog] = useState(null); // { isOpen, type, title, message, placeholder, defaultValue, onConfirm, onCancel }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const showAlert = (message, title = '', onConfirm = () => {}) => {
    setCustomDialog({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: () => {
        setCustomDialog(null);
        onConfirm();
      },
      onCancel: () => {
        setCustomDialog(null);
      }
    });
  };

  const showConfirm = (message, title = '', onConfirm = () => {}, onCancel = () => {}) => {
    setCustomDialog({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        setCustomDialog(null);
        onConfirm();
      },
      onCancel: () => {
        setCustomDialog(null);
        onCancel();
      }
    });
  };

  const showPrompt = (message, placeholder = '', title = '', onConfirm = () => {}, onCancel = () => {}, defaultValue = '') => {
    setCustomDialog({
      isOpen: true,
      type: 'prompt',
      title,
      message,
      placeholder,
      defaultValue,
      onConfirm: (val) => {
        setCustomDialog(null);
        onConfirm(val);
      },
      onCancel: () => {
        setCustomDialog(null);
        onCancel();
      }
    });
  };

  // --- Sync State back to LocalStorage when changed ---
  useEffect(() => {
    localStorage.setItem('sanad_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('sanad_announcement', JSON.stringify(announcement));
  }, [announcement]);

  useEffect(() => {
    localStorage.setItem('sanad_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('sanad_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('sanad_articles', JSON.stringify(articles));
  }, [articles]);

  const handlePublishArticle = (newArticle) => {
    setArticles((prev) => [newArticle, ...prev]);
    showToast(
      lang === 'en' ? 'Article published successfully!' : 'تم نشر المقال بنجاح!',
      'success'
    );
  };

  const handleDeleteArticle = (articleId) => {
    setArticles((prev) => prev.filter(a => a.id !== articleId));
    showToast(
      lang === 'en' ? 'Article deleted successfully!' : 'تم حذف المقال بنجاح!',
      'info'
    );
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
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [portal]); // re-observe when routing templates swap

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

  // --- Action Handlers ---

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handlePortalChange = (newPortal) => {
    setPortal(newPortal);
    if (newPortal === 'client') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleLoginSuccess = (target) => {
    setPortal(target);
    setShowLoginModal(false);
  };

  const handleBookingSubmit = (formData) => {
    setTempBookingData(formData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (code) => {
    const newBooking = {
      id: Date.now(),
      name: tempBookingData.name,
      phone: tempBookingData.phone,
      email: tempBookingData.email,
      brief: tempBookingData.brief,
      type: tempBookingData.type,
      ref: code,
      status: 'Pending Review',
      date: new Date().toLocaleDateString(),
      assignedEmployeeId: null
    };

    setBookings((prev) => [...prev, newBooking]);
    setTempBookingData(null);

    // Show a beautiful Alert dialog instead of just closing
    showAlert(
      lang === 'en'
        ? `Your consultation has been booked successfully! Reference code: ${code}. The team will review and schedule your session.`
        : `تم حجز استشارتك بنجاح! رمز المرجع: ${code}. سيقوم الفريق بمراجعة وجدولة جلستك.`,
      lang === 'en' ? 'Booking Confirmed' : 'تم تأكيد الحجز'
    );
  };

  const handleContactSubmit = (formData) => {
    const newContact = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      date: new Date().toLocaleDateString(),
      status: 'New'
    };
    setContacts((prev) => [...prev, newContact]);
    showToast(
      lang === 'en' ? 'Message sent successfully! We will get back to you.' : 'تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.',
      'success'
    );
  };

  const handleScheduleBooking = (bookingId, details) => {
    setBookings((prev) => {
      return prev.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: 'Scheduled', appointmentDetails: details };
        }
        return b;
      });
    });
  };

  const handleCompleteBooking = (bookingId) => {
    setBookings((prev) => {
      return prev.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: 'Completed' };
        }
        return b;
      });
    });
  };

  const handleMarkContactRead = (contactId) => {
    setContacts((prev) => {
      return prev.map(c => {
        if (c.id === contactId) {
          return { ...c, status: 'Processed' };
        }
        return c;
      });
    });
  };

  const handleDeleteContact = (contactId) => {
    setContacts((prev) => prev.filter(c => c.id !== contactId));
  };

  // Admin actions
  const handleSaveSettings = (settings, announce) => {
    setSiteSettings(settings);
    setAnnouncement(announce);
  };

  const handleToggleAnnouncementVisibility = (visible) => {
    setAnnouncement((prev) => ({ ...prev, visible }));
  };

  const handleDeleteBooking = (bookingId) => {
    setBookings((prev) => prev.filter(b => b.id !== bookingId));
  };

  // Scroll callback from Hero CTA
  const handleScrollToBooking = () => {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentAnnounceText = lang === 'en' ? announcement?.textEn : announcement?.textAr;
  const isAnnounceVisible = announcement?.visible !== false;

  return (
    <div className="app-root">
      <Header
        lang={lang}
        portal={portal}
        onPortalChange={handlePortalChange}
        onLangToggle={handleLangToggle}
        onPortalTriggerClick={handlePortalTriggerClick}
        isAnnounceVisible={isAnnounceVisible}
        onServiceClick={(serviceId) => {
          setCurrentView('service-detail');
          setSelectedServiceId(serviceId);
          window.history.pushState({ view: 'service-detail', serviceId }, '');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <AnnouncementBar announcement={announcement} lang={lang} />

      {portal === 'client' && currentView === 'home' && (
        <main id="main-content">
          <Hero lang={lang} onBookClick={handleScrollToBooking} isAnnounceVisible={isAnnounceVisible} />
          <About lang={lang} />
          <Services lang={lang} onServiceClick={(serviceId) => {
            setCurrentView('service-detail');
            setSelectedServiceId(serviceId);
            window.history.pushState({ view: 'service-detail', serviceId }, '');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
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

      {portal === 'client' && currentView === 'service-detail' && (
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
          onServiceClick={(serviceId) => {
            setSelectedServiceId(serviceId);
            window.history.pushState({ view: 'service-detail', serviceId }, '');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {portal === 'client' && currentView === 'article-detail' && (
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

      {portal === 'admin' && (
        <AdminPortal
          lang={lang}
          siteSettings={siteSettings}
          announcement={announcement}
          bookings={bookings}
          contacts={contacts}
          onLogout={() => handlePortalChange('client')}
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
          onDeleteArticle={handleDeleteArticle}
        />
      )}

      <Footer onPortalClick={handlePortalTriggerClick} />

      {showLoginModal && (
        <PortalLoginModal
          targetPortal={loginTargetPortal}
          lang={lang}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          tempBookingData={tempBookingData}
          lang={lang}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
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
