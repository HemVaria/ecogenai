import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  type = 'button',
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`transition duration-300 ease-in-out transform bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-2 px-4 rounded shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;