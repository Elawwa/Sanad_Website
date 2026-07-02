import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { validateAdminArticle, sanitizeAndValidateSettings } from '../utils/validation';
import { 
  LayoutDashboard, 
  Calendar, 
  Mail, 
  FileText, 
  LogOut, 
  Settings, 
  Plus, 
  PlusCircle,
  Globe, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Video, 
  Image, 
  Paperclip, 
  ExternalLink,
  ChevronRight,
  User,
  Search,
  Check,
  X,
  Languages,
  BookOpen,
  Menu
} from 'lucide-react';

const translateText = async (text, fromLang = 'ar', toLang = 'en') => {
  if (!text || text.trim().length === 0) return '';
  
  try {
    const paragraphs = text.split('\n');
    const translatedParagraphs = [];

    for (const para of paragraphs) {
      if (para.trim().length === 0) {
        translatedParagraphs.push('');
        continue;
      }

      // Chunk long paragraphs by sentences to stay under the 500-character limit per API call
      const chunks = [];
      let currentChunk = '';
      const sentences = para.match(/[^.!?]+[.!?]*/g) || [para];

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > 400) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      // Translate chunks in parallel for this paragraph
      const translatedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${fromLang}|${toLang}`);
          const data = await res.json();
          if (data?.responseData?.translatedText) {
            return data.responseData.translatedText;
          }
          throw new Error('Segment translation failed');
        })
      );

      translatedParagraphs.push(translatedChunks.join(''));
    }

    return translatedParagraphs.join('\n');
  } catch (err) {
    console.error('Translation error:', err);
    throw err;
  }
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};

export default function AdminPortal({
  lang,
  siteSettings,
  announcement,
  bookings,
  contacts,
  onLogout,
  onSaveSettings,
  onToggleAnnouncementVisibility,
  onScheduleBooking,
  onCompleteBooking,
  onDeleteBooking,
  onMarkContactRead,
  onDeleteContact,
  showToast,
  showAlert,
  showConfirm,
  showPrompt,
  articles,
  onPublishArticle,
  onUpdateArticle,
  onDeleteArticle
}) {
  const [activeTab, setActiveTab] = useState('admin-stats-settings');
  const [editingArticle, setEditingArticle] = useState(null); // { id, form: {...} }
  const [searchQuery, setSearchQuery] = useState('');
  const [cmsFormTab, setCmsFormTab] = useState('ar'); // 'ar' or 'en' for cleaner editing
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [publishingForm, setPublishingForm] = useState({
    titleEn: '',
    titleAr: '',
    contentEn: '',
    contentAr: '',
    coverImage: '',
    video: '',
    videoName: '',
    attachments: []
  });

  const [settingsForm, setSettingsForm] = useState({
    phone: siteSettings.phone || '',
    email: siteSettings.email || '',
    hoursEn: siteSettings.hoursEn || '',
    hoursAr: siteSettings.hoursAr || '',
    linkedin: siteSettings.linkedin || '',
    youtube: siteSettings.youtube || '',
    instagram: siteSettings.instagram || '',
    whatsapp: siteSettings.whatsapp || '',
    announceEn: announcement.textEn || '',
    announceAr: announcement.textAr || '',
    announceVisible: announcement.visible !== false
  });

  useEffect(() => {
    setSettingsForm({
      phone: siteSettings.phone || '',
      email: siteSettings.email || '',
      hoursEn: siteSettings.hoursEn || '',
      hoursAr: siteSettings.hoursAr || '',
      linkedin: siteSettings.linkedin || '',
      youtube: siteSettings.youtube || '',
      instagram: siteSettings.instagram || '',
      whatsapp: siteSettings.whatsapp || '',
      announceEn: announcement.textEn || '',
      announceAr: announcement.textAr || '',
      announceVisible: announcement.visible !== false
    });
  }, [siteSettings, announcement]);

  const t = {
    title: lang === 'en' ? 'Admin Control' : 'لوحة الإدارة',
    logout: lang === 'en' ? 'Sign Out' : 'تسجيل الخروج',
    tabStats: lang === 'en' ? 'Dashboard & Settings' : 'لوحة التحكم والإعدادات',
    tabAppointments: lang === 'en' ? 'Consultations' : 'الاستشارات والحجوزات',
    tabContacts: lang === 'en' ? 'Client Messages' : 'رسائل العملاء',
    tabPublishing: lang === 'en' ? 'Articles & CMS' : 'المقالات والتحرير',
    statBookings: lang === 'en' ? 'Total Bookings' : 'إجمالي الحجوزات',
    statPending: lang === 'en' ? 'Pending Review' : 'قيد المراجعة',
    editSiteSettings: lang === 'en' ? 'Global Site Settings' : 'إعدادات الموقع العامة',
    phoneLabel: lang === 'en' ? 'Office Phone Number' : 'رقم هاتف المكتب',
    emailLabel: lang === 'en' ? 'Office Email Address' : 'البريد الإلكتروني الرسمي',
    hoursEnLabel: lang === 'en' ? 'Business Hours (EN)' : 'ساعات العمل (إنجليزي)',
    hoursArLabel: lang === 'en' ? 'Business Hours (AR)' : 'ساعات العمل (عربي)',
    announceTitle: lang === 'en' ? 'Website Announcement Bar' : 'شريط الإعلانات التنبيهي',
    announceEnLabel: lang === 'en' ? 'Announcement (English)' : 'نص الإعلان (إنجليزي)',
    announceArLabel: lang === 'en' ? 'Announcement (Arabic)' : 'نص الإعلان (عربي)',
    announceEnableLabel: lang === 'en' ? 'Enable announcement banner at the top' : 'تمكين شريط التنبيهات في أعلى الموقع',
    linkedinLabel: lang === 'en' ? 'LinkedIn Profile URL' : 'رابط الملف الشخصي لينكد إن',
    youtubeLabel: lang === 'en' ? 'YouTube Channel URL' : 'رابط قناة يوتيوب',
    instagramLabel: lang === 'en' ? 'Instagram Profile URL' : 'رابط حساب إنستغرام',
    whatsappLabel: lang === 'en' ? 'WhatsApp Direct Link' : 'رابط الواتساب المباشر',
    socialTitle: lang === 'en' ? 'Social Channels' : 'حسابات التواصل الاجتماعي',
    saveSettingsBtn: lang === 'en' ? 'Save All Configurations' : 'حفظ جميع الإعدادات',
    saveSettingsAlert: lang === 'en' ? 'Site settings updated successfully!' : 'تم حفظ الإعدادات وتحديث الموقع!',
    noBookings: lang === 'en' ? 'No bookings matched your search query.' : 'لا توجد حجوزات تطابق البحث.',
    confirmDeleteBooking: lang === 'en' ? 'Permanently delete this booking record?' : 'حذف هذا الحجز بشكل نهائي؟',
    confirmCompleteBooking: lang === 'en' ? 'Mark this consultation as completed?' : 'تأكيد إتمام هذه الاستشارة؟',
    promptScheduleMsg: lang === 'en' ? 'Enter online meeting link or location details:' : 'أدخل رابط الاجتماع أو تفاصيل الموقع:',
    alertScheduleMsg: lang === 'en' ? 'Client scheduled! details sent:' : 'تمت الجدولة! وإرسال التفاصيل:',
    statusPending: lang === 'en' ? 'Pending Review' : 'قيد المراجعة',
    statusScheduled: lang === 'en' ? 'Scheduled' : 'تمت الجدولة',
    statusCompleted: lang === 'en' ? 'Completed' : 'مكتمل',
    btnSchedule: lang === 'en' ? 'Schedule' : 'جدولة',
    btnComplete: lang === 'en' ? 'Complete' : 'إكمال',
    noContacts: lang === 'en' ? 'No client messages matched your search query.' : 'لا توجد رسائل تطابق البحث.',
    confirmDeleteMsg: lang === 'en' ? 'Permanently delete this message?' : 'حذف هذه الرسالة نهائياً؟',
    btnMarkRead: lang === 'en' ? 'Mark Read' : 'مقروء',
    btnDelete: lang === 'en' ? 'Delete' : 'حذف',
    searchPlaceholder: lang === 'en' ? 'Search by name, email, ref...' : 'البحث بالاسم، البريد، الرمز...'
  };

  const getBookingTypeText = (type) => {
    if (type === 'in-person') return lang === 'en' ? 'In-Person Consultation' : 'استشارة حضورية';
    if (type === 'online') return lang === 'en' ? 'Online Video Meeting' : 'اجتماع مرئي أونلاين';
    if (type === 'text') return lang === 'en' ? 'Written Legal Advisory' : 'استشارة مكتوبة';
    return type;
  };

  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending Review' || b.status === 'Paid & Pending Review').length;
  const unreadMessagesCount = contacts.filter(c => !c.read).length;
  const totalArticlesCount = articles.length;

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const validation = sanitizeAndValidateSettings({ ...settingsForm });
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }
    const s = validation.sanitized;
    onSaveSettings(
      { 
        phone: s.phone, 
        email: s.email, 
        hoursEn: s.hoursEn, 
        hoursAr: s.hoursAr,
        linkedin: s.linkedin,
        youtube: s.youtube,
        instagram: s.instagram,
        whatsapp: s.whatsapp
      },
      { textEn: s.announceEn, textAr: s.announceAr, visible: s.announceVisible }
    );
    showToast(t.saveSettingsAlert, 'success');
  };

  const handleAnnounceVisibleChange = (e) => {
    const isChecked = e.target.checked;
    setSettingsForm(prev => ({ ...prev, announceVisible: isChecked }));
    onToggleAnnouncementVisibility(isChecked);
  };

  const handleScheduleClick = (bookingId) => {
    showPrompt(
      t.promptScheduleMsg,
      lang === 'en' ? 'Meeting link / location details' : 'تفاصيل الموعد ورابط الاجتماع',
      lang === 'en' ? 'Schedule Booking' : 'جدولة الموعد',
      (details) => {
        if (details && details.trim() !== '') {
          onScheduleBooking(bookingId, details.trim());
          showToast(`${t.alertScheduleMsg} ${details.trim()}`, 'success');
        }
      }
    );
  };

  const handleCompleteClick = (bookingId) => {
    showConfirm(
      t.confirmCompleteBooking,
      lang === 'en' ? 'Complete Appointment' : 'إتمام الموعد',
      () => onCompleteBooking(bookingId)
    );
  };

  const handleDeleteBookingClick = (bookingId) => {
    showConfirm(
      t.confirmDeleteBooking,
      lang === 'en' ? 'Delete Record' : 'حذف السجل',
      () => onDeleteBooking(bookingId)
    );
  };

  const handleDeleteContactClick = (contactId) => {
    showConfirm(
      t.confirmDeleteMsg,
      lang === 'en' ? 'Delete Message' : 'حذف الرسالة',
      () => onDeleteContact(contactId)
    );
  };

  const handleCoverSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const compressed = await compressImage(file);
      setPublishingForm(prev => ({ ...prev, coverImage: compressed }));
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPublishingForm(prev => ({ ...prev, video: url, videoName: file.name }));
    }
  };

  const handleAttachmentsSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        newAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result
        });
        if (newAttachments.length === files.length) {
          setPublishingForm(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
        }
      };
    });
  };

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    const validation = validateAdminArticle(publishingForm);
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }
    const newArticle = {
      id: Date.now(),
      ...validation.sanitized,
      coverImage: publishingForm.coverImage,
      video: publishingForm.video,
      videoName: publishingForm.videoName,
      attachments: publishingForm.attachments,
      date: new Date().toISOString().split('T')[0]
    };
    onPublishArticle(newArticle);
    showToast(lang === 'en' ? 'Article published successfully!' : 'تم نشر المقال بنجاح!', 'success');
    setPublishingForm({
      titleEn: '',
      titleAr: '',
      contentEn: '',
      contentAr: '',
      coverImage: '',
      video: '',
      videoName: '',
      attachments: []
    });
  };

  const handleEditStart = (art) => {
    setEditingArticle({
      id: art.id,
      form: {
        titleEn: art.titleEn || '',
        titleAr: art.titleAr || '',
        contentEn: art.contentEn || '',
        contentAr: art.contentAr || '',
        coverImage: art.coverImage || '',
      }
    });
  };

  const handleEditCoverSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const compressed = await compressImage(file);
      setEditingArticle(prev => ({ ...prev, form: { ...prev.form, coverImage: compressed } }));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const validation = validateAdminArticle(editingArticle.form);
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }
    onUpdateArticle(editingArticle.id, {
      ...validation.sanitized,
      coverImage: editingArticle.form.coverImage
    });
    showToast(lang === 'en' ? 'Article updated successfully!' : 'تم تحديث المقال بنجاح!', 'success');
    setEditingArticle(null);
  };

  // Filters
  const filteredBookings = bookings.filter(b => 
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.phone?.includes(searchQuery)
  );

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSidebarOpen(false);
  };

  return (
    <section id="admin-portal" className="admin-container">

      {/* ── Mobile Overlay Backdrop ── */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Top Bar ── */}
      <div className="admin-mobile-bar">
        <button
          className="admin-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo-white-symbol.png" alt="SANAD" className="w-7 h-7 object-contain" />
          <span className="text-white text-sm font-bold tracking-wide">{t.title}</span>
        </div>
        <div className="w-8" />{/* spacer */}
      </div>

      {/* ── Sidebar Navigation ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="admin-sidebar-inner">
          {/* Logo Branding */}
          <div className="admin-sidebar-logo">
            <div className="admin-logo-icon-wrap">
              <img src="/logo-white-symbol.png" alt="SANAD" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h2 className="admin-brand-name">{t.title}</h2>
              <span className="admin-brand-sub">SANAD Consulting</span>
            </div>
            {/* Close button on mobile */}
            <button
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="admin-nav-list">
            <button
              onClick={() => handleNavClick('admin-stats-settings')}
              className={`admin-nav-item ${activeTab === 'admin-stats-settings' ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{t.tabStats}</span>
            </button>
            <button
              onClick={() => handleNavClick('admin-appointments')}
              className={`admin-nav-item ${activeTab === 'admin-appointments' ? 'active' : ''}`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{t.tabAppointments}</span>
            </button>
            <button
              onClick={() => handleNavClick('admin-contacts')}
              className={`admin-nav-item ${activeTab === 'admin-contacts' ? 'active' : ''}`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>{t.tabContacts}</span>
            </button>
            <button
              onClick={() => handleNavClick('admin-publishing')}
              className={`admin-nav-item ${activeTab === 'admin-publishing' ? 'active' : ''}`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t.tabPublishing}</span>
            </button>
          </div>
        </div>

        {/* Profile / Logout Bottom Block */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Administrator</span>
              <span className="text-[10px] text-slate-400 block">role: admin</span>
            </div>
          </div>
          <button onClick={onLogout} className="admin-nav-item admin-logout-btn">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel Content ── */}
      <main className="admin-main">
        
        {/* Main Dashboard Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'admin-stats-settings' && t.tabStats}
              {activeTab === 'admin-appointments' && t.tabAppointments}
              {activeTab === 'admin-contacts' && t.tabContacts}
              {activeTab === 'admin-publishing' && t.tabPublishing}
            </h1>
            <span className="text-xs text-slate-500">
              {activeTab === 'admin-stats-settings' && 'Control configurations, socials, and metrics.'}
              {activeTab === 'admin-appointments' && 'Manage schedules, briefs, and client links.'}
              {activeTab === 'admin-contacts' && 'Read and response to inbound customer queries.'}
              {activeTab === 'admin-publishing' && 'Write and publish legal advice or corporate posts.'}
            </span>
          </div>

          {/* Quick Search Widget */}
          {activeTab !== 'admin-stats-settings' && (
            <div className="search-wrapper">
              <Search className="search-icon-pos w-4 h-4" />
              <input 
                type="text" 
                className="admin-input" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ══ TAB 1: Stats & Settings ══ */}
        {activeTab === 'admin-stats-settings' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Analytics Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="admin-stat-card border-l-4 border-[#4c6cd0]">
                <div className="p-3 rounded-lg bg-[#4c6cd0]/5 text-[#4c6cd0]"><Calendar className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{t.statBookings}</span>
                  <span className="text-2xl font-extrabold text-slate-900 block mt-1">{totalBookingsCount}</span>
                </div>
              </div>
              <div className="admin-stat-card border-l-4 border-amber-500">
                <div className="p-3 rounded-lg bg-amber-500/5 text-amber-500"><Clock className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{t.statPending}</span>
                  <span className="text-2xl font-extrabold text-slate-900 block mt-1">{pendingBookingsCount}</span>
                </div>
              </div>
              <div className="admin-stat-card border-l-4 border-emerald-500">
                <div className="p-3 rounded-lg bg-emerald-500/5 text-emerald-500"><Mail className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{lang === 'en' ? 'Unread Messages' : 'رسائل غير مقروءة'}</span>
                  <span className="text-2xl font-extrabold text-slate-900 block mt-1">{unreadMessagesCount}</span>
                </div>
              </div>
              <div className="admin-stat-card border-l-4 border-indigo-500">
                <div className="p-3 rounded-lg bg-indigo-500/5 text-indigo-500"><BookOpen className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{lang === 'en' ? 'Total Articles' : 'المقالات المنشورة'}</span>
                  <span className="text-2xl font-extrabold text-slate-900 block mt-1">{totalArticlesCount}</span>
                </div>
              </div>
            </div>

            {/* Global Settings Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card A: Office & Hours */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#4c6cd0]" />
                  {t.editSiteSettings}
                </h3>
                <form id="site-settings-form-1" onSubmit={handleSettingsSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t.phoneLabel}</label>
                      <input className="admin-input" type="text" value={settingsForm.phone}
                        onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t.emailLabel}</label>
                      <input className="admin-input" type="email" value={settingsForm.email}
                        onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700">{t.hoursEnLabel}</label>
                        {settingsForm.hoursAr && (
                          <button 
                            type="button" 
                            onClick={async () => {
                              try {
                                const trans = await translateText(settingsForm.hoursAr);
                                setSettingsForm(prev => ({ ...prev, hoursEn: trans }));
                                showToast(lang === 'en' ? 'Translated!' : 'تمت الترجمة!', 'success');
                              } catch (e) {
                                showToast(lang === 'en' ? 'Failed.' : 'فشلت.', 'error');
                              }
                            }}
                            className="text-[10px] text-[#4c6cd0] font-bold hover:underline bg-none border-none cursor-pointer"
                          >
                            ✨ Translate
                          </button>
                        )}
                      </div>
                      <input className="admin-input" type="text" value={settingsForm.hoursEn}
                        onChange={e => setSettingsForm({ ...settingsForm, hoursEn: e.target.value })} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t.hoursArLabel}</label>
                      <input className="admin-input" type="text" value={settingsForm.hoursAr}
                        onChange={e => setSettingsForm({ ...settingsForm, hoursAr: e.target.value })} required />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-sm font-bold shadow-sm transition-all duration-300">
                    {t.saveSettingsBtn}
                  </button>
                </form>
              </div>

              {/* Card B: Announcement & Socials */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#4c6cd0]" />
                  {t.announceTitle} & {t.socialTitle}
                </h3>
                
                <form id="site-settings-form-2" onSubmit={handleSettingsSubmit} className="flex flex-col gap-5">
                  {/* Announcement Section */}
                  <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="settings-announce-visible" 
                        checked={settingsForm.announceVisible}
                        onChange={handleAnnounceVisibleChange}
                        className="w-4 h-4 text-[#4c6cd0] border-slate-300 rounded"
                      />
                      <label htmlFor="settings-announce-visible" className="text-xs font-semibold text-slate-700 cursor-pointer">{t.announceEnableLabel}</label>
                    </div>

                    {settingsForm.announceVisible && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-semibold text-slate-500">{t.announceEnLabel}</label>
                            {settingsForm.announceAr && (
                              <button 
                                type="button" 
                                onClick={async () => {
                                  try {
                                    const trans = await translateText(settingsForm.announceAr);
                                    setSettingsForm(prev => ({ ...prev, announceEn: trans }));
                                    showToast(lang === 'en' ? 'Translated!' : 'تمت الترجمة!', 'success');
                                  } catch (e) {
                                    showToast(lang === 'en' ? 'Failed.' : 'فشلت.', 'error');
                                  }
                                }}
                                className="text-[9px] text-[#4c6cd0] font-bold hover:underline"
                              >
                                ✨ Translate
                              </button>
                            )}
                          </div>
                          <input className="admin-input" type="text" value={settingsForm.announceEn}
                            onChange={e => setSettingsForm({ ...settingsForm, announceEn: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-slate-500">{t.announceArLabel}</label>
                          <input className="admin-input" type="text" value={settingsForm.announceAr}
                            onChange={e => setSettingsForm({ ...settingsForm, announceAr: e.target.value })} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Channels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t.linkedinLabel}</label>
                      <input className="admin-input" type="url" value={settingsForm.linkedin}
                        onChange={e => setSettingsForm({ ...settingsForm, linkedin: e.target.value })} placeholder="https://linkedin.com/..." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t.instagramLabel}</label>
                      <input className="admin-input" type="url" value={settingsForm.instagram}
                        onChange={e => setSettingsForm({ ...settingsForm, instagram: e.target.value })} placeholder="https://instagram.com/..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t.youtubeLabel}</label>
                      <input className="admin-input" type="url" value={settingsForm.youtube}
                        onChange={e => setSettingsForm({ ...settingsForm, youtube: e.target.value })} placeholder="https://youtube.com/..." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t.whatsappLabel}</label>
                      <input className="admin-input" type="text" value={settingsForm.whatsapp}
                        onChange={e => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })} placeholder="Link or phone" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-sm font-bold shadow-sm transition-all duration-300">
                    {t.saveSettingsBtn}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ══ TAB 2: Appointments ══ */}
        {activeTab === 'admin-appointments' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-slate-900 font-bold">{lang === 'en' ? 'No appointments found' : 'لا توجد مواعيد حالياً'}</h4>
                <p className="text-xs text-slate-500 mt-1">{t.noBookings}</p>
              </div>
            ) : (
              filteredBookings.map(b => (
                <div key={b.id} className="admin-feed-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-950">{b.name}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono" dir="ltr">Ref: {b.ref}</span>
                      
                      {/* Status Pills */}
                      {b.status === 'Pending Review' || b.status === 'Paid & Pending Review' ? (
                        <span className="status-pill status-pill-pending">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          {t.statusPending}
                        </span>
                      ) : b.status === 'Scheduled' ? (
                        <span className="status-pill status-pill-scheduled">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {t.statusScheduled}
                        </span>
                      ) : (
                        <span className="status-pill status-pill-completed">
                          <Check className="w-3 h-3 text-emerald-500" />
                          {t.statusCompleted}
                        </span>
                      )}
                    </div>
                    
                    {/* Contacts & Meta */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> <a href={`mailto:${b.email}`} className="hover:underline text-slate-600">{b.email}</a></span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> <span dir="ltr">{b.phone}</span></span>
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-[#4c6cd0]" /> <span className="font-semibold text-slate-600">{getBookingTypeText(b.type)}</span></span>
                    </div>

                    {/* Brief notes */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-2 text-xs text-slate-700 max-w-2xl leading-relaxed">
                      <strong>{lang === 'en' ? 'Brief Description:' : 'نبذة عن الاستشارة:'}</strong> {b.brief}
                    </div>

                    {/* Scheduled Link Details */}
                    {b.meetingDetails && (
                      <div className="bg-[#4c6cd0]/5 border border-[#4c6cd0]/10 rounded-lg p-3 text-xs text-[#4c6cd0] max-w-2xl leading-relaxed flex items-start gap-2">
                        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>{lang === 'en' ? 'Meeting Details:' : 'تفاصيل الموعد:'}</strong> {b.meetingDetails}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking Action Buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                    {b.status === 'Pending Review' || b.status === 'Paid & Pending Review' ? (
                      <button 
                        onClick={() => handleScheduleClick(b.id)}
                        className="px-4 py-2 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {t.btnSchedule}
                      </button>
                    ) : b.status === 'Scheduled' ? (
                      <button 
                        onClick={() => handleCompleteClick(b.id)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.btnComplete}
                      </button>
                    ) : null}

                    <button 
                      onClick={() => handleDeleteBookingClick(b.id)}
                      className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.btnDelete}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ TAB 3: Messages ══ */}
        {activeTab === 'admin-contacts' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {filteredContacts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-slate-900 font-bold">{lang === 'en' ? 'No messages found' : 'لا توجد رسائل'}</h4>
                <p className="text-xs text-slate-500 mt-1">{t.noContacts}</p>
              </div>
            ) : (
              filteredContacts.map(c => (
                <div key={c.id} className="admin-feed-card flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-950">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{c.date || 'Recent'}</span>
                      {/* Read status pill */}
                      {c.read ? (
                        <span className="status-pill status-pill-read">{lang === 'en' ? 'Processed' : 'تمت معالجتها'}</span>
                      ) : (
                        <span className="status-pill status-pill-unread">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                          {lang === 'en' ? 'New Message' : 'رسالة جديدة'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> <a href={`mailto:${c.email}`} className="hover:underline text-slate-600">{c.email}</a></span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> <span dir="ltr">{c.phone}</span></span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mt-2 text-xs text-slate-700 leading-relaxed font-sans">
                      {c.message}
                    </div>
                  </div>

                  {/* Message actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                    {!c.read && (
                      <button 
                        onClick={() => onMarkContactRead(c.id, { read: true })}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.btnMarkRead}
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteContactClick(c.id)}
                      className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.btnDelete}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ TAB 4: Publishing CMS ══ */}
        {activeTab === 'admin-publishing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            
            {/* Publisher Block Form */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#4c6cd0]" />
                  {lang === 'en' ? 'Publish New Article' : 'نشر مقال جديد'}
                </h3>
                {/* CMS Tab Switcher */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button 
                    type="button" 
                    onClick={() => setCmsFormTab('ar')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${cmsFormTab === 'ar' ? 'bg-white text-[#4c6cd0] shadow-sm' : 'text-slate-500'}`}
                  >
                    عربي
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCmsFormTab('en')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${cmsFormTab === 'en' ? 'bg-white text-[#4c6cd0] shadow-sm' : 'text-slate-500'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <form onSubmit={handlePublishSubmit} className="flex flex-col gap-4">
                
                {/* ARABIC DETAILS FORM PANEL */}
                {cmsFormTab === 'ar' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Title (Arabic) *' : 'العنوان (عربي) *'}</label>
                      <input className="admin-input" type="text" value={publishingForm.titleAr}
                        onChange={e => setPublishingForm({ ...publishingForm, titleAr: e.target.value })} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Content (Arabic) *' : 'المحتوى (عربي) *'}</label>
                      <textarea className="admin-input min-h-[140px] resize-vertical" value={publishingForm.contentAr}
                        onChange={e => setPublishingForm({ ...publishingForm, contentAr: e.target.value })} required />
                    </div>
                  </div>
                )}

                {/* ENGLISH DETAILS FORM PANEL */}
                {cmsFormTab === 'en' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Title (English) *' : 'العنوان (إنجليزي) *'}</label>
                        {publishingForm.titleAr && (
                          <button 
                            type="button" 
                            onClick={async () => {
                              try {
                                const trans = await translateText(publishingForm.titleAr);
                                setPublishingForm(prev => ({ ...prev, titleEn: trans }));
                                showToast(lang === 'en' ? 'Translated!' : 'تمت الترجمة!', 'success');
                              } catch (e) {
                                showToast(lang === 'en' ? 'Failed.' : 'فشلت.', 'error');
                              }
                            }}
                            className="text-[10px] text-[#4c6cd0] font-bold hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            {lang === 'en' ? '✨ Auto-translate from Arabic' : '✨ ترجمة تلقائية من العربية'}
                          </button>
                        )}
                      </div>
                      <input className="admin-input" type="text" value={publishingForm.titleEn}
                        onChange={e => setPublishingForm({ ...publishingForm, titleEn: e.target.value })} required />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Content (English) *' : 'المحتوى (إنجليزي) *'}</label>
                        {publishingForm.contentAr && (
                          <button 
                            type="button" 
                            onClick={async () => {
                              try {
                                const trans = await translateText(publishingForm.contentAr);
                                setPublishingForm(prev => ({ ...prev, contentEn: trans }));
                                showToast(lang === 'en' ? 'Translated!' : 'تمت الترجمة!', 'success');
                              } catch (e) {
                                showToast(lang === 'en' ? 'Failed.' : 'فشلت.', 'error');
                              }
                            }}
                            className="text-[10px] text-[#4c6cd0] font-bold hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            {lang === 'en' ? '✨ Auto-translate from Arabic' : '✨ ترجمة تلقائية من العربية'}
                          </button>
                        )}
                      </div>
                      <textarea className="admin-input min-h-[140px] resize-vertical" value={publishingForm.contentEn}
                        onChange={e => setPublishingForm({ ...publishingForm, contentEn: e.target.value })} required />
                    </div>
                  </div>
                )}

                {/* Hidden File pickers */}
                <input type="file" id="cover-picker" accept="image/*" onChange={handleCoverSelect} style={{ display: 'none' }} />
                <input type="file" id="video-picker" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
                <input type="file" id="doc-picker" multiple onChange={handleAttachmentsSelect} style={{ display: 'none' }} />

                {/* Styled attachment trigger buttons */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => document.getElementById('cover-picker').click()}
                    className="px-3.5 py-2 rounded-lg bg-[#4c6cd0]/10 hover:bg-[#4c6cd0]/15 text-[#4c6cd0] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#4c6cd0]/10"
                  >
                    <Image className="w-4 h-4" />
                    {lang === 'en' ? 'Add Cover Photo' : 'إضافة صورة غلاف'}
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('video-picker').click()}
                    className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-500/10"
                  >
                    <Video className="w-4 h-4" />
                    {lang === 'en' ? 'Add Video Clip' : 'إضافة فيديو'}
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('doc-picker').click()}
                    className="px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-500/10"
                  >
                    <Paperclip className="w-4 h-4" />
                    {lang === 'en' ? 'Attach PDF/Docs' : 'إرفاق مستندات'}
                  </button>
                </div>

                {/* Previews panel */}
                {(publishingForm.coverImage || publishingForm.video || publishingForm.attachments.length > 0) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-2 flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Upload Queue Previews</span>
                    
                    {publishingForm.coverImage && (
                      <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                        <img src={publishingForm.coverImage} alt="Cover" className="w-12 h-8 object-cover rounded" />
                        <span className="text-[11px] text-slate-500 flex-grow font-semibold">Cover image loaded</span>
                        <button type="button" onClick={() => setPublishingForm(prev => ({ ...prev, coverImage: '' }))} className="text-red-500 text-sm hover:scale-105 transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    )}

                    {publishingForm.video && (
                      <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                        <Video className="w-4 h-4 text-amber-500" />
                        <span className="text-[11px] text-slate-500 flex-grow truncate font-semibold">{publishingForm.videoName}</span>
                        <button type="button" onClick={() => setPublishingForm(prev => ({ ...prev, video: '', videoName: '' }))} className="text-red-500 text-sm hover:scale-105 transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    )}

                    {publishingForm.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                        <Paperclip className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] text-slate-500 flex-grow truncate font-semibold">{file.name}</span>
                        <button type="button" onClick={() => setPublishingForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:scale-105 transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="w-full py-3 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-xs font-bold tracking-wider uppercase shadow-sm transition-all duration-300 mt-2">
                  {lang === 'en' ? 'Publish Article Post' : 'نشر المقال على الموقع'}
                </button>
              </form>
            </div>

            {/* Published Articles list block */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4c6cd0]" />
                {lang === 'en' ? 'Manage Published Posts' : 'إدارة مقالات التحرير'}
              </h3>

              <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
                {articles.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span className="text-xs">{lang === 'en' ? 'No articles published.' : 'لا توجد مقالات منشورة.'}</span>
                  </div>
                ) : (
                  articles.map(art => (
                    <div key={art.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50">
                      {art.coverImage ? (
                        <img src={art.coverImage} alt="Article cover" className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 flex-shrink-0">📰</div>
                      )}
                      
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{lang === 'en' ? art.titleEn : art.titleAr}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{art.date}</span>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button 
                          onClick={() => handleEditStart(art)}
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-[#4c6cd0] transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            showConfirm(
                              lang === 'en' ? 'Delete this article post forever?' : 'هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً؟',
                              lang === 'en' ? 'Delete Article' : 'حذف المقال',
                              () => onDeleteArticle(art.id)
                            );
                          }}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Edit Article Modal Panel (Overlay) */}
            {editingArticle && (
              <div className="modal-overlay custom-dialog-overlay" style={{ zIndex: 9999 }}>
                <div className="modal-container custom-dialog-card max-w-[620px] w-full p-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#4c6cd0]" />
                      {lang === 'en' ? 'Edit Published Article' : 'تعديل المقال المنشور'}
                    </h3>
                    <button onClick={() => setEditingArticle(null)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Title (English) *' : 'العنوان (إنجليزي) *'}</label>
                          {editingArticle.form.titleAr && (
                            <button 
                              type="button" 
                              onClick={async () => {
                                try {
                                  const trans = await translateText(editingArticle.form.titleAr);
                                  setEditingArticle(p => ({ ...p, form: { ...p.form, titleEn: trans } }));
                                  showToast(lang === 'en' ? 'Translated!' : 'تمت الترجمة!', 'success');
                                } catch (e) {
                                  showToast(lang === 'en' ? 'Failed.' : 'فشلت.', 'error');
                                }
                              }}
                              className="text-[9px] text-[#4c6cd0] font-bold hover:underline"
                            >
                              ✨ Translate
                            </button>
                          )}
                        </div>
                        <input className="admin-input" type="text" value={editingArticle.form.titleEn}
                          onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, titleEn: e.target.value } }))} required />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Title (Arabic) *' : 'العنوان (عربي) *'}</label>
                        <input className="admin-input" type="text" value={editingArticle.form.titleAr}
                          onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, titleAr: e.target.value } }))} required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Content (English) *' : 'المحتوى (إنجليزي) *'}</label>
                        {editingArticle.form.contentAr && (
                          <button 
                            type="button" 
                            onClick={async () => {
                              try {
                                const trans = await translateText(editingArticle.form.contentAr);
                                setEditingArticle(p => ({ ...p, form: { ...p.form, contentEn: trans } }));
                                showToast(lang === 'en' ? 'Translated!' : 'تمت الترجمة!', 'success');
                              } catch (e) {
                                showToast(lang === 'en' ? 'Failed.' : 'فشلت.', 'error');
                              }
                            }}
                            className="text-[9px] text-[#4c6cd0] font-bold hover:underline"
                          >
                            ✨ Translate
                          </button>
                        )}
                      </div>
                      <textarea className="admin-input min-h-[120px] resize-vertical" value={editingArticle.form.contentEn}
                        onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, contentEn: e.target.value } }))} required />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">{lang === 'en' ? 'Content (Arabic) *' : 'المحتوى (عربي) *'}</label>
                      <textarea className="admin-input min-h-[120px] resize-vertical" value={editingArticle.form.contentAr}
                        onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, contentAr: e.target.value } }))} required />
                    </div>

                    {/* Change Cover image */}
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      {editingArticle.form.coverImage && (
                        <img src={editingArticle.form.coverImage} alt="Preview" className="w-16 h-10 object-cover rounded-lg border border-slate-300" />
                      )}
                      <div className="flex flex-col gap-1">
                        <input type="file" id="edit-cover-picker-modal" accept="image/*" onChange={handleEditCoverSelect} style={{ display: 'none' }} />
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('edit-cover-picker-modal').click()}
                          className="px-3 py-1.5 rounded-lg bg-[#4c6cd0]/10 hover:bg-[#4c6cd0]/15 text-[#4c6cd0] text-[11px] font-bold transition-all border border-[#4c6cd0]/10"
                        >
                          🖼️ {lang === 'en' ? 'Change Cover Photo' : 'تغيير صورة الغلاف'}
                        </button>
                      </div>
                    </div>

                    {/* Dialog actions */}
                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingArticle(null)}
                        className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
                      >
                        {lang === 'en' ? 'Cancel' : 'إلغاء'}
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-xs font-bold transition-all shadow-sm"
                      >
                        {lang === 'en' ? 'Save Article' : 'حفظ المقال'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </section>
  );
}
