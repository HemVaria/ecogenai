import React from 'react';

const EyeIcon = ({ isVisible, onClick }) => {
    return (
        <svg
            onClick={onClick}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`w-6 h-6 cursor-pointer ${isVisible ? 'text-green-500' : 'text-gray-500'}`}
        >
            {isVisible ? (
                <path d="M12 4.5C6.75 4.5 3 12 3 12s3.75 7.5 9 7.5 9-7.5 9-7.5-3.75-7.5-9-7.5z" />
            ) : (
                <path d="M12 4.5C6.75 4.5 3 12 3 12s3.75 7.5 9 7.5 9-7.5 9-7.5-3.75-7.5-9-7.5zM12 12c-1.5 0-3-1.5-3-1.5s1.5-1.5 3-1.5 3 1.5 3 1.5-1.5 1.5-3 1.5z" />
            )}
        </svg>
    );
};

export default EyeIcon;