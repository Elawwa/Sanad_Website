import React from 'react';
import RPNInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function PhoneInput({ id, value, onChange, required, lang, placeholder }) {
  const defaultPlaceholder = lang === 'en' ? 'Enter phone number' : 'أدخل رقم الهاتف';
  
  return (
    <RPNInput
      id={id}
      international
      defaultCountry="AE"
      value={value}
      onChange={(val) => onChange(val || '')}
      placeholder={placeholder || defaultPlaceholder}
      required={required}
      className="custom-phone-input"
    />
  );
}
