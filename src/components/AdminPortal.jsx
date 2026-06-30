import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { validateAdminArticle, sanitizeAndValidateSettings } from '../utils/validation';


// Stat Card component
function StatCard({ label, value, accent = '#4c6cd0' }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '14px',
      padding: '1.6rem 2rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${accent}`,
      transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(76,108,208,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)'; }}
    >
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', fontFamily: 'inherit', lineHeight: 1 }}>{value}</p>
    </div>
  );
}
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

  const [publishingForm, setPublishingForm] = useState({
    titleEn: '',
    titleAr: '',
    categoryEn: 'General',
    categoryAr: 'عام',
    contentEn: '',
    contentAr: '',
    coverImage: '',
    video: '',
    videoName: '',
    attachments: []
  });



  const handleCoverSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        setPublishingForm(prev => ({ ...prev, coverImage: compressed }));
      } else {
        showToast(lang === 'en' ? 'Please select a valid image file.' : 'يرجى تحديد ملف صورة صالح.', 'error');
      }
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setPublishingForm(prev => ({ ...prev, video: url, videoName: file.name }));
      } else {
        showToast(lang === 'en' ? 'Please select a valid video file.' : 'يرجى تحديد ملف فيديو صالح.', 'error');
      }
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
          setPublishingForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments]
          }));
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

    setPublishingForm({
      titleEn: '',
      titleAr: '',
      categoryEn: 'General',
      categoryAr: 'عام',
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
        categoryEn: art.categoryEn || 'General',
        categoryAr: art.categoryAr || 'عام',
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
    setEditingArticle(null);
  };

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
    title: lang === 'en' ? 'Admin Dashboard' : 'لوحة تحكم الإدارة',
    logout: lang === 'en' ? 'Logout' : 'تسجيل الخروج',
    tabStats: lang === 'en' ? 'Stats & Settings' : 'الإحصائيات والإعدادات',
    tabAppointments: lang === 'en' ? 'Appointments' : 'المواعيد',
    tabContacts: lang === 'en' ? 'Messages' : 'الرسائل',
    statBookings: lang === 'en' ? 'Total Bookings' : 'إجمالي الحجوزات',
    statPending: lang === 'en' ? 'Pending Review' : 'قيد المراجعة',
    editSiteSettings: lang === 'en' ? 'Site Settings' : 'إعدادات الموقع',
    phoneLabel: lang === 'en' ? 'Office Phone' : 'هاتف المكتب',
    emailLabel: lang === 'en' ? 'Office Email' : 'البريد الإلكتروني',
    hoursEnLabel: lang === 'en' ? 'Business Hours (EN)' : 'ساعات العمل (إنجليزي)',
    hoursArLabel: lang === 'en' ? 'Business Hours (AR)' : 'ساعات العمل (عربي)',
    announceTitle: lang === 'en' ? 'Announcement Bar' : 'شريط الإعلانات',
    announceEnLabel: lang === 'en' ? 'Text (EN)' : 'نص الإعلان (إنجليزي)',
    announceArLabel: lang === 'en' ? 'Text (AR)' : 'نص الإعلان (عربي)',
    announceEnableLabel: lang === 'en' ? 'Show Announcement Bar on Website' : 'إظهار شريط الإعلانات',
    linkedinLabel: lang === 'en' ? 'LinkedIn URL' : 'رابط لينكد إن',
    youtubeLabel: lang === 'en' ? 'YouTube URL' : 'رابط يوتيوب',
    instagramLabel: lang === 'en' ? 'Instagram URL' : 'رابط إنستغرام',
    whatsappLabel: lang === 'en' ? 'WhatsApp URL / Number' : 'رابط / رقم الواتساب',
    socialTitle: lang === 'en' ? 'Social Media Links' : 'روابط التواصل الاجتماعي',
    saveSettingsBtn: lang === 'en' ? 'Save Settings' : 'حفظ الإعدادات',
    saveSettingsAlert: lang === 'en' ? 'Settings saved successfully!' : 'تم حفظ الإعدادات بنجاح!',
    thClient: lang === 'en' ? 'Client' : 'العميل',
    thContact: lang === 'en' ? 'Contact' : 'التواصل',
    thType: lang === 'en' ? 'Type' : 'النوع',
    thBrief: lang === 'en' ? 'Brief' : 'النبذة',
    thStatus: lang === 'en' ? 'Status' : 'الحالة',
    thAction: lang === 'en' ? 'Action' : 'الإجراء',
    noBookings: lang === 'en' ? 'No bookings yet.' : 'لا توجد حجوزات.',
    confirmDeleteBooking: lang === 'en' ? 'Delete this booking record?' : 'حذف هذا الحجز؟',
    confirmCompleteBooking: lang === 'en' ? 'Mark as completed?' : 'تأكيد إتمام الاستشارة؟',
    promptScheduleMsg: lang === 'en' ? 'Enter meeting link or appointment details:' : 'أدخل رابط الاجتماع أو تفاصيل الموعد:',
    alertScheduleMsg: lang === 'en' ? 'Client notified with details:' : 'تم إبلاغ العميل بالتفاصيل:',
    statusPending: lang === 'en' ? 'Pending Review' : 'قيد المراجعة',
    statusScheduled: lang === 'en' ? 'Scheduled' : 'تمت الجدولة',
    statusCompleted: lang === 'en' ? 'Completed' : 'مكتمل',
    btnSchedule: lang === 'en' ? 'Schedule' : 'جدولة',
    btnComplete: lang === 'en' ? 'Complete' : 'إكمال',
    thPhoneEmail: lang === 'en' ? 'Phone & Email' : 'الهاتف والبريد',
    thDateStatus: lang === 'en' ? 'Date & Status' : 'التاريخ والحالة',
    thMessage: lang === 'en' ? 'Message' : 'الرسالة',
    noContacts: lang === 'en' ? 'No messages yet.' : 'لا توجد رسائل.',
    confirmDeleteMsg: lang === 'en' ? 'Delete this message?' : 'حذف هذه الرسالة؟',
    btnMarkRead: lang === 'en' ? 'Mark Read' : 'تمييز كمقروء',
    btnDelete: lang === 'en' ? 'Delete' : 'حذف',
  };

  const getBookingTypeText = (type) => {
    if (type === 'in-person') return lang === 'en' ? 'In-Person' : 'حضوري';
    if (type === 'online') return lang === 'en' ? 'Online' : 'أونلاين';
    if (type === 'text') return lang === 'en' ? 'Written' : 'مكتوب';
    return type;
  };

  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending Review' || b.status === 'Paid & Pending Review').length;

  const handleSettingsSubmit = (e) => {
    e.preventDefault();

    const validation = sanitizeAndValidateSettings({
      ...settingsForm
    });

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
    showToast(t.saveSettingsAlert);
  };

  const handleAnnounceVisibleChange = (e) => {
    const isChecked = e.target.checked;
    setSettingsForm(prev => ({ ...prev, announceVisible: isChecked }));
    onToggleAnnouncementVisibility(isChecked);
  };

  const handleScheduleClick = (bookingId) => {
    showPrompt(
      t.promptScheduleMsg,
      lang === 'en' ? 'Meeting link or details' : 'تفاصيل الموعد أو رابط الاجتماع',
      lang === 'en' ? 'Schedule Appointment' : 'جدولة الموعد',
      (details) => {
        if (details && details.trim() !== '') {
          onScheduleBooking(bookingId, details.trim());
          showToast(`${t.alertScheduleMsg} ${details.trim()}`);
        }
      }
    );
  };
  const handleCompleteClick = (bookingId) => {
    showConfirm(
      t.confirmCompleteBooking,
      lang === 'en' ? 'Complete Consultation' : 'تأكيد إتمام الاستشارة',
      () => onCompleteBooking(bookingId)
    );
  };
  const handleDeleteBookingClick = (bookingId) => {
    showConfirm(
      t.confirmDeleteBooking,
      lang === 'en' ? 'Delete Booking Record' : 'حذف سجل الحجز',
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

  // Shared styles
  const S = {
    inputGroup: { marginBottom: '1.4rem' },
    label: { display: 'block', marginBottom: '0.45rem', color: '#1e293b', fontWeight: 600, fontSize: '0.875rem' },
    input: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', background: '#faf8f4', color: '#1e293b', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
    card: { background: '#ffffff', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginBottom: '1.5rem' },
    actionBtn: { background: '#4c6cd0', color: '#fff', border: 'none', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginRight: '0.4rem', transition: 'background 0.2s, transform 0.15s' },
    deleteBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginRight: '0.4rem', transition: 'background 0.2s' },
    successBtn: { background: '#dcfce7', color: '#16a34a', border: 'none', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginRight: '0.4rem', transition: 'background 0.2s' },
    subsectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#4c6cd0', margin: '2rem 0 1rem', paddingBottom: '0.5rem', borderBottom: '1.5px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  };

  const tabs = [
    { id: 'admin-stats-settings', label: t.tabStats },
    { id: 'admin-appointments', label: t.tabAppointments },
    { id: 'admin-contacts', label: t.tabContacts },
    { id: 'admin-publishing', label: lang === 'en' ? 'Publishing' : 'النشر' },
  ];

  return (
    <section id="admin-portal" style={{ background: '#faf8f4', minHeight: '100vh', paddingTop: '5rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── Branded Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: '#4c6cd0', borderRadius: '18px', padding: '1.5rem 2rem', boxShadow: '0 4px 24px rgba(76,108,208,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.6rem' }}>
              <img src="/logo-white-symbol.png" alt="SANAD Symbol" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <div>
              <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{t.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', margin: 0, marginTop: '0.15rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>SANAD Consulting</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={onLogout}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', padding: '0.6rem 1.4rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            {t.logout}
          </button>
        </div>

        {/* ── Tab Navigation ── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#ffffff', borderRadius: '14px', padding: '0.4rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, minWidth: 'max-content', padding: '0.65rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', transition: 'all 0.25s',
                background: activeTab === tab.id ? '#4c6cd0' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(76,108,208,0.3)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1: Stats & Settings ══ */}
        {activeTab === 'admin-stats-settings' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              <StatCard label={t.statBookings} value={totalBookingsCount} accent="#4c6cd0" />
              <StatCard label={t.statPending} value={pendingBookingsCount} accent="#1e293b" />
            </div>

            {/* Settings Form */}
            <div style={S.card}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
                {t.editSiteSettings}
              </h3>
              <form id="site-settings-form" onSubmit={handleSettingsSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.phoneLabel}</label>
                    <input style={S.input} type="text" value={settingsForm.phone}
                      onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.emailLabel}</label>
                    <input style={S.input} type="email" value={settingsForm.email}
                      onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.hoursEnLabel}</label>
                    <input style={S.input} type="text" value={settingsForm.hoursEn}
                      onChange={e => setSettingsForm({ ...settingsForm, hoursEn: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.hoursArLabel}</label>
                    <input style={S.input} type="text" value={settingsForm.hoursAr}
                      onChange={e => setSettingsForm({ ...settingsForm, hoursAr: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      required />
                  </div>
                </div>

                <div style={S.subsectionTitle}>
                  <span>🔗</span> {t.socialTitle}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.linkedinLabel}</label>
                    <input style={S.input} type="url" value={settingsForm.linkedin}
                      onChange={e => setSettingsForm({ ...settingsForm, linkedin: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      placeholder="https://linkedin.com/..." />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.instagramLabel}</label>
                    <input style={S.input} type="url" value={settingsForm.instagram}
                      onChange={e => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      placeholder="https://instagram.com/..." />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.youtubeLabel}</label>
                    <input style={S.input} type="url" value={settingsForm.youtube}
                      onChange={e => setSettingsForm({ ...settingsForm, youtube: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      placeholder="https://youtube.com/..." />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.whatsappLabel}</label>
                    <input style={S.input} type="text" value={settingsForm.whatsapp}
                      onChange={e => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      placeholder="e.g. https://wa.me/... or phone number" />
                  </div>
                </div>

                <div style={S.subsectionTitle}>
                  <span>📢</span> {t.announceTitle}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.announceEnLabel}</label>
                    <input style={S.input} type="text" value={settingsForm.announceEn}
                      onChange={e => setSettingsForm({ ...settingsForm, announceEn: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      placeholder="e.g. Eid Mubarak! Offices closed June 16-18." />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{t.announceArLabel}</label>
                    <input style={S.input} type="text" value={settingsForm.announceAr}
                      onChange={e => setSettingsForm({ ...settingsForm, announceAr: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#4c6cd0'; e.target.style.boxShadow = '0 0 0 3px rgba(76,108,208,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                      placeholder="مثال: عيد مبارك!" />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem', padding: '0.9rem 1.2rem', background: '#f0f4ff', borderRadius: '10px', border: '1.5px solid #c7d2fe' }}>
                  <input type="checkbox" id="settings-announce-visible" checked={settingsForm.announceVisible}
                    onChange={handleAnnounceVisibleChange} style={{ width: '18px', height: '18px', accentColor: '#4c6cd0', cursor: 'pointer' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{t.announceEnableLabel}</span>
                </label>

                <button type="submit" style={{ background: '#4c6cd0', color: '#fff', border: 'none', padding: '0.85rem 2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'background 0.2s, transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#3b5bbf'}
                  onMouseLeave={e => e.currentTarget.style.background = '#4c6cd0'}>
                  {t.saveSettingsBtn}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══ TAB 2: All Appointments ══ */}
        {activeTab === 'admin-appointments' && (
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr>
                    {[t.thClient, t.thContact, t.thType, t.thBrief, t.thStatus, t.thAction].map(h => (
                      <th key={h} style={{ background: '#4c6cd0', color: '#fff', padding: '1rem 1.2rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>{t.noBookings}</td></tr>
                  ) : (
                    bookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '1rem 1.2rem' }}>
                          <strong style={{ color: '#1e293b', display: 'block' }}>{b.name}</strong>
                          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Ref: {b.ref || 'N/A'}</small>
                        </td>
                        <td style={{ padding: '1rem 1.2rem' }}>
                          <span style={{ display: 'block', color: '#475569', fontSize: '0.85rem' }}>{b.phone}</span>
                          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{b.email}</small>
                        </td>
                        <td style={{ padding: '1rem 1.2rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4c6cd0', background: '#eef2ff', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{getBookingTypeText(b.type)}</span>
                        </td>
                        <td style={{ padding: '1rem 1.2rem', maxWidth: '160px', color: '#475569', fontSize: '0.85rem' }} title={b.brief}>
                          {b.brief.substring(0, 30)}{b.brief.length > 30 ? '…' : ''}
                        </td>
                        <td style={{ padding: '1rem 1.2rem' }}>
                          {(b.status === 'Pending Review' || b.status === 'Paid & Pending Review') && <span style={{ background: '#fffbeb', color: '#d97706', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '50px' }}>{t.statusPending}</span>}
                          {b.status === 'Scheduled' && <span style={{ background: '#eef2ff', color: '#4c6cd0', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '50px' }} title={b.appointmentDetails}>{t.statusScheduled}</span>}
                          {b.status === 'Completed' && <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '50px' }}>{t.statusCompleted}</span>}
                        </td>
                        <td style={{ padding: '1rem 1.2rem', whiteSpace: 'nowrap' }}>
                          {(b.status === 'Pending Review' || b.status === 'Paid & Pending Review') && <button style={S.actionBtn} onClick={() => handleScheduleClick(b.id)}>{t.btnSchedule}</button>}
                          {b.status === 'Scheduled' && <button style={S.successBtn} onClick={() => handleCompleteClick(b.id)}>{t.btnComplete}</button>}
                          <button style={S.deleteBtn} onClick={() => handleDeleteBookingClick(b.id)}>{t.btnDelete}</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ TAB 3: Client Messages ══ */}
        {activeTab === 'admin-contacts' && (
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    {[t.thClient, t.thPhoneEmail, t.thMessage, t.thDateStatus, t.thAction].map(h => (
                      <th key={h} style={{ background: '#4c6cd0', color: '#fff', padding: '1rem 1.2rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>{t.noContacts}</td></tr>
                  ) : (
                    contacts.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '1rem 1.2rem' }}><strong style={{ color: '#1e293b' }}>{c.name}</strong></td>
                        <td style={{ padding: '1rem 1.2rem' }}>
                          <span style={{ display: 'block', color: '#475569', fontSize: '0.85rem' }}>{c.phone}</span>
                          <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{c.email}</small>
                        </td>
                        <td style={{ padding: '1rem 1.2rem', maxWidth: '220px', color: '#475569', fontSize: '0.85rem' }} title={c.message}>
                          {c.message.substring(0, 50)}{c.message.length > 50 ? '…' : ''}
                        </td>
                        <td style={{ padding: '1rem 1.2rem' }}>
                          <span style={{ display: 'block', color: '#475569', fontSize: '0.82rem' }}>{c.date}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '50px', background: c.status === 'New' ? '#fffbeb' : '#f1f5f9', color: c.status === 'New' ? '#d97706' : '#64748b' }}>
                            {c.status === 'New' ? (lang === 'en' ? 'New' : 'جديد') : (lang === 'en' ? 'Processed' : 'معالج')}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.2rem', whiteSpace: 'nowrap' }}>
                          {c.status === 'New' && <button style={S.successBtn} onClick={() => onMarkContactRead(c.id)}>{t.btnMarkRead}</button>}
                          <button style={S.deleteBtn} onClick={() => handleDeleteContactClick(c.id)}>{t.btnDelete}</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ TAB 4: Publishing ══ */}
        {activeTab === 'admin-publishing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>

            {/* Publisher Block */}
            <div style={S.card}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
                {lang === 'en' ? 'Publish New Article' : 'نشر مقال جديد'}
              </h3>

              <form onSubmit={handlePublishSubmit}>
                {/* Titles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{lang === 'en' ? 'Title (English) *' : 'العنوان (إنجليزي) *'}</label>
                    <input style={S.input} type="text" value={publishingForm.titleEn}
                      onChange={e => setPublishingForm({ ...publishingForm, titleEn: e.target.value })}
                      required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{lang === 'en' ? 'Title (Arabic) *' : 'العنوان (عربي) *'}</label>
                    <input style={S.input} type="text" value={publishingForm.titleAr}
                      onChange={e => setPublishingForm({ ...publishingForm, titleAr: e.target.value })}
                      required />
                  </div>
                </div>

                {/* Categories */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{lang === 'en' ? 'Category (English)' : 'الفئة (إنجليزي)'}</label>
                    <input style={S.input} type="text" value={publishingForm.categoryEn}
                      onChange={e => setPublishingForm({ ...publishingForm, categoryEn: e.target.value })} />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.label}>{lang === 'en' ? 'Category (Arabic)' : 'الفئة (عربي)'}</label>
                    <input style={S.input} type="text" value={publishingForm.categoryAr}
                      onChange={e => setPublishingForm({ ...publishingForm, categoryAr: e.target.value })} />
                  </div>
                </div>

                {/* Contents */}
                <div style={S.inputGroup}>
                  <label style={S.label}>{lang === 'en' ? 'Content (English) *' : 'المحتوى (إنجليزي) *'}</label>
                  <textarea style={{ ...S.input, minHeight: '120px', resize: 'vertical' }} value={publishingForm.contentEn}
                    onChange={e => setPublishingForm({ ...publishingForm, contentEn: e.target.value })}
                    required />
                </div>

                <div style={S.inputGroup}>
                  <label style={S.label}>{lang === 'en' ? 'Content (Arabic) *' : 'المحتوى (عربي) *'}</label>
                  <textarea style={{ ...S.input, minHeight: '120px', resize: 'vertical' }} value={publishingForm.contentAr}
                    onChange={e => setPublishingForm({ ...publishingForm, contentAr: e.target.value })}
                    required />
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  id="cover-picker"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  id="video-picker"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  id="doc-picker"
                  multiple
                  onChange={handleAttachmentsSelect}
                  style={{ display: 'none' }}
                />

                {/* Upload Buttons Box */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('cover-picker').click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e0e7ff', color: '#4c6cd0', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <span>🖼️</span> {lang === 'en' ? 'Add Photo' : 'إضافة صورة غلاف'}
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('video-picker').click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7', color: '#d97706', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <span>📹</span> {lang === 'en' ? 'Add Video' : 'إضافة فيديو'}
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('doc-picker').click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', color: '#16a34a', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <span>📎</span> {lang === 'en' ? 'Attach Files' : 'إرفاق ملفات'}
                  </button>
                </div>

                {/* Previews Box */}
                {(publishingForm.coverImage || publishingForm.video || publishingForm.attachments.length > 0) && (
                  <div style={{ background: '#faf8f4', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.4rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                      {lang === 'en' ? 'Attachments Preview' : 'معاينة المرفقات'}
                    </h4>

                    {/* Cover Preview */}
                    {publishingForm.coverImage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem', background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <img src={publishingForm.coverImage} alt="Cover Preview" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#475569', flexGrow: 1 }}>{lang === 'en' ? 'Cover Photo Selected' : 'تم اختيار صورة الغلاف'}</span>
                        <button type="button" onClick={() => setPublishingForm(prev => ({ ...prev, coverImage: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>❌</button>
                      </div>
                    )}

                    {/* Video Preview */}
                    {publishingForm.video && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem', background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '1.2rem' }}>📹</span>
                        <span style={{ fontSize: '0.75rem', color: '#475569', flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={publishingForm.videoName}>{publishingForm.videoName}</span>
                        <button type="button" onClick={() => setPublishingForm(prev => ({ ...prev, video: '', videoName: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>❌</button>
                      </div>
                    )}

                    {/* Attachments List */}
                    {publishingForm.attachments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {publishingForm.attachments.map((file, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '1.1rem' }}>📄</span>
                            <span style={{ fontSize: '0.75rem', color: '#475569', flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={file.name}>{file.name}</span>
                            <button type="button" onClick={() => setPublishingForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>❌</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Button */}
                <button
                  type="submit"
                  style={{ ...S.actionBtn, padding: '0.7rem 2rem', borderRadius: '10px', fontSize: '0.85rem', width: '100%', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {lang === 'en' ? 'Post Article' : 'نشر المقال'}
                </button>
              </form>
            </div>

            {/* Published Articles List */}
            <div>
              <div style={S.card}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
                  {lang === 'en' ? 'Manage Articles' : 'إدارة المقالات'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                  {articles.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '1.5rem' }}>
                      {lang === 'en' ? 'No articles published yet.' : 'لا توجد مقالات منشورة بعد.'}
                    </p>
                  ) : (
                    articles.map(art => (
                      <div key={art.id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden', background: '#faf8f4' }}>
                        {/* Article Row */}
                        <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem', alignItems: 'center' }}>
                          {art.coverImage ? (
                            <img src={art.coverImage} alt="Article Mini Cover" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: '50px', height: '40px', background: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>📰</div>
                          )}
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {lang === 'en' ? art.titleEn : art.titleAr}
                            </h4>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{art.date} · {lang === 'en' ? art.categoryEn : art.categoryAr}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                            <button
                              onClick={() => handleEditStart(art)}
                              style={{ background: '#e0e7ff', color: '#4c6cd0', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                            >
                              {lang === 'en' ? '✏️ Edit' : '✏️ تعديل'}
                            </button>
                            <button
                              onClick={() => {
                                showConfirm(
                                  lang === 'en' ? 'Are you sure you want to delete this article?' : 'هل أنت متأكد من رغبتك في حذف هذا المقال؟',
                                  lang === 'en' ? 'Delete Article' : 'حذف المقال',
                                  () => onDeleteArticle(art.id)
                                );
                              }}
                              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                            >
                              {lang === 'en' ? 'Delete' : 'حذف'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Edit Article Modal */}
            {editingArticle && (
              <div className="modal-overlay" style={{ zIndex: 99999 }}>
                <div className="modal-container" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                  <button className="close-btn" onClick={() => setEditingArticle(null)}>&times;</button>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
                    {lang === 'en' ? 'Edit Article' : 'تعديل المقال'}
                  </h3>

                  <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Titles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={S.inputGroup}>
                        <label style={S.label}>{lang === 'en' ? 'Title (English) *' : 'العنوان (إنجليزي) *'}</label>
                        <input style={S.input} type="text"
                          value={editingArticle.form.titleEn}
                          onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, titleEn: e.target.value } }))}
                          required />
                      </div>
                      <div style={S.inputGroup}>
                        <label style={S.label}>{lang === 'en' ? 'Title (Arabic) *' : 'العنوان (عربي) *'}</label>
                        <input style={S.input} type="text"
                          value={editingArticle.form.titleAr}
                          onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, titleAr: e.target.value } }))}
                          required />
                      </div>
                    </div>

                    {/* Categories */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={S.inputGroup}>
                        <label style={S.label}>{lang === 'en' ? 'Category (English)' : 'الفئة (إنجليزي)'}</label>
                        <input style={S.input} type="text"
                          value={editingArticle.form.categoryEn}
                          onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, categoryEn: e.target.value } }))} />
                      </div>
                      <div style={S.inputGroup}>
                        <label style={S.label}>{lang === 'en' ? 'Category (Arabic)' : 'الفئة (عربي)'}</label>
                        <input style={S.input} type="text"
                          value={editingArticle.form.categoryAr}
                          onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, categoryAr: e.target.value } }))} />
                      </div>
                    </div>

                    {/* Content */}
                    <div style={S.inputGroup}>
                      <label style={S.label}>{lang === 'en' ? 'Content (English)' : 'المحتوى (إنجليزي)'}</label>
                      <textarea style={{ ...S.input, minHeight: '120px', resize: 'vertical' }}
                        value={editingArticle.form.contentEn}
                        onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, contentEn: e.target.value } }))} />
                    </div>
                    <div style={S.inputGroup}>
                      <label style={S.label}>{lang === 'en' ? 'Content (Arabic)' : 'المحتوى (عربي)'}</label>
                      <textarea style={{ ...S.input, minHeight: '120px', resize: 'vertical' }}
                        value={editingArticle.form.contentAr}
                        onChange={e => setEditingArticle(p => ({ ...p, form: { ...p.form, contentAr: e.target.value } }))} />
                    </div>

                    {/* Cover Image */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#faf8f4', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {editingArticle.form.coverImage && (
                        <img src={editingArticle.form.coverImage} alt="cover" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <input type="file" id={`edit-cover-modal`} accept="image/*" onChange={handleEditCoverSelect} style={{ display: 'none' }} />
                        <button type="button"
                          onClick={() => document.getElementById(`edit-cover-modal`).click()}
                          style={{ background: '#e0e7ff', color: '#4c6cd0', border: 'none', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          🖼️ {lang === 'en' ? 'Change Cover Image' : 'تغيير صورة الغلاف'}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setEditingArticle(null)}
                        style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        {lang === 'en' ? 'Cancel' : 'إلغاء'}
                      </button>
                      <button type="submit"
                        style={{ ...S.actionBtn, padding: '0.55rem 1.8rem', fontSize: '0.82rem', borderRadius: '8px' }}
                      >
                        {lang === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
