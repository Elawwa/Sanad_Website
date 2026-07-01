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
 * Sends contact emails:
 * 1. Admin notification via Web3Forms (directly to admin inbox)
 * 2. Client auto-responder via EmailJS (if VITE_EMAILJS_TEMPLATE_CLIENT_CONTACT is set)
 */
export const sendContactEmails = async (contactData) => {
  // 1. Send Admin Notification via Web3Forms
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (accessKey) {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          from_name: 'Sanad Consulting Website',
          subject: `New Contact Message from ${contactData.name}`,
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          message: contactData.message
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Web3Forms: Email notification sent successfully to Admin.');
      } else {
        console.error('Web3Forms: API returned failure:', result.message || result);
      }
    } catch (error) {
      console.error('Web3Forms: Error submitting contact form to Web3Forms:', error);
    }
  } else {
    console.warn('Web3Forms access key is not configured. Skipping Admin email notification.');
  }

  // 2. Send Client Auto-responder via EmailJS
  const clientTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_CLIENT_CONTACT;
  
  if (isConfigured() && clientTemplateId) {
    try {
      await emailjs.send(serviceId, clientTemplateId, {
        to_name: contactData.name,
        to_email: contactData.email,
      }, publicKey);
      console.log('EmailJS: Client contact auto-responder sent successfully');
    } catch (error) {
      console.error('EmailJS: Failed to send client contact auto-responder:', error);
    }
  } else {
    console.warn('EmailJS is not fully configured for Contact auto-responder. Skipping Client email.');
  }
};
