import React from 'react';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { cn } from '../../lib/cn';

interface FormFieldProps {
  label: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  isValid: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, type, name, icon, value, onChange, error, isValid }) => {
  const { isValidating } = useRealtimeValidation(value, name);

  return (
    <div className="relative mb-6">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(
          'peer block w-full rounded-md border border-gray-300 bg-transparent py-2 px-3 text-gray-900 placeholder-transparent focus:border-green-500 focus:outline-none focus:ring-0',
          {
            'border-red-500': error,
            'border-green-500': isValid && !error,
          }
        )}
        placeholder=" "
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-2 origin-[0] transform scale-75 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:scale-100 peer-focus:-top-1 peer-focus:left-3 peer-focus:-translate-y-1/2 peer-focus:scale-75"
      >
        {label}
      </label>
      <span className="absolute left-3 top-2">{icon}</span>
      {isValidating && <span className="text-green-500">Validating...</span>}
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
};

export default FormField;