import React from 'react';
import { Mail } from 'lucide-react';
import { Footer as BaseFooter } from './ui/footer';

export default function Footer({ siteSettings = {}, lang = 'en' }) {
  // Build logo node (using the white brand logo matching the deep blue background)
  const logo = (
    <img 
      src={lang === 'ar' ? "/logo-white-ar.png" : "/logo-white.png"} 
      alt="Sanad Consulting Logo" 
      className="h-16 object-contain select-none" 
    />
  );

  // Build social links array from site settings
  const socialLinks = [];
  if (siteSettings.linkedin) {
    socialLinks.push({
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      href: siteSettings.linkedin,
      label: "LinkedIn"
    });
  }
  if (siteSettings.email) {
    socialLinks.push({
      icon: <Mail className="w-4 h-4" />,
      href: `mailto:${siteSettings.email}`,
      label: "Email"
    });
  }
  if (siteSettings.youtube) {
    socialLinks.push({
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163c-.272-.98-1.04-1.748-2.02-2.02C19.82 3.7 12 3.7 12 3.7s-7.82 0-9.48.443c-.98.272-1.748 1.04-2.02 2.02C0 7.83 0 12 0 12s0 4.17.5 5.837c.272.98 1.04 1.748 2.02 2.02C4.18 20.3 12 20.3 12 20.3s7.82 0 9.48-.443c.98-.272 1.748-1.04 2.02-2.02C24 16.17 24 12 24 12s0-4.17-.5-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      href: siteSettings.youtube,
      label: "YouTube"
    });
  }
  if (siteSettings.instagram) {
    socialLinks.push({
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
      href: siteSettings.instagram,
      label: "Instagram"
    });
  }
  if (siteSettings.whatsapp) {
    const whatsappLink = siteSettings.whatsapp.startsWith('http') 
      ? siteSettings.whatsapp 
      : `https://wa.me/${siteSettings.whatsapp.replace(/\D/g, '')}`;
    socialLinks.push({
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.446L0 24zm6.59-4.846c1.6.95 3.498 1.45 5.419 1.451 5.428 0 9.845-4.42 9.849-9.852.002-2.63-1.02-5.102-2.871-6.958C17.19 1.989 14.718.963 12.01.963c-5.437 0-9.857 4.42-9.86 9.854a9.814 9.814 0 0 0 1.5 5.05l-.991 3.616 3.702-.97a9.782 9.782 0 0 0 4.696 1.189zm8.95-6.84c-.244-.122-1.445-.713-1.668-.795-.223-.082-.385-.122-.548.122-.162.244-.63.795-.772.957-.142.163-.284.183-.528.06-.244-.12-1.03-.38-1.962-1.212-.724-.646-1.213-1.443-1.355-1.687-.142-.244-.015-.376.107-.497.11-.11.244-.285.366-.427.122-.142.163-.244.244-.407.082-.163.04-.306-.02-.427-.06-.122-.548-1.32-.75-1.81-.197-.474-.396-.41-.548-.417-.142-.007-.305-.007-.468-.007a.899.899 0 0 0-.65.305c-.223.244-.853.834-.853 2.031 0 1.197.87 2.353.99 2.516.122.163 1.713 2.616 4.15 3.668.58.25 1.033.4 1.385.512.582.185 1.112.159 1.53.097.466-.069 1.445-.59 1.648-1.16.203-.572.203-1.06.142-1.16-.06-.1-.223-.163-.467-.285z"/>
        </svg>
      ),
      href: whatsappLink,
      label: "WhatsApp"
    });
  }

  const legalLinks = [];

  // Build copyright text (support Arabic / English)
  const copyright = {
    text: lang === 'en' ? "© 2026 Sanad Consulting FZE." : "© 2026 سند للاستشارات.",
    license: lang === 'en' ? "All rights reserved." : "جميع الحقوق محفوظة."
  };

  return (
    <BaseFooter
      logo={logo}
      brandName={lang === 'en' ? "Sanad Consulting" : "سند للاستشارات"}
      socialLinks={socialLinks}
      legalLinks={legalLinks}
      copyright={copyright}
    />
  );
}
