import React, { useState } from 'react';

export default function CustomDialog({
  isOpen,
  type = 'alert',
  title,
  message,
  placeholder = '',
  defaultValue = '',
  onConfirm,
  onCancel,
  lang = 'en'
}) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const isRtl = lang === 'ar';

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (type === 'prompt' && (!inputValue || inputValue.trim() === '')) {
      setError(true);
      return;
    }
    setError(false);
    if (type === 'prompt') {
      onConfirm(inputValue.trim());
    } else {
      onConfirm();
    }
  };

  const handleCancelClick = () => {
    setError(false);
    onCancel();
  };

  const t = {
    ok: lang === 'en' ? 'OK' : 'موافق',
    cancel: lang === 'en' ? 'Cancel' : 'إلغاء',
    confirm: lang === 'en' ? 'Confirm' : 'تأكيد',
    submit: lang === 'en' ? 'Submit' : 'إرسال',
    required: lang === 'en' ? 'This field is required.' : 'هذا الحقل مطلوب.',
  };

  const getDialogIcon = () => {
    if (type === 'confirm') return '❓';
    if (type === 'prompt') return '📅';
    return '🔔';
  };

  return (
    <div className="modal-overlay custom-dialog-overlay" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="modal-container custom-dialog-card">
        <div className="modal-header">
          <span className="dialog-icon">{getDialogIcon()}</span>
          {title && <h3>{title}</h3>}
          <p className="dialog-message">{message}</p>
        </div>

        <form onSubmit={handleConfirmSubmit}>
          {type === 'prompt' && (
            <div className="input-group">
              <input
                type="text"
                className={`custom-dialog-input ${error ? 'input-error' : ''}`}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (e.target.value.trim() !== '') setError(false);
                }}
                autoFocus
                required
              />
              {error && <p className="error-msg">{t.required}</p>}
            </div>
          )}

          <div className="custom-dialog-actions">
            {type !== 'alert' && (
              <button
                type="button"
                className="btn-secondary custom-dialog-btn"
                onClick={handleCancelClick}
              >
                {t.cancel}
              </button>
            )}
            <button
              type="submit"
              className="btn-primary custom-dialog-btn"
            >
              {type === 'prompt' ? t.submit : type === 'confirm' ? t.confirm : t.ok}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
