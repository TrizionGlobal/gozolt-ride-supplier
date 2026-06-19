'use client';

import * as React from 'react';
import { PhoneInput as IntlPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput = React.forwardRef<any, PhoneInputProps>(
  ({ value = '', onChange, placeholder = 'Enter Mobile Number', disabled, className }, ref) => {
    // If the input border is configured for the driver pages (using #3F3F46),
    // append the border-custom-driver class to adapt our global dark overrides.
    const isDriverBorder = className?.includes('!border-[#3F3F46]');
    const containerClassName = `react-international-phone-input-container ${
      isDriverBorder ? 'border-custom-driver' : ''
    } ${className || ''}`;

    return (
      <IntlPhoneInput
        ref={ref}
        defaultCountry="mt"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={containerClassName}
        forceDialCode={true}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
