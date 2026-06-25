import React from 'react';

export default function Footer({ onPortalClick }) {
  return (
    <footer className="py-12 bg-[#1e293b] text-[#faf8f4]/60 text-center border-t border-white/5 font-sans">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm">
          &copy; 2026 SANAD. BY Dr. AWWA. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-[#faf8f4]/50">
          <a 
            href="#admin" 
            onClick={(e) => {
              e.preventDefault();
              if (onPortalClick) onPortalClick('admin');
            }}
            className="hover:text-[#ffc57e] transition-colors"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
