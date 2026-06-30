import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

// ─── SITE SETTINGS ───
export const getSettings = async () => {
  const docRef = doc(db, 'site_settings', 'current');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const updateSettings = async (settings) => {
  const docRef = doc(db, 'site_settings', 'current');
  await setDoc(docRef, settings, { merge: true });
  return settings;
};

// ─── ANNOUNCEMENTS ───
export const getAnnouncement = async () => {
  const docRef = doc(db, 'announcements', 'current');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const updateAnnouncement = async (announcement) => {
  const docRef = doc(db, 'announcements', 'current');
  await setDoc(docRef, announcement, { merge: true });
  return announcement;
};

// ─── BOOKINGS ───
export const getBookings = async () => {
  const querySnapshot = await getDocs(query(collection(db, 'bookings'), orderBy('date', 'desc')));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createBooking = async (booking) => {
  const cleanBooking = {
    name: booking.name || '',
    phone: booking.phone || '',
    email: booking.email || '',
    brief: booking.brief || '',
    type: booking.type || 'in-person',
    ref: booking.ref || 'SND-' + Math.floor(1000 + Math.random() * 9000),
    status: booking.status || 'Scheduled',
    date: booking.date || new Date().toISOString().split('T')[0],
    appointmentDetails: booking.appointmentDetails || ''
  };
  const docRef = await addDoc(collection(db, 'bookings'), cleanBooking);
  return { id: docRef.id, ...cleanBooking };
};

export const updateBooking = async (id, booking) => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, booking);
  return { id, ...booking };
};

export const deleteBooking = async (id) => {
  const docRef = doc(db, 'bookings', id);
  await deleteDoc(docRef);
};

// ─── CONTACT MESSAGES ───
export const getContacts = async () => {
  const querySnapshot = await getDocs(query(collection(db, 'contacts'), orderBy('date', 'desc')));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createContact = async (contact) => {
  const cleanContact = {
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    message: contact.message || '',
    date: contact.date || new Date().toISOString().split('T')[0],
    status: contact.status || 'New'
  };
  const docRef = await addDoc(collection(db, 'contacts'), cleanContact);
  return { id: docRef.id, ...cleanContact };
};

export const updateContactStatus = async (id, status) => {
  const docRef = doc(db, 'contacts', id);
  await updateDoc(docRef, { status });
  return { id, status };
};

export const deleteContact = async (id) => {
  const docRef = doc(db, 'contacts', id);
  await deleteDoc(docRef);
};

// ─── ARTICLES ───
export const getArticles = async () => {
  const querySnapshot = await getDocs(query(collection(db, 'articles'), orderBy('date', 'desc')));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      attachments: data.attachments || []
    };
  });
};

export const createArticle = async (article) => {
  const cleanArticle = {
    titleEn: article.titleEn || '',
    titleAr: article.titleAr || '',
    categoryEn: article.categoryEn || 'General',
    categoryAr: article.categoryAr || 'عام',
    contentEn: article.contentEn || '',
    contentAr: article.contentAr || '',
    coverImage: article.coverImage || '/sanad_hero_symbol.png',
    date: article.date || new Date().toISOString().split('T')[0],
    attachments: article.attachments || [],
    video: article.video || ''
  };
  const docRef = await addDoc(collection(db, 'articles'), cleanArticle);
  return { id: docRef.id, ...cleanArticle };
};

export const updateArticle = async (id, article) => {
  const docRef = doc(db, 'articles', id);
  const updateData = {};
  if (article.titleEn !== undefined) updateData.titleEn = article.titleEn;
  if (article.titleAr !== undefined) updateData.titleAr = article.titleAr;
  if (article.categoryEn !== undefined) updateData.categoryEn = article.categoryEn;
  if (article.categoryAr !== undefined) updateData.categoryAr = article.categoryAr;
  if (article.contentEn !== undefined) updateData.contentEn = article.contentEn;
  if (article.contentAr !== undefined) updateData.contentAr = article.contentAr;
  if (article.coverImage !== undefined) updateData.coverImage = article.coverImage;
  if (article.attachments !== undefined) updateData.attachments = article.attachments;
  if (article.video !== undefined) updateData.video = article.video;

  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteArticle = async (id) => {
  const docRef = doc(db, 'articles', id);
  await deleteDoc(docRef);
};
