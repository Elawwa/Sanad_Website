import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import admin from 'firebase-admin';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return projectId && clientEmail && privateKey &&
         projectId !== 'YOUR_FIREBASE_PROJECT_ID' &&
         clientEmail !== 'YOUR_FIREBASE_CLIENT_EMAIL' &&
         privateKey !== 'YOUR_FIREBASE_PRIVATE_KEY';
};

// ─── INITIALIZATION ───
let dbMode = 'sqlite';
let firestoreDb = null;
let sqliteDb = null;

const initDb = async () => {
  if (isFirebaseConfigured()) {
    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          })
        });
      }
      firestoreDb = admin.firestore();
      dbMode = 'firebase';
      console.log('🔥 Connected to Firebase Firestore database.');
      await seedFirebase(firestoreDb);
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Admin. Falling back to SQLite.', err);
      await initSqlite();
    }
  } else {
    console.log('📦 Firebase credentials not set in .env. Using local SQLite database.');
    await initSqlite();
  }
};

const initSqlite = async () => {
  dbMode = 'sqlite';
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  sqliteDb = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // 1. Users Table
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'client'
    )
  `);

  // 2. Site Settings Table
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY,
      phone TEXT,
      email TEXT,
      hoursEn TEXT,
      hoursAr TEXT,
      addressEn TEXT,
      addressAr TEXT,
      linkedin TEXT,
      youtube TEXT,
      instagram TEXT,
      whatsapp TEXT
    )
  `);

  // 3. Announcements Table
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY,
      textEn TEXT,
      textAr TEXT,
      visible INTEGER DEFAULT 1
    )
  `);

  // 4. Bookings Table
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      brief TEXT,
      type TEXT,
      ref TEXT,
      date TEXT,
      status TEXT DEFAULT 'Pending',
      appointmentDetails TEXT,
      assignedEmployeeId INTEGER
    )
  `);

  // 5. Contacts Table
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      date TEXT
    )
  `);

  // 6. Articles Table
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titleEn TEXT NOT NULL,
      titleAr TEXT NOT NULL,
      categoryEn TEXT,
      categoryAr TEXT,
      contentEn TEXT,
      contentAr TEXT,
      coverImage TEXT,
      date TEXT,
      attachments TEXT DEFAULT '[]',
      video TEXT
    )
  `);

  await seedSqlite(sqliteDb);
};

// ─── SEEDING LOGIC ───

const defaultArticles = [
  {
    titleEn: 'Navigating the New UAE Corporate Tax Regime',
    titleAr: 'فهم نظام ضريبة الشركات الجديد في دولة الإمارات',
    categoryEn: 'Tax Advisory',
    categoryAr: 'الاستشارات الضريبية',
    contentEn: 'The UAE Federal Tax Authority has introduced a corporate tax rate of 9% for taxable income exceeding AED 375,000. Business owners must structure their operations properly to benefit from small business relief and free zone exemptions. Keeping proper books of accounts is now mandatory for compliance.',
    contentAr: 'أعلنت الهيئة الاتحادية للضرائب عن بدء تطبيق ضريبة الشركات بنسبة 9% على الدخل الخاضع للضريبة الذي يتجاوز 375,000 درهم إماراتي. يجب على أصحاب الأعمال هيكلة عملياتهم بشكل صحيح للاستفادة من تسهيلات الأعمال الصغيرة والإعفاءات المتاحة للمناطق الحرة. أصبح الاحتفاظ بدفاتر حسابات دقيقة أمراً إلزامياً للامتثال القانوني.',
    coverImage: '/sanad_about_office.png',
    date: new Date(2026, 5, 20).toLocaleDateString(),
    attachments: '[]',
    video: ''
  },
  {
    titleEn: 'Mainland vs. Free Zone Setup: Which is Right for You?',
    titleAr: 'تأسيس الشركات: البر الرئيسي مقابل المنطقة الحرة',
    categoryEn: 'Corporate Setup',
    categoryAr: 'تأسيس الشركات',
    contentEn: 'Choosing between a mainland entity and a free zone setup depends on your target market. A mainland company allows you to trade freely anywhere in the UAE, while a free zone setup offers 100% foreign ownership and tax exemptions, but limits direct trading in the local market without an agent.',
    contentAr: 'يعتمد الاختيار بين شركة البر الرئيسي وتأسيس شركة في المنطقة الحرة على السوق المستهدف. تتيح لك شركة البر الرئيسي التداول بحرية في أي مكان داخل الإمارات، بينما يوفر تأسيس شركة في المنطقة الحرة ملكية أجنبية بنسبة 100% وإعفاءات ضريبية، ولكنه يحد من التجارة المباشرة في السوق المحلي بدون وكيل.',
    coverImage: '/sanad_hero_symbol.png',
    date: new Date(2026, 5, 22).toLocaleDateString(),
    attachments: '[]',
    video: ''
  },
  {
    titleEn: 'Understanding UAE Free Zone Substance Regulations',
    titleAr: 'فهم لوائح الأنشطة الاقتصادية الفعلية في المناطق الحرة بالإمارات',
    categoryEn: 'Corporate Compliance',
    categoryAr: 'الامتثال للمؤسسات',
    contentEn: 'Economic Substance Regulations (ESR) require UAE businesses to demonstrate genuine economic activity. Non-compliance leads to heavy financial penalties.',
    contentAr: 'تتطلب لوائح الأنشطة الاقتصادية الفعلية من الشركات في الإمارات إثبات وجود نشاط اقتصادي حقيقي. عدم الامتثال يؤدي إلى غرامات مالية كبيرة.',
    coverImage: '/sanad_about_office.png',
    date: new Date(2026, 5, 24).toLocaleDateString(),
    attachments: '[]',
    video: ''
  },
  {
    titleEn: 'How to Avoid Common VAT Audit Pitfalls in the UAE',
    titleAr: 'كيفية تجنب الأخطاء الشائعة في التدقيق الضريبي في الإمارات',
    categoryEn: 'Tax Advisory',
    categoryAr: 'الاستشارات الضريبية',
    contentEn: 'Preparing for a FTA tax audit requires meticulous record-keeping. Learn the most common mistakes businesses make during VAT filings.',
    contentAr: 'يتطلب الاستعداد للتدقيق الضريبي من قبل الهيئة الاتحادية للضرائب الاحتفاظ بسجلات دقيقة. تعرف على الأخطاء الأكثر شيوعاً أثناء تقديم إقرارات الضريبة.',
    coverImage: '/sanad_hero_symbol.png',
    date: new Date(2026, 5, 25).toLocaleDateString(),
    attachments: '[]',
    video: ''
  },
  {
    titleEn: 'The Importance of Watertight Shareholders\' Agreements',
    titleAr: 'أهمية صياغة اتفاقيات مساهمين محكمة',
    categoryEn: 'Legal Drafting',
    categoryAr: 'الالعقود والصياغة',
    contentEn: 'A well-drafted shareholders\' agreement protects minority interests and defines clear dispute resolution mechanisms for UAE companies.',
    contentAr: 'تحمي اتفاقية المساهمين المصاغة جيداً مصالح الأقلية وتحدد آليات واضحة لتسوية النزاعات للشركات العاملة في دولة الإمارات.',
    coverImage: '/sanad_about_office.png',
    date: new Date(2026, 5, 26).toLocaleDateString(),
    attachments: '[]',
    video: ''
  },
  {
    titleEn: 'Ultimate Guide to Anti-Money Laundering (AML) Compliance',
    titleAr: 'الدليل الشامل للامتثال للوائح مكافحة غسيل الأموال',
    categoryEn: 'Trainings & Compliance',
    categoryAr: 'التدريب والامتثال',
    contentEn: 'Designated Non-Financial Businesses and Professions (DNFBPs) in the UAE must register on the goAML portal and appoint a compliance officer.',
    contentAr: 'يجب على الأعمال والمهن غير المالية المحددة في الإمارات التسجيل في نظام goAML وتعيين مسؤول امتثال مؤهل.',
    coverImage: '/sanad_hero_symbol.png',
    date: new Date(2026, 5, 27).toLocaleDateString(),
    attachments: '[]',
    video: ''
  },
  {
    titleEn: 'Structuring Family Businesses for Generational Transition',
    titleAr: 'هيكلة الشركات العائلية لانتقال الأجيال',
    categoryEn: 'Corporate Setup',
    categoryAr: 'تأسيس الشركات',
    contentEn: 'Implementing family constitutions and trust structures in the UAE ensures business continuity and smooth transition between generations.',
    contentAr: 'يضمن تطبيق الدساتير العائلية وهياكل الأمانة (Trusts) في دولة الإمارات استمرارية الأعمال والانتقال السلس بين الأجيال.',
    coverImage: '/sanad_about_office.png',
    date: new Date(2026, 5, 28).toLocaleDateString(),
    attachments: '[]',
    video: ''
  }
];

const seedSqlite = async (db) => {
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
  }

  const settingsCount = await db.get('SELECT COUNT(*) as count FROM site_settings');
  if (settingsCount.count === 0) {
    await db.run(`
      INSERT INTO site_settings (id, phone, email, hoursEn, hoursAr, addressEn, addressAr, linkedin, youtube, instagram, whatsapp)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      '+971 6 555 1234',
      'info@sanadconsulting.ae',
      'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday - Sunday: Closed',
      'الاثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً\nالسبت - الأحد: مغلق',
      'Sharjah Research Technology & Innovation Park, Sharjah, United Arab Emirates',
      'مجمع الشارقة للبحوث والتكنولوجيا والابتكار، الشارقة، الإمارات العربية المتحدة',
      'https://linkedin.com',
      'https://youtube.com',
      'https://instagram.com',
      'https://wa.me/97165551234'
    ]);
  }

  const announceCount = await db.get('SELECT COUNT(*) as count FROM announcements');
  if (announceCount.count === 0) {
    await db.run('INSERT INTO announcements (id, textEn, textAr, visible) VALUES (1, ?, ?, 1)', [
      'Eid Mubarak! Our office will be closed on June 16-18.',
      'عيد مبارك! ستغلق مكاتبنا في الفترة من 16 إلى 18 يونيو.'
    ]);
  }

  const articleCount = await db.get('SELECT COUNT(*) as count FROM articles');
  if (articleCount.count === 0) {
    for (const art of defaultArticles) {
      await db.run(`
        INSERT INTO articles (titleEn, titleAr, categoryEn, categoryAr, contentEn, contentAr, coverImage, date, attachments, video)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [art.titleEn, art.titleAr, art.categoryEn, art.categoryAr, art.contentEn, art.contentAr, art.coverImage, art.date, art.attachments, art.video]);
    }
  }
};

const seedFirebase = async (db) => {
  // 1. Seed Admin User
  const userRef = db.collection('users').doc('admin');
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await userRef.set({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Seeded Firebase Admin user');
  }

  // 2. Seed Site Settings
  const settingsRef = db.collection('site_settings').doc('current');
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set({
      phone: '+971 6 555 1234',
      email: 'info@sanadconsulting.ae',
      hoursEn: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday - Sunday: Closed',
      hoursAr: 'الاثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً\nالسبت - الأحد: مغلق',
      addressEn: 'Sharjah Research Technology & Innovation Park, Sharjah, United Arab Emirates',
      addressAr: 'مجمع الشارقة للبحوث والتكنولوجيا والابتكار، الشارقة، الإمارات العربية المتحدة',
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      whatsapp: 'https://wa.me/97165551234'
    });
    console.log('Seeded Firebase Site Settings');
  }

  // 3. Seed Announcement
  const announceRef = db.collection('announcements').doc('current');
  const announceSnap = await announceRef.get();
  if (!announceSnap.exists) {
    await announceRef.set({
      textEn: 'Eid Mubarak! Our office will be closed on June 16-18.',
      textAr: 'عيد مبارك! ستغلق مكاتبنا في الفترة من 16 إلى 18 يونيو.',
      visible: true
    });
    console.log('Seeded Firebase Announcement');
  }

  // 4. Seed Articles
  const articlesCol = db.collection('articles');
  const articlesSnap = await articlesCol.limit(1).get();
  if (articlesSnap.empty) {
    for (const art of defaultArticles) {
      await articlesCol.add({
        ...art,
        attachments: JSON.parse(art.attachments)
      });
    }
    console.log('Seeded Firebase default articles');
  }
};

// ─── REPOSITORY FUNCTIONS (DATABASE-AGNOSTIC INTERFACE) ───

// 1. Users
export const getUserByUsername = async (username) => {
  if (dbMode === 'firebase') {
    const snap = await firestoreDb.collection('users').where('username', '==', username).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  } else {
    return await sqliteDb.get('SELECT * FROM users WHERE username = ?', [username]);
  }
};

// 2. Settings
export const getSettings = async () => {
  if (dbMode === 'firebase') {
    const settingsSnap = await firestoreDb.collection('site_settings').doc('current').get();
    const announceSnap = await firestoreDb.collection('announcements').doc('current').get();

    return {
      siteSettings: settingsSnap.exists ? settingsSnap.data() : {},
      announcement: announceSnap.exists ? announceSnap.data() : { textEn: '', textAr: '', visible: false }
    };
  } else {
    const siteSettings = await sqliteDb.get('SELECT * FROM site_settings WHERE id = 1');
    const announcementRow = await sqliteDb.get('SELECT * FROM announcements WHERE id = 1');
    return {
      siteSettings,
      announcement: {
        textEn: announcementRow?.textEn || '',
        textAr: announcementRow?.textAr || '',
        visible: announcementRow?.visible === 1
      }
    };
  }
};

export const updateSettings = async (data) => {
  if (dbMode === 'firebase') {
    const settingsRef = firestoreDb.collection('site_settings').doc('current');
    await settingsRef.update(data);
    const snap = await settingsRef.get();
    return snap.data();
  } else {
    await sqliteDb.run(`
      UPDATE site_settings
      SET phone = ?, email = ?, hoursEn = ?, hoursAr = ?, addressEn = ?, addressAr = ?, linkedin = ?, youtube = ?, instagram = ?, whatsapp = ?
      WHERE id = 1
    `, [data.phone, data.email, data.hoursEn, data.hoursAr, data.addressEn, data.addressAr, data.linkedin, data.youtube, data.instagram, data.whatsapp]);
    return await sqliteDb.get('SELECT * FROM site_settings WHERE id = 1');
  }
};

export const updateAnnouncement = async (data) => {
  if (dbMode === 'firebase') {
    const announceRef = firestoreDb.collection('announcements').doc('current');
    await announceRef.update({
      textEn: data.textEn,
      textAr: data.textAr,
      visible: !!data.visible
    });
    const snap = await announceRef.get();
    return snap.data();
  } else {
    await sqliteDb.run(`
      UPDATE announcements
      SET textEn = ?, textAr = ?, visible = ?
      WHERE id = 1
    `, [data.textEn, data.textAr, data.visible ? 1 : 0]);
    const updated = await sqliteDb.get('SELECT * FROM announcements WHERE id = 1');
    return {
      textEn: updated.textEn,
      textAr: updated.textAr,
      visible: updated.visible === 1
    };
  }
};

// 3. Bookings
export const getBookings = async () => {
  if (dbMode === 'firebase') {
    const snap = await firestoreDb.collection('bookings').orderBy('date', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return await sqliteDb.all('SELECT * FROM bookings ORDER BY id DESC');
  }
};

export const createBooking = async (data) => {
  if (dbMode === 'firebase') {
    const booking = {
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      brief: data.brief || '',
      type: data.type || 'in-person',
      ref: data.ref || '',
      date: data.date || '',
      status: 'Pending',
      appointmentDetails: '',
      assignedEmployeeId: null
    };
    const docRef = await firestoreDb.collection('bookings').add(booking);
    return { id: docRef.id, ...booking };
  } else {
    const result = await sqliteDb.run(`
      INSERT INTO bookings (name, phone, email, brief, type, ref, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [data.name, data.phone, data.email, data.brief, data.type, data.ref, data.date]);
    return await sqliteDb.get('SELECT * FROM bookings WHERE id = ?', [result.lastID]);
  }
};

export const updateBooking = async (id, data) => {
  if (dbMode === 'firebase') {
    const docRef = firestoreDb.collection('bookings').doc(id);
    const updateData = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.appointmentDetails !== undefined) updateData.appointmentDetails = data.appointmentDetails;
    if (data.assignedEmployeeId !== undefined) updateData.assignedEmployeeId = data.assignedEmployeeId;

    await docRef.update(updateData);
    const snap = await docRef.get();
    return { id: snap.id, ...snap.data() };
  } else {
    await sqliteDb.run(`
      UPDATE bookings
      SET status = COALESCE(?, status),
          appointmentDetails = COALESCE(?, appointmentDetails),
          assignedEmployeeId = COALESCE(?, assignedEmployeeId)
      WHERE id = ?
    `, [data.status, data.appointmentDetails, data.assignedEmployeeId, id]);
    return await sqliteDb.get('SELECT * FROM bookings WHERE id = ?', [id]);
  }
};

export const deleteBooking = async (id) => {
  if (dbMode === 'firebase') {
    await firestoreDb.collection('bookings').doc(id).delete();
  } else {
    await sqliteDb.run('DELETE FROM bookings WHERE id = ?', [id]);
  }
};

// 4. Contacts
export const getContacts = async () => {
  if (dbMode === 'firebase') {
    const snap = await firestoreDb.collection('contacts').orderBy('date', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return await sqliteDb.all('SELECT * FROM contacts ORDER BY id DESC');
  }
};

export const createContact = async (data) => {
  if (dbMode === 'firebase') {
    const contact = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      message: data.message,
      status: 'New',
      date: new Date().toLocaleDateString()
    };
    const docRef = await firestoreDb.collection('contacts').add(contact);
    return { id: docRef.id, ...contact };
  } else {
    const result = await sqliteDb.run(`
      INSERT INTO contacts (name, email, phone, message, date)
      VALUES (?, ?, ?, ?, ?)
    `, [data.name, data.email, data.phone, data.message, new Date().toLocaleDateString()]);
    return await sqliteDb.get('SELECT * FROM contacts WHERE id = ?', [result.lastID]);
  }
};

export const updateContactStatus = async (id, status) => {
  if (dbMode === 'firebase') {
    const docRef = firestoreDb.collection('contacts').doc(id);
    await docRef.update({ status: status || 'Processed' });
    const snap = await docRef.get();
    return { id: snap.id, ...snap.data() };
  } else {
    await sqliteDb.run('UPDATE contacts SET status = ? WHERE id = ?', [status || 'Processed', id]);
    return await sqliteDb.get('SELECT * FROM contacts WHERE id = ?', [id]);
  }
};

export const deleteContact = async (id) => {
  if (dbMode === 'firebase') {
    await firestoreDb.collection('contacts').doc(id).delete();
  } else {
    await sqliteDb.run('DELETE FROM contacts WHERE id = ?', [id]);
  }
};

// 5. Articles
export const getArticles = async () => {
  if (dbMode === 'firebase') {
    const snap = await firestoreDb.collection('articles').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    const articles = await sqliteDb.all('SELECT * FROM articles ORDER BY id DESC');
    return articles.map(art => ({
      ...art,
      attachments: JSON.parse(art.attachments || '[]')
    }));
  }
};

export const createArticle = async (data) => {
  if (dbMode === 'firebase') {
    const article = {
      titleEn: data.titleEn,
      titleAr: data.titleAr,
      categoryEn: data.categoryEn || 'General',
      categoryAr: data.categoryAr || 'عام',
      contentEn: data.contentEn || '',
      contentAr: data.contentAr || '',
      coverImage: data.coverImage || '/sanad_hero_symbol.png',
      date: new Date().toLocaleDateString(),
      attachments: data.attachments || [],
      video: data.video || ''
    };
    const docRef = await firestoreDb.collection('articles').add(article);
    return { id: docRef.id, ...article };
  } else {
    const result = await sqliteDb.run(`
      INSERT INTO articles (titleEn, titleAr, categoryEn, categoryAr, contentEn, contentAr, coverImage, date, attachments, video)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.titleEn,
      data.titleAr,
      data.categoryEn || 'General',
      data.categoryAr || 'عام',
      data.contentEn,
      data.contentAr,
      data.coverImage || '/sanad_hero_symbol.png',
      new Date().toLocaleDateString(),
      JSON.stringify(data.attachments || []),
      data.video || ''
    ]);
    const newArt = await sqliteDb.get('SELECT * FROM articles WHERE id = ?', [result.lastID]);
    newArt.attachments = JSON.parse(newArt.attachments || '[]');
    return newArt;
  }
};

export const updateArticle = async (id, data) => {
  if (dbMode === 'firebase') {
    const docRef = firestoreDb.collection('articles').doc(id);
    const updateData = {
      titleEn: data.titleEn,
      titleAr: data.titleAr,
      categoryEn: data.categoryEn || 'General',
      categoryAr: data.categoryAr || 'عام',
      contentEn: data.contentEn || '',
      contentAr: data.contentAr || '',
    };
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.video !== undefined) updateData.video = data.video;
    if (data.attachments !== undefined) updateData.attachments = data.attachments;
    await docRef.update(updateData);
    const snap = await docRef.get();
    return { id: snap.id, ...snap.data() };
  } else {
    await sqliteDb.run(`
      UPDATE articles
      SET titleEn = ?, titleAr = ?, categoryEn = ?, categoryAr = ?, contentEn = ?, contentAr = ?,
          coverImage = COALESCE(?, coverImage), video = COALESCE(?, video), attachments = COALESCE(?, attachments)
      WHERE id = ?
    `, [
      data.titleEn,
      data.titleAr,
      data.categoryEn || 'General',
      data.categoryAr || 'عام',
      data.contentEn || '',
      data.contentAr || '',
      data.coverImage,
      data.video,
      data.attachments !== undefined ? JSON.stringify(data.attachments) : null,
      id
    ]);
    const updated = await sqliteDb.get('SELECT * FROM articles WHERE id = ?', [id]);
    updated.attachments = JSON.parse(updated.attachments || '[]');
    return updated;
  }
};

export const deleteArticle = async (id) => {
  if (dbMode === 'firebase') {
    await firestoreDb.collection('articles').doc(id).delete();
  } else {
    await sqliteDb.run('DELETE FROM articles WHERE id = ?', [id]);
  }
};

// Export active DB mode check
export const getDbMode = () => dbMode;

// Export main getDb for backward compatibility if needed (returns sqlite db if in sqlite mode)
export const getDb = async () => sqliteDb;

// Initialize on import
initDb().catch(err => console.error('❌ Critical error initializing database:', err));
