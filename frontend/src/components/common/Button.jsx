import React from 'react';
import './Button.css';

export function Button({ children, variant = 'primary', size = 'md', fullWidth = false,
  loading = false, disabled = false, type = 'button', onClick, className = '', ...rest }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="btn__spinner" />}
      <span>{children}</span>
    </button>
  );
}
