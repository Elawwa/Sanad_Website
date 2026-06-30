/**
 * Utility functions for input validation and sanitization.
 */
import { isValidPhoneNumber } from 'react-phone-number-input';

// Strip raw HTML tags to prevent stored XSS attacks.
export const stripHtml = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  try {
    return isValidPhoneNumber(phone);
  } catch (e) {
    return false;
  }
};

export const sanitizeAndValidateContact = (data) => {
  const errors = [];
  const sanitized = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  } else if (data.name.length > 100) {
    errors.push('Name cannot exceed 100 characters.');
  } else {
    sanitized.name = stripHtml(data.name);
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('A valid email address is required.');
  } else if (data.email.length > 150) {
    errors.push('Email cannot exceed 150 characters.');
  } else {
    sanitized.email = data.email.trim();
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('A valid phone number is required.');
  } else if (data.phone.length > 20) {
    errors.push('Phone number cannot exceed 20 characters.');
  } else {
    sanitized.phone = data.phone.trim();
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters.');
  } else if (data.message.length > 1500) {
    errors.push('Message cannot exceed 1500 characters.');
  } else {
    sanitized.message = stripHtml(data.message);
  }

  return { isValid: errors.length === 0, errors, sanitized };
};

export const sanitizeAndValidateBooking = (data) => {
  const errors = [];
  const sanitized = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  } else if (data.name.length > 100) {
    errors.push('Name cannot exceed 100 characters.');
  } else {
    sanitized.name = stripHtml(data.name);
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('A valid email address is required.');
  } else if (data.email.length > 150) {
    errors.push('Email cannot exceed 150 characters.');
  } else {
    sanitized.email = data.email.trim();
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('A valid phone number is required.');
  } else if (data.phone.length > 20) {
    errors.push('Phone number cannot exceed 20 characters.');
  } else {
    sanitized.phone = data.phone.trim();
  }

  if (!data.brief || data.brief.trim().length < 10) {
    errors.push('Brief description is required and must be at least 10 characters.');
  } else if (data.brief.length > 1500) {
    errors.push('Brief description cannot exceed 1500 characters.');
  } else {
    sanitized.brief = stripHtml(data.brief);
  }

  if (data.type && data.type.length > 50) {
    errors.push('Invalid consultation type.');
  } else {
    sanitized.type = stripHtml(data.type || 'General Consultation');
  }

  return { isValid: errors.length === 0, errors, sanitized };
};

export const validateAdminArticle = (data) => {
  const errors = [];
  const sanitized = {};

  const checkString = (key, maxLen, required = true) => {
    if (required && (!data[key] || data[key].trim().length === 0)) {
      errors.push(`${key} is required.`);
    } else if (data[key] && data[key].length > maxLen) {
      errors.push(`${key} cannot exceed ${maxLen} characters.`);
    } else if (data[key]) {
      sanitized[key] = stripHtml(data[key]);
    } else {
      sanitized[key] = '';
    }
  };

  checkString('titleEn', 200);
  checkString('titleAr', 200);
  checkString('categoryEn', 100);
  checkString('categoryAr', 100);
  
  if (!data.contentEn || data.contentEn.length < 10) errors.push('English content is required.');
  else if (data.contentEn.length > 50000) errors.push('English content is too long (max 50000 chars).');
  else sanitized.contentEn = data.contentEn; // Rich text allowed here but size limited

  if (!data.contentAr || data.contentAr.length < 10) errors.push('Arabic content is required.');
  else if (data.contentAr.length > 50000) errors.push('Arabic content is too long (max 50000 chars).');
  else sanitized.contentAr = data.contentAr; // Rich text allowed here but size limited

  return { isValid: errors.length === 0, errors, sanitized };
};

export const sanitizeAndValidateSettings = (data) => {
  const errors = [];
  const sanitized = {};

  const checkField = (key, maxLen) => {
    if (data[key] && data[key].length > maxLen) {
      errors.push(`${key} exceeds maximum length of ${maxLen}.`);
    } else if (data[key]) {
      sanitized[key] = stripHtml(data[key]);
    } else {
      sanitized[key] = '';
    }
  };

  checkField('phone', 50);
  checkField('email', 150);
  checkField('hoursEn', 200);
  checkField('hoursAr', 200);
  checkField('linkedin', 200);
  checkField('youtube', 200);
  checkField('instagram', 200);
  checkField('whatsapp', 50);
  checkField('announceEn', 500);
  checkField('announceAr', 500);
  
  sanitized.announceVisible = !!data.announceVisible;

  return { isValid: errors.length === 0, errors, sanitized };
};
