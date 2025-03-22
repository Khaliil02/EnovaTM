import React from 'react';

const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  error = '',
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormInput;