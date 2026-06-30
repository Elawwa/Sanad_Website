import emailjs from '@emailjs/browser';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Verify configuration helper
const isConfigured = () => {
  return serviceId && publicKey && 
         serviceId !== 'YOUR_EMAILJS_SERVICE_ID' && 
         publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY';
};

/**
 * Sends booking emails (Admin notification + Client auto-responder)
 */
export const sendBookingEmails = async (bookingData) => {
  if (!isConfigured()) {
    console.warn('EmailJS is not fully configured. Skipping booking emails. Please set VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_PUBLIC_KEY in your .env file.');
    return;
  }

  const adminTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN_BOOKING;
  const clientTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_CLIENT_BOOKING;

  // 1. Send Admin Notification
  if (adminTemplateId) {
    try {
      await emailjs.send(serviceId, adminTemplateId, {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        brief: bookingData.brief,
        type: bookingData.type,
        ref: bookingData.ref,
        date: bookingData.date,
      }, publicKey);
      console.log('EmailJS: Admin booking notification sent successfully');
    } catch (error) {
      console.error('EmailJS: Failed to send admin booking notification:', error);
    }
  }

  // 2. Send Client Auto-responder
  if (clientTemplateId) {
    try {
      await emailjs.send(serviceId, clientTemplateId, {
        to_name: bookingData.name,
        to_email: bookingData.email,
        ref: bookingData.ref,
        type: bookingData.type,
        date: bookingData.date,
      }, publicKey);
      console.log('EmailJS: Client booking auto-responder sent successfully');
    } catch (error) {
      console.error('EmailJS: Failed to send client booking auto-responder:', error);
    }
  }
};

/**
 * Sends contact emails (Admin notification + Client auto-responder)
 */
export const sendContactEmails = async (contactData) => {
  if (!isConfigured()) {
    console.warn('EmailJS is not fully configured. Skipping contact emails. Please set VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_PUBLIC_KEY in your .env file.');
    return;
  }

  const adminTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN_CONTACT;
  const clientTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_CLIENT_CONTACT;

  // 1. Send Admin Notification
  if (adminTemplateId) {
    try {
      await emailjs.send(serviceId, adminTemplateId, {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: contactData.message,
      }, publicKey);
      console.log('EmailJS: Admin contact notification sent successfully');
    } catch (error) {
      console.error('EmailJS: Failed to send admin contact notification:', error);
    }
  }

  // 2. Send Client Auto-responder
  if (clientTemplateId) {
    try {
      await emailjs.send(serviceId, clientTemplateId, {
        to_name: contactData.name,
        to_email: contactData.email,
      }, publicKey);
      console.log('EmailJS: Client contact auto-responder sent successfully');
    } catch (error) {
      console.error('EmailJS: Failed to send client contact auto-responder:', error);
    }
  }
};
