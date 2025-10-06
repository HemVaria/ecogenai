import React from 'react';
import { useField } from 'formik';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, icon, ...props }) => {
  const [field, meta] = useField(props);
  const isError = meta.touched && Boolean(meta.error);

  return (
    <div className="relative mb-6">
      <input
        {...field}
        {...props}
        className={cn(
          'peer block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-gray-900 placeholder-transparent focus:border-green-500 focus:outline-none focus:ring-0',
          {
            'border-red-500': isError,
          }
        )}
        placeholder=" "
      />
      <label
        className={cn(
          'absolute left-3 top-2 origin-[0] transform scale-100 text-gray-500 transition-all duration-200 ease-in-out peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-focus:-top-4 peer-focus:scale-75',
          {
            'text-red-500': isError,
          }
        )}
      >
        {label}
      </label>
      <span className="absolute left-3 top-2">{icon}</span>
      {isError && (
        <div className="mt-1 text-red-500 text-sm">{meta.error}</div>
      )}
    </div>
  );
};

export default Input;