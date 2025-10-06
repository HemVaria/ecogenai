import React from 'react';

const Card = ({ children }) => {
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;