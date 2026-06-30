import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getUserByUsername,
  getSettings,
  updateSettings,
  updateAnnouncement,
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getContacts,
  createContact,
  updateContactStatus,
  deleteContact,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getDbMode
} from './db.js';
import { generateToken, authenticateToken } from './auth.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ─── AUTHENTICATION ENDPOINTS ───

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});


// ─── SITE SETTINGS & ANNOUNCEMENTS ───

// GET /api/settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings
app.put('/api/settings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { phone, email, hoursEn, hoursAr, addressEn, addressAr, linkedin, youtube, instagram, whatsapp } = req.body;

  try {
    const updatedSettings = await updateSettings({ phone, email, hoursEn, hoursAr, addressEn, addressAr, linkedin, youtube, instagram, whatsapp });
    res.json(updatedSettings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update site settings.' });
  }
});

// PUT /api/settings/announcement
app.put('/api/settings/announcement', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { textEn, textAr, visible } = req.body;

  try {
    const updatedAnnounce = await updateAnnouncement({ textEn, textAr, visible });
    res.json(updatedAnnounce);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update announcement.' });
  }
});


// ─── BOOKINGS (APPOINTMENTS) ───

// GET /api/bookings (Admin & Employee only)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await getBookings();
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// POST /api/bookings (Public booking form)
app.post('/api/bookings', async (req, res) => {
  const { name, phone, email, brief, type, ref, date } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const newBooking = await createBooking({ name, phone, email, brief, type, ref, date });
    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// PUT /api/bookings/:id (Update status or details - Admin & Employee)
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, appointmentDetails, assignedEmployeeId } = req.body;

  try {
    const updatedBooking = await updateBooking(id, { status, appointmentDetails, assignedEmployeeId });
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});

// DELETE /api/bookings/:id (Admin only)
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { id } = req.params;

  try {
    await deleteBooking(id);
    res.json({ message: 'Booking deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});


// ─── CONTACTS (MESSAGES) ───

// GET /api/contacts (Admin only)
app.get('/api/contacts', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  try {
    const contacts = await getContacts();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contact messages.' });
  }
});

// POST /api/contacts (Public contact form)
app.post('/api/contacts', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const newContact = await createContact({ name, email, phone, message });
    res.status(201).json(newContact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// PUT /api/contacts/:id (Mark as Read/Processed - Admin only)
app.put('/api/contacts/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedContact = await updateContactStatus(id, status);
    if (!updatedContact) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    res.json(updatedContact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update message status.' });
  }
});

// DELETE /api/contacts/:id (Admin only)
app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { id } = req.params;

  try {
    await deleteContact(id);
    res.json({ message: 'Message deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});


// ─── ARTICLES (BLOG POSTS) ───

// GET /api/articles (Public)
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await getArticles();
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// POST /api/articles (Admin only)
app.post('/api/articles', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { titleEn, titleAr, categoryEn, categoryAr, contentEn, contentAr, coverImage, attachments, video } = req.body;

  try {
    const newArticle = await createArticle({ titleEn, titleAr, categoryEn, categoryAr, contentEn, contentAr, coverImage, attachments, video });
    res.status(201).json(newArticle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to publish article.' });
  }
});

// PUT /api/articles/:id (Update - Admin only)
app.put('/api/articles/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { id } = req.params;
  const { titleEn, titleAr, categoryEn, categoryAr, contentEn, contentAr, coverImage, attachments, video } = req.body;

  try {
    const updated = await updateArticle(id, { titleEn, titleAr, categoryEn, categoryAr, contentEn, contentAr, coverImage, attachments, video });
    if (!updated) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update article.' });
  }
});

// DELETE /api/articles/:id (Admin only)
app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const { id } = req.params;

  try {
    await deleteArticle(id);
    res.json({ message: 'Article deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});


// ─── STATIC FRONTEND SERVING (PRODUCTION) ───

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Mode: ${process.env.NODE_ENV || 'development'})`);
  console.log(`Database Mode: ${getDbMode()}`);
});
