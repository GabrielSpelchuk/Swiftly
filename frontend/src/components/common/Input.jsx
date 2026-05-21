import React from 'react';
import './Input.css';

export function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <input id={id} className={`field__input ${error ? 'field__input--error' : ''}`} {...props} />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Select({ label, error, id, children, className = '', ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <select id={id} className={`field__input field__select ${error ? 'field__input--error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
