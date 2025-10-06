import React from 'react';

interface ValidationMessagesProps {
  errors: { [key: string]: string };
}

const ValidationMessages: React.FC<ValidationMessagesProps> = ({ errors }) => {
  return (
    <div className="validation-messages">
      {Object.keys(errors).length > 0 && (
        <ul className="error-list">
          {Object.entries(errors).map(([field, message]) => (
            <li key={field} className="error-message">
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ValidationMessages;