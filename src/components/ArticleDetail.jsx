import React from 'react';
import { motion } from 'framer-motion';

export default function ArticleDetail({ article, lang, onGoToHome, articles, onArticleClick }) {
  if (!article) return null;

  const hasCover = article.coverImage && article.coverImage.length > 0;
  const hasVideo = article.video && article.video.length > 0;
  const hasAttachments = article.attachments && article.attachments.length > 0;

  const t = {
    back: lang === 'en' ? 'Back to Articles' : 'العودة للمقالات',
    home: lang === 'en' ? 'Home' : 'الرئيسية',
    articles: lang === 'en' ? 'Articles' : 'المقالات',
    attachmentsTitle: lang === 'en' ? 'Attached Documents' : 'المستندات المرفقة',
    download: lang === 'en' ? 'Download' : 'تحميل',
    relatedTitle: lang === 'en' ? 'Related Articles' : 'مقالات ذات صلة',
    by: lang === 'en' ? 'Published by SANAD Team' : 'نُشر بواسطة فريق سند',
  };

  // Get other articles for "Related Articles" sidebar/bottom bar
  const relatedArticles = articles.filter(a => a.id !== article.id).slice(0, 3);

  // Format file size for attachments
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen pt-[72px] font-sans text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ── Article Banner Header ── */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e2e6b] to-[#4c6cd0] text-white py-16 px-6 select-none">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#ffc57e] uppercase mb-3 block">
            {lang === 'en' ? article.categoryEn : article.categoryAr}
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight mb-4 leading-tight">
            {lang === 'en' ? article.titleEn : article.titleAr}
          </h1>
          <div className="flex items-center gap-4 justify-center md:justify-start text-slate-300 text-xs mt-2">
            <span>{article.date}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span>{t.by}</span>
          </div>
        </div>
      </div>

      {/* ── Breadcrumbs ── */}
      <div className="border-b border-slate-200/50 bg-white py-3 px-6 text-xs text-slate-400 select-none">
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 font-medium">
          <a href="#home" onClick={(e) => { e.preventDefault(); onGoToHome(); }} className="hover:text-[#4c6cd0] transition-colors">
            {t.home}
          </a>
          <span>/</span>
          <a href="#articles" onClick={(e) => { e.preventDefault(); onGoToHome(); }} className="hover:text-[#4c6cd0] transition-colors">
            {t.articles}
          </a>
          <span>/</span>
          <span className="text-slate-700 font-semibold truncate max-w-[200px]">
            {lang === 'en' ? article.titleEn : article.titleAr}
          </span>
        </div>
      </div>

      {/* ── Main Layout Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Article Content Column (Left/Center 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/40 p-6 md:p-8 shadow-sm">
            {/* Main Cover Image */}
            {hasCover && (
              <div className="rounded-xl overflow-hidden mb-6 bg-slate-50 border shadow-sm">
                <img
                  src={article.coverImage}
                  alt={lang === 'en' ? article.titleEn : article.titleAr}
                  className="w-full h-auto max-h-[380px] object-cover"
                />
              </div>
            )}

            {/* Content Body text */}
            <div className="text-slate-700 text-sm md:text-base leading-relaxed space-y-5 font-light">
              {(lang === 'en' ? article.contentEn : article.contentAr).split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Video Playback Section */}
            {hasVideo && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {lang === 'en' ? 'Video Briefing' : 'شرح مرئي'}
                </h3>
                {article.video.startsWith('data:') || article.video.startsWith('blob:') ? (
                  <div className="rounded-xl overflow-hidden bg-black aspect-video border shadow-inner">
                    <video src={article.video} controls className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <span className="text-2xl">📹</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{article.videoName || 'Video Attachment'}</h4>
                      <p className="text-[10px] text-slate-400">{lang === 'en' ? 'Video playback is active in current session.' : 'تشغيل الفيديو متاح خلال الجلسة الحالية.'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attachments Section */}
            {hasAttachments && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
                  <span>📎</span> {t.attachmentsTitle}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {article.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/50 bg-[#faf8f4] flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-xl flex-shrink-0">📄</span>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
                      <a
                        href={file.data || '#'}
                        download={file.name}
                        className="px-4 py-1.5 rounded-lg bg-[#4c6cd0] hover:bg-[#314b9b] text-white text-[10px] font-bold transition-all shadow-sm shadow-[#4c6cd0]/10 flex items-center gap-1 flex-shrink-0"
                      >
                        <span>⬇️</span>
                        <span>{t.download}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back Button Footer */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex">
              <button
                onClick={onGoToHome}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-[#4c6cd0] hover:border-[#4c6cd0]/35 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>{lang === 'ar' ? '→' : '←'}</span>
                <span>{t.back}</span>
              </button>
            </div>
          </div>

          {/* Related Articles Column (Right 1/3) */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/40 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2.5 border-b border-slate-100">
                  {t.relatedTitle}
                </h3>
                <div className="flex flex-col gap-4">
                  {relatedArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => onArticleClick(art.id)}
                      className="cursor-pointer group flex flex-col gap-1.5"
                    >
                      <span className="text-[9px] font-extrabold uppercase text-[#4c6cd0] tracking-wider">
                        {lang === 'en' ? art.categoryEn : art.categoryAr}
                      </span>
                      <h4 className="text-xs font-bold text-slate-700 leading-snug group-hover:text-[#4c6cd0] transition-colors line-clamp-2">
                        {lang === 'en' ? art.titleEn : art.titleAr}
                      </h4>
                      <span className="text-[10px] text-slate-400">{art.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
