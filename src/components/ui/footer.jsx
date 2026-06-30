import React from "react"
import { Button } from "@/components/ui/button"

export function Footer({
  logo,
  brandName,
  socialLinks = [],
  legalLinks = [],
  copyright,
}) {
  return (
    <footer className="pb-8 pt-12 bg-[#0f172a] text-slate-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          <a
            href="/"
            className="flex items-center gap-x-2 text-white hover:opacity-90 transition-all"
            aria-label={brandName}
          >
            {logo}
          </a>
          <ul className="flex list-none m-0 p-0 space-x-3">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
                  asChild
                >
                  <a href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6 text-xs">
          <div className="text-slate-500">
            <div>{copyright.text} {copyright.license}</div>
          </div>
          <ul className="list-none flex flex-wrap m-0 p-0 gap-6">
            {legalLinks.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
